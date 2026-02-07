"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getDashboardData(filters?: {
    companyId?: number
    categoryId?: number
    month?: number
    year?: number
}) {
    const currentYear = filters?.year || new Date().getFullYear() // Default to 2026 if not specified, or current year

    // Build helper where clause for common filters
    // Note: We need to handle IN/EX separately for totals, but company/month/year apply to all.
    const baseWhere: any = {}

    if (filters?.companyId) baseWhere.companyId = filters.companyId
    if (filters?.categoryId) baseWhere.categoryId = filters.categoryId
    if (filters?.month) baseWhere.month = filters.month
    baseWhere.year = currentYear

    const [
        totalBudgetIncome,
        totalActualIncome,
        totalBudgetExpense,
        totalActualExpense,
        recentEntries,
        monthlyActualData,
        monthlyBudgetData,
        expenseCategories,
        companyBudgetData,
        categoryBudgetData,
        allCompanies
    ] = await Promise.all([
        prisma.entry.aggregate({
            _sum: { budgetAmount: true },
            where: { ...baseWhere, category: { type: "INCOME" } }
        }),
        prisma.entry.aggregate({
            _sum: { actualAmount: true },
            where: { ...baseWhere, category: { type: "INCOME" } }
        }),
        prisma.entry.aggregate({
            _sum: { budgetAmount: true },
            where: { ...baseWhere, category: { type: "EXPENSE" } }
        }),
        prisma.entry.aggregate({
            _sum: { actualAmount: true },
            where: { ...baseWhere, category: { type: "EXPENSE" } }
        }),
        prisma.entry.findMany({
            take: 5,
            orderBy: { id: 'desc' },
            where: baseWhere,
            include: {
                company: true,
                category: true
            }
        }),
        // Fetch monthly actual data
        prisma.entry.groupBy({
            by: ['month', 'categoryId'],
            _sum: {
                actualAmount: true
            },
            where: baseWhere
        }),
        // Fetch monthly budget data
        prisma.entry.groupBy({
            by: ['month', 'categoryId'],
            _sum: {
                budgetAmount: true
            },
            where: baseWhere
        }),
        // Fetch categories to map IDs back to types for the chart
        prisma.category.findMany(),
        // Fetch budget by company (for new chart)
        prisma.entry.groupBy({
            by: ['companyId'],
            _sum: {
                budgetAmount: true
            },
            where: { ...baseWhere, category: { type: "EXPENSE" } }
        }),
        // Fetch budget by category (for new chart)
        prisma.entry.groupBy({
            by: ['categoryId'],
            _sum: {
                budgetAmount: true
            },
            where: { ...baseWhere, category: { type: "EXPENSE" } }
        }),
        // Fetch all companies for mapping
        prisma.company.findMany()
    ])

    // Process monthly data for the chart
    // If a specific month is selected, we might still want to show the context of the year or just that month.
    // Usually dashboards show the trend for the selected YEAR, filtered by company/category. 
    // If MONTH is selected, the trend chart is less useful (single point), but stats are correct.
    const trendData = Array.from({ length: 12 }, (_, i) => ({
        name: new Date(0, i).toLocaleString('tr-TR', { month: 'short' }),
        income: 0,
        expense: 0,
        budgetIncome: 0,
        budgetExpense: 0
    }))

    // Process category distribution for Pie Chart
    const categoryDistribution: Record<string, number> = {}

    // Process Actuals
    monthlyActualData.forEach(item => {
        const monthIndex = item.month - 1
        const category = expenseCategories.find(c => c.id === item.categoryId)
        const amount = item._sum.actualAmount || 0

        if (category?.type === "INCOME") {
            if (monthIndex >= 0 && monthIndex < 12) trendData[monthIndex].income += amount
        } else if (category?.type === "EXPENSE") {
            if (monthIndex >= 0 && monthIndex < 12) trendData[monthIndex].expense += amount

            // Add to category distribution
            if (category) {
                categoryDistribution[category.name] = (categoryDistribution[category.name] || 0) + amount
            }
        }
    })

    // Process Budgets
    monthlyBudgetData.forEach(item => {
        const monthIndex = item.month - 1
        const category = expenseCategories.find(c => c.id === item.categoryId)
        const amount = item._sum.budgetAmount || 0

        if (category?.type === "INCOME") {
            if (monthIndex >= 0 && monthIndex < 12) trendData[monthIndex].budgetIncome += amount
        } else if (category?.type === "EXPENSE") {
            if (monthIndex >= 0 && monthIndex < 12) trendData[monthIndex].budgetExpense += amount
        }
    })

    const pieChartData = Object.entries(categoryDistribution)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5) // Top 5 categories

    // Process company budget distribution
    const companyBudgetDistribution = companyBudgetData
        .map(item => {
            const company = allCompanies.find(c => c.id === item.companyId)
            return {
                name: company?.name || 'Bilinmeyen',
                value: item._sum.budgetAmount || 0
            }
        })
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 6) // Top 6 companies

    // Process category budget distribution (expense categories only)
    const categoryBudgetDistribution = categoryBudgetData
        .map(item => {
            const category = expenseCategories.find(c => c.id === item.categoryId)
            return {
                name: category?.name || 'Bilinmeyen',
                value: item._sum.budgetAmount || 0
            }
        })
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, 8) // Top 8 categories

    return {
        income: {
            budget: totalBudgetIncome._sum.budgetAmount || 0,
            actual: totalActualIncome._sum.actualAmount || 0
        },
        expense: {
            budget: totalBudgetExpense._sum.budgetAmount || 0,
            actual: totalActualExpense._sum.actualAmount || 0
        },
        recentEntries,
        trendData,
        pieChartData,
        companyBudgetDistribution,
        categoryBudgetDistribution
    }
}

