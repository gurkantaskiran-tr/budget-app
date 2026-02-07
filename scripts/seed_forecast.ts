
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as fs from 'fs';

const prisma = new PrismaClient();

const FILES = {
    expense: '/Users/gurkantaskiran/Yandex.Disk.localized/Code/Budget App/Sample/gider listesi.xlsx',
    income: '/Users/gurkantaskiran/Yandex.Disk.localized/Code/Budget App/Sample/satis-faturalari.xlsx'
};

// Excel date to JS Date
function excelDateToJSDate(serial: number) {
    return new Date(Math.round((serial - 25569) * 86400 * 1000));
}

async function processFile(filePath: string, type: 'INCOME' | 'EXPENSE') {
    const buf = fs.readFileSync(filePath);
    const wb = XLSX.read(buf, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const data: any[] = XLSX.utils.sheet_to_json(sheet);

    console.log(`Processing ${type} file: ${data.length} rows`);

    const aggregated2025: Record<string, { amount: number, companyName: string, categoryName: string, month: number }> = {};

    for (const row of data) {
        // Map columns based on inspection
        const dateSerial = row['Düzenleme tarihi'];
        if (!dateSerial || typeof dateSerial !== 'number') continue;

        const date = excelDateToJSDate(dateSerial);
        const year = date.getFullYear();

        // Filter for 2025 (and maybe late 2024 if needed, but user said "past years")
        // User said: "forecast based on past years... especially 2025". Let's stick to 2025 data for the 2026 base.
        if (year !== 2025) continue;

        const month = date.getMonth() + 1; // 1-12
        const amount = row['Genel Toplam (TL)'] || 0;

        // Expense File: 'Tedarikçi / Çalışan', Income File: 'Müşteri' (or 'Müşteri Kısa Adı' if preferred)
        let companyName = type === 'EXPENSE' ? row['Tedarikçi / Çalışan'] : row['Müşteri'];
        // Fallback or cleanup
        if (!companyName) companyName = "Bilinmeyen Cari";

        // Category
        let categoryName = row['Kategori'];
        if (!categoryName) categoryName = "Genel";

        // Aggregate Key: Month-Category-Company pattern might be too granular for budget. 
        // Usually budget is set per Category per Month. 
        // But our system links Entry to Company AND Category.
        // So we will try to preserve Company if possible, or group by Category and assign to a "Budget Planning" company?
        // Let's try to keep granularity: Month + Category + Company.
        const key = `${month}-${categoryName}-${companyName}`;

        if (!aggregated2025[key]) {
            aggregated2025[key] = {
                amount: 0,
                companyName: String(companyName).trim(),
                categoryName: String(categoryName).trim(),
                month: month
            };
        }
        aggregated2025[key].amount += amount;
    }

    // Now seed 2026 Budget
    console.log(`Found ${Object.keys(aggregated2025).length} aggregated data points for 2025.`);

    for (const key in aggregated2025) {
        const item = aggregated2025[key];

        // 1. Find or Create Company
        let company = await prisma.company.findUnique({ where: { name: item.companyName } });
        if (!company) {
            company = await prisma.company.create({ data: { name: item.companyName } });
        }

        // 2. Find or Create Category
        // Note: Category names in Excel might match existing ones but case-sensitive?
        // Let's ignore case finding? For now simple find.
        let category = await prisma.category.findFirst({
            where: { name: item.categoryName, type: type }
        });

        if (!category) {
            // Try updating existing category if name matches but type is different? No, schema splits them.
            // Just create new
            category = await prisma.category.create({
                data: { name: item.categoryName, type: type }
            });
        }

        // 3. Create 2026 Budget Entry
        // Forecast Logic: 2025 Actual + 10%
        const forecastAmount = item.amount * 1.10;

        await prisma.entry.create({
            data: {
                companyId: company.id,
                categoryId: category.id,
                month: item.month,
                year: 2026,
                budgetAmount: forecastAmount,
                actualAmount: 0, // This is a budget entry
                description: "2026 Bütçe Planlaması (Otomatik)"
            }
        });
    }
}

async function main() {
    // Clear existing 2026 entries? Maybe specific ones? 
    // For now, let's assume we are adding to it or user wants fresh start.
    // Let's NOT delete everything to avoid losing manual entries if any.

    console.log("Starting Forecast Generation...");

    await processFile(FILES.expense, 'EXPENSE');
    await processFile(FILES.income, 'INCOME');

    console.log("Forecast Generation Complete!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
