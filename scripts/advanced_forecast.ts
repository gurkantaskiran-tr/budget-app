
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as fs from 'fs';

const prisma = new PrismaClient();

const FILES = {
    expense: '/Users/gurkantaskiran/Yandex.Disk.localized/Code/Budget App/Sample/gider listesi.xlsx',
    income: '/Users/gurkantaskiran/Yandex.Disk.localized/Code/Budget App/Sample/satis-faturalari.xlsx'
};

// --- Statistical Helper Functions --- //

interface DataPoint {
    monthIndex: number; // 0 to N (continuous month counter from start of data)
    value: number;
    monthOfYear: number; // 0-11 (Jan-Dec)
}

// 1. Linear Regression (Least Squares Method)
function calculateLinearRegression(data: DataPoint[]) {
    const n = data.length;
    if (n < 2) return { slope: 0, intercept: 0 }; // Not enough data for trend

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    for (const p of data) {
        sumX += p.monthIndex;
        sumY += p.value;
        sumXY += p.monthIndex * p.value;
        sumXX += p.monthIndex * p.monthIndex;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
}

// 2. Seasonality Indices (Ratio-to-Trend Method)
function calculateSeasonalIndices(data: DataPoint[], slope: number, intercept: number) {
    const seasonalRatios: { [month: number]: number[] } = {};

    // Initialize
    for (let i = 0; i < 12; i++) seasonalRatios[i] = [];

    // Calculate ratio of Actual / Trend for each point
    for (const p of data) {
        const trendValue = slope * p.monthIndex + intercept;
        // Avoid division by zero or negative trend in denominator if possible, though trendValue could be anything.
        // If trendValue is too small, ratio is unstable.
        if (trendValue > 1) {
            const ratio = p.value / trendValue;
            seasonalRatios[p.monthOfYear].push(ratio);
        } else {
            // Fallback: assume neutral seasonality if trend is negligible
            seasonalRatios[p.monthOfYear].push(1.0);
        }
    }

    // Average the ratios for each month to get Seasonal Index
    const seasonalIndices: { [month: number]: number } = {};
    for (let i = 0; i < 12; i++) {
        const ratios = seasonalRatios[i];
        if (ratios.length > 0) {
            const sum = ratios.reduce((a, b) => a + b, 0);
            seasonalIndices[i] = sum / ratios.length;
        } else {
            seasonalIndices[i] = 1.0; // Default to no seasonality
        }
    }

    return seasonalIndices;
}

// --- Main Logic --- //

// Excel date to JS Date
function excelDateToJSDate(serial: number) {
    return new Date(Math.round((serial - 25569) * 86400 * 1000));
}

async function processFile(filePath: string, type: 'INCOME' | 'EXPENSE') {
    const buf = fs.readFileSync(filePath);
    const wb = XLSX.read(buf, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const data: any[] = XLSX.utils.sheet_to_json(sheet);

    console.log(`\nAnalyzing ${type} data for statistical modeling...`);

    // Group raw data by Category -> [Date, Amount]
    const categoryTimeSeries: Record<string, { date: Date, amount: number, company: string }[]> = {};

    for (const row of data) {
        const dateSerial = row['Düzenleme tarihi'];
        if (!dateSerial || typeof dateSerial !== 'number') continue;
        const date = excelDateToJSDate(dateSerial);
        const amount = row['Genel Toplam (TL)'] || 0;

        let categoryName = row['Kategori'];
        if (!categoryName) categoryName = "Genel";
        categoryName = String(categoryName).trim();

        // Company (for distribution later)
        let companyName = type === 'EXPENSE' ? row['Tedarikçi / Çalışan'] : row['Müşteri'];
        if (!companyName) companyName = "Bilinmeyen Cari";
        companyName = String(companyName).trim();

        if (!categoryTimeSeries[categoryName]) {
            categoryTimeSeries[categoryName] = [];
        }
        categoryTimeSeries[categoryName].push({ date, amount, company: companyName });
    }

    // Process each Category
    for (const categoryName in categoryTimeSeries) {
        const rawEntries = categoryTimeSeries[categoryName];

        // 1. Sort by Date
        rawEntries.sort((a, b) => a.date.getTime() - b.date.getTime());

        // 2. Aggregate to Monthly Bins for Time Series Analysis
        // We need continuous months.
        if (rawEntries.length === 0) continue;

        const firstDate = rawEntries[0].date;
        const lastDate = rawEntries[rawEntries.length - 1].date;

        // Map: "YYYY-MM" -> Total Amount
        const monthlyAggregates: Record<string, number> = {};

        // Helper to get key
        const getMonthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

        // Fill aggregates
        for (const entry of rawEntries) {
            monthlyAggregates[getMonthKey(entry.date)] = (monthlyAggregates[getMonthKey(entry.date)] || 0) + entry.amount;
        }

        // Create Data Points for Regression
        const dataPoints: DataPoint[] = [];
        let currentDate = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
        const endDate = new Date(lastDate.getFullYear(), lastDate.getMonth(), 1);
        let index = 0;

        while (currentDate <= endDate) {
            const key = getMonthKey(currentDate);
            const val = monthlyAggregates[key] || 0;

            dataPoints.push({
                monthIndex: index,
                value: val,
                monthOfYear: currentDate.getMonth() // 0-11
            });

            // Next month
            currentDate.setMonth(currentDate.getMonth() + 1);
            index++;
        }

        // 3. Run Statistical Model
        // A. Linear Trend
        const { slope, intercept } = calculateLinearRegression(dataPoints);

        // B. Seasonality
        const seasonalIndices = calculateSeasonalIndices(dataPoints, slope, intercept);

        // 4. Forecast 2026
        // We need to project for the months of 2026.
        // Use the 'index' counter continuing from where we left off.
        // Find how many months from 'firstDate' to Jan 2026.
        const start2026 = new Date(2026, 0, 1);
        // Calculate month difference
        const monthsUntil2026 = (start2026.getFullYear() - firstDate.getFullYear()) * 12 + (start2026.getMonth() - firstDate.getMonth());

        // Create 2026 Forecast Entries
        // Ensure Category exists
        let category = await prisma.category.findFirst({ where: { name: categoryName, type: type } });
        if (!category) {
            category = await prisma.category.create({ data: { name: categoryName, type: type } });
        }

        // For distribution: Find top company in this category to assign the budget to (or split?)
        // To keep it clean, let's assign the full category budget to the most frequent company in that category.
        const companyCounts: Record<string, number> = {};
        for (const e of rawEntries) {
            companyCounts[e.company] = (companyCounts[e.company] || 0) + 1;
        }
        const topCompany = Object.entries(companyCounts).sort((a, b) => b[1] - a[1])[0][0];

        let company = await prisma.company.findUnique({ where: { name: topCompany } });
        if (!company) {
            company = await prisma.company.create({ data: { name: topCompany } });
        }

        console.log(`[${categoryName}] Trend Slope: ${slope.toFixed(2)}, Intercept: ${intercept.toFixed(2)}. Forecasting 12 months for 2026...`);

        for (let i = 0; i < 12; i++) {
            const forecastMonthIndex = monthsUntil2026 + i;

            // Linear Projection
            let trendProjection = slope * forecastMonthIndex + intercept;

            // Apply Seasonality (i is 0-11 for Jan-Dec 2026)
            let seasonalProjection = trendProjection * seasonalIndices[i];

            // Safety floor (no negative budget unless it's a refund category?)
            // Let's assume budgets are positive.
            if (seasonalProjection < 0) seasonalProjection = 0;

            // If regression failed (flat line 0), try average?
            if (seasonalProjection === 0 && dataPoints.some(p => p.value > 0)) {
                // Fallback to simple average of observed data
                const avg = dataPoints.reduce((s, p) => s + p.value, 0) / dataPoints.length;
                seasonalProjection = avg * 1.10; // +10% inflation fallback
            }

            // Save to DB
            await prisma.entry.create({
                data: {
                    companyId: company.id,
                    categoryId: category.id,
                    month: i + 1,
                    year: 2026,
                    budgetAmount: seasonalProjection,
                    actualAmount: 0,
                    description: `2026 ${i + 1}. Ay Tahmini (Model: LinReg+Seas)`
                }
            });
        }
    }
}

async function main() {
    // Clean up previous 2026 budget entries to avoid duplication
    console.log("Cleaning up previous 2026 budget entries...");
    await prisma.entry.deleteMany({
        where: { year: 2026, budgetAmount: { gt: 0 }, actualAmount: 0 }
    });

    await processFile(FILES.expense, 'EXPENSE');
    await processFile(FILES.income, 'INCOME');

    console.log("Statistical Forecast Complete!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