export async function getEntries(type: "INCOME" | "EXPENSE") {
    return await prisma.entry.findMany({
        where: {
            category: {
                type: type
            }
        },
        include: {
            company: true,
            category: true
        },
        orderBy: {
            month: 'desc' // or whatever order
        }
    })
}

export async function getMasterData() {
    const [companies, categories] = await Promise.all([
        prisma.company.findMany(),
        prisma.category.findMany()
    ])
    return { companies, categories }
}

export async function createEntry(data: {
    companyId: number,
    categoryId: number,
    month: number,
    year: number,
    budgetAmount: number,
    actualAmount: number,
    description?: string
    isRecurring?: boolean
    repeatCount?: number
}) {
    const loopCount = data.isRecurring && data.repeatCount ? data.repeatCount : 1
    let currentMonth = typeof data.month === 'string' ? parseInt(data.month) : data.month
    let currentYear = data.year

    const entriesToCreate = []

    for (let i = 0; i < loopCount; i++) {
        // Adjust month/year for current iteration
        const effectiveMonth = currentMonth
        const effectiveYear = currentYear

        entriesToCreate.push({
            companyId: typeof data.companyId === 'string' ? parseInt(data.companyId) : data.companyId,
            categoryId: typeof data.categoryId === 'string' ? parseInt(data.categoryId) : data.categoryId,
            month: effectiveMonth,
            year: effectiveYear,
            budgetAmount: data.budgetAmount,
            actualAmount: data.actualAmount,
            description: data.description ? (data.isRecurring ? `${data.description} (${i + 1}/${loopCount})` : data.description) : undefined
        })

        // Increment for next iteration
        currentMonth++
        if (currentMonth > 12) {
            currentMonth = 1
            currentYear++
        }
    }

    // Use createMany for better performance if supported by DB/Prisma adapter, 
    // but sqlite connector in Prisma DOES NOT support createMany (update: it does in newer versions but safe to map create).
    // Actually, createMany is supported in recent Prisma versions for SQLite too? 
    // Let's safe side and use Promise.all with create for now or just simpler loop to await.
    // Loop await is safer to not lock DB too hard if sqlite.

    for (const entry of entriesToCreate) {
        await prisma.entry.create({ data: entry })
    }
    revalidatePath('/')
    revalidatePath('/income')
    revalidatePath('/expenses')
}

export async function getCashflowData(year: number, companyId?: number) {
    const whereClause: any = { year }
    if (companyId) {
        whereClause.companyId = companyId
    }

    const entries = await prisma.entry.findMany({
        where: whereClause,
        include: {
            category: true
        }
    })

    // Initialize 12 months
    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        incomeBudget: 0,
        incomeActual: 0,
        expenseBudget: 0,
        expenseActual: 0,
    }))

    entries.forEach(entry => {
        const monthIndex = entry.month - 1
        if (monthIndex >= 0 && monthIndex < 12) {
            if (entry.category.type === "INCOME") {
                monthlyData[monthIndex].incomeBudget += entry.budgetAmount
                monthlyData[monthIndex].incomeActual += entry.actualAmount
            } else {
                monthlyData[monthIndex].expenseBudget += entry.budgetAmount
                monthlyData[monthIndex].expenseActual += entry.actualAmount
            }
        }
    })

    return monthlyData
}

export async function updateEntry(id: number, data: {
    budgetAmount: number,
    actualAmount: number,
    description?: string
}) {
    await prisma.entry.update({
        where: { id },
        data: {
            budgetAmount: data.budgetAmount,
            actualAmount: data.actualAmount,
            description: data.description
        }
    })
    revalidatePath('/')
    revalidatePath('/income')
    revalidatePath('/expenses')
    revalidatePath('/cashflow')
}

export async function deleteEntry(id: number) {
    await prisma.entry.delete({ where: { id } })
    revalidatePath('/')
    revalidatePath('/income')
    revalidatePath('/expenses')
    revalidatePath('/cashflow')
}

export async function deleteEntries(ids: number[]) {
    await prisma.entry.deleteMany({
        where: {
            id: {
                in: ids
            }
        }
    })
    revalidatePath('/')
    revalidatePath('/income')
    revalidatePath('/expenses')
    revalidatePath('/cashflow')
}

export async function duplicateEntry(id: number) {
    const entry = await prisma.entry.findUnique({ where: { id } })
    if (!entry) return

    // Create a copy directly, effectively bypassing the unique constraint validation for a microsecond but usually we need to change something.
    // However, the unique constraint is [companyId, categoryId, month, year]. 
    // We cannot just duplicate it if it violates the unique constraint.
    // The previous implementation plan didn't consider the unique constraint.
    // If I duplicate, I should probably append "Copy" to description or something, but the constraints are on IDs and Date.
    // Actually, SQLite/Prisma will throw error if same company, category, month, year.

    // For now, let's assume the user might want to copy to the NEXT month or just as a template.
    // But the requirement says "row based copy".

    // If the unique constraint exists, we can't simple duplicate.
    // Let's remove the unique constraint or handle it.
    // The unique constraint is: @@unique([companyId, categoryId, month, year])

    // Wait, multiple entries for same company/category/month IS a valid use case? 
    // Maybe they have multiple invoices for "Sales".
    // My schema enforced uniqueness which might be too strict.
    // I should probably REMOVE the unique constraint in schema.prisma to allow multiple entries.

    // For this step, I will implement the action but I will also need to update schema to relax constraints.
    // Let's create the copy.

    await prisma.entry.create({
        data: {
            companyId: entry.companyId,
            categoryId: entry.categoryId,
            month: entry.month,
            year: entry.year,
            budgetAmount: entry.budgetAmount,
            actualAmount: entry.actualAmount,
            description: entry.description ? `${entry.description} (Kopyası)` : "(Kopyası)"
        }
    })
    revalidatePath('/')
    revalidatePath('/income')
    revalidatePath('/expenses')
    revalidatePath('/cashflow')
}

export async function createCategory(data: { name: string, type: string }) {
    await prisma.category.create({
        data: {
            name: data.name,
            type: data.type
        }
    })
    revalidatePath('/settings')
    revalidatePath('/income')
    revalidatePath('/expenses')
}

export async function updateCategory(id: number, name: string) {
    await prisma.category.update({
        where: { id },
        data: { name }
    })
    revalidatePath('/settings')
    revalidatePath('/income')
    revalidatePath('/expenses')
}

export async function deleteCategory(id: number) {
    try {
        await prisma.category.delete({ where: { id } })
        revalidatePath('/settings')
        revalidatePath('/income')
        revalidatePath('/expenses')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Bu kategoriye bağlı kayıtlar var, silinemez." }
    }
}

export async function createCompany(name: string) {
    await prisma.company.create({
        data: { name }
    })
    revalidatePath('/settings')
    revalidatePath('/income')
    revalidatePath('/expenses')
}

export async function updateCompany(id: number, name: string) {
    await prisma.company.update({
        where: { id },
        data: { name }
    })
    revalidatePath('/settings')
    revalidatePath('/income')
    revalidatePath('/expenses')
}

export async function deleteCompany(id: number) {
    try {
        await prisma.company.delete({ where: { id } })
        revalidatePath('/settings')
        revalidatePath('/income')
        revalidatePath('/expenses')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Bu şirkete bağlı kayıtlar var, silinemez." }
    }
}

export async function bulkDeleteCategories(ids: number[]) {
    try {
        // We use a transaction or just try to delete. 
        // deleteMany will throw if foreign key constraint fails for ANY of the records in SQLite usually (or might vary).
        // Safest is to try deleteMany, if it fails, maybe some are used.
        await prisma.category.deleteMany({
            where: {
                id: { in: ids }
            }
        })
        revalidatePath('/settings')
        revalidatePath('/income')
        revalidatePath('/expenses')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Seçilen kategorilerden bazıları silinemedi (kullanımda olabilir)." }
    }
}

export async function bulkDeleteCompanies(ids: number[]) {
    try {
        await prisma.company.deleteMany({
            where: {
                id: { in: ids }
            }
        })
        revalidatePath('/settings')
        revalidatePath('/income')
        revalidatePath('/expenses')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Seçilen şirketlerden bazıları silinemedi (kullanımda olabilir)." }
    }
}

export async function getReportData(year: number) {
    const [entries, categories, companies] = await Promise.all([
        prisma.entry.findMany({
            where: { year },
            include: {
                category: true,
                company: true
            },
            orderBy: { month: 'asc' }
        }),
        prisma.category.findMany(),
        prisma.company.findMany()
    ])

    // Monthly Trend Data
    const monthlyTrend = Array.from({ length: 12 }, (_, i) => ({
        name: new Date(0, i).toLocaleString('tr-TR', { month: 'long' }),
        income: 0,
        expense: 0,
        budgetIncome: 0,
        budgetExpense: 0
    }))

    // Category Distribution
    const incomeByCategory: Record<string, number> = {}
    const expenseByCategory: Record<string, number> = {}

    // Company Distribution
    const incomeByCompany: Record<string, number> = {}
    const expenseByCompany: Record<string, number> = {}

    // Budget vs Actual per Category
    const budgetVsActual: Record<string, { budget: number, actual: number, type: string }> = {}

    entries.forEach(entry => {
        const monthIndex = entry.month - 1
        const type = entry.category.type

        // Monthly Trend
        if (monthIndex >= 0 && monthIndex < 12) {
            if (type === "INCOME") {
                monthlyTrend[monthIndex].income += entry.actualAmount
                monthlyTrend[monthIndex].budgetIncome += entry.budgetAmount
            } else {
                monthlyTrend[monthIndex].expense += entry.actualAmount
                monthlyTrend[monthIndex].budgetExpense += entry.budgetAmount
            }
        }

        // Category Distribution
        if (type === "INCOME") {
            incomeByCategory[entry.category.name] = (incomeByCategory[entry.category.name] || 0) + entry.actualAmount
        } else {
            expenseByCategory[entry.category.name] = (expenseByCategory[entry.category.name] || 0) + entry.actualAmount
        }

        // Company Distribution
        if (type === "INCOME") {
            incomeByCompany[entry.company.name] = (incomeByCompany[entry.company.name] || 0) + entry.actualAmount
        } else {
            expenseByCompany[entry.company.name] = (expenseByCompany[entry.company.name] || 0) + entry.actualAmount
        }

        // Budget vs Actual
        if (!budgetVsActual[entry.category.name]) {
            budgetVsActual[entry.category.name] = { budget: 0, actual: 0, type }
        }
        budgetVsActual[entry.category.name].budget += entry.budgetAmount
        budgetVsActual[entry.category.name].actual += entry.actualAmount
    })

    return {
        monthlyTrend,
        incomeByCategory: Object.entries(incomeByCategory).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
        expenseByCategory: Object.entries(expenseByCategory).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
        incomeByCompany: Object.entries(incomeByCompany).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
        expenseByCompany: Object.entries(expenseByCompany).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
        budgetVsActual: Object.entries(budgetVsActual).map(([name, data]) => ({ name, ...data })).sort((a, b) => b.actual - a.actual)
    }
}
