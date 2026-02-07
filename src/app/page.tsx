import { getDashboardData, getMasterData } from "@/lib/actions"
import { StatCard } from "@/components/dashboard/StatCard"
import { BudgetPerformanceChart } from "@/components/dashboard/BudgetPerformanceChart"
import { ExpenseCategoryChart } from "@/components/dashboard/ExpenseCategoryChart"
import { CompanyBudgetChart } from "@/components/dashboard/CompanyBudgetChart"
import { CategoryBudgetChart } from "@/components/dashboard/CategoryBudgetChart"
import { RecentTransactions } from "@/components/dashboard/RecentTransactions"
import { DashboardFilter } from "@/components/dashboard/DashboardFilter"
import { Building2 } from "lucide-react"

interface DashboardProps {
  searchParams: Promise<{
    companyId?: string
    categoryId?: string
    month?: string
    year?: string
  }>
}

export default async function Dashboard({ searchParams }: DashboardProps) {
  // Await searchParams since Next.js 16 returns it as a Promise
  const params = await searchParams

  // Parse search params to numbers
  const filters = {
    companyId: params.companyId ? parseInt(params.companyId) : undefined,
    categoryId: params.categoryId ? parseInt(params.categoryId) : undefined,
    month: params.month ? parseInt(params.month) : undefined,
    year: params.year ? parseInt(params.year) : undefined,
  }

  const [data, masterData] = await Promise.all([
    getDashboardData(filters),
    getMasterData()
  ])

  const { companies, categories } = masterData

  const netIncome = data.income.actual - data.expense.actual
  const netBudget = data.income.budget - data.expense.budget
  const budgetVariance = netIncome - netBudget

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Building2 className="h-4 w-4" />
            <span className="text-sm font-medium uppercase tracking-wider">ThinkOne Group Technology</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Finansal Yönetim Paneli</h1>
          <p className="text-muted-foreground mt-1">
            {filters.year || new Date().getFullYear()} Bütçe ve Gerçekleşen Verileri
          </p>
        </div>
        <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-lg text-sm text-secondary-foreground">
          <span className="font-medium">Son Güncelleme:</span>
          <span>{new Date().toLocaleDateString('tr-TR')}</span>
        </div>
      </div>

      {/* Filters */}
      <DashboardFilter companies={companies} categories={categories} />

      {/* Budget vs Actuals Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Budget Row */}
        <StatCard
          title={`Bütçelenen Gelir (${filters.year || 2026})`}
          amount={data.income.budget}
          iconName="target"
          description="Yıllık Hedeflenen Gelir"
          colorClass="text-blue-600"
        />
        <StatCard
          title={`Bütçelenen Gider (${filters.year || 2026})`}
          amount={data.expense.budget}
          iconName="target"
          description="Yıllık Öngörülen Gider"
          colorClass="text-orange-600"
        />
        <StatCard
          title="Hedeflenen Net Bütçe"
          amount={netBudget}
          iconName="piggyBank"
          description="Beklenen Yıllık Kar/Zarar"
          colorClass={netBudget >= 0 ? "text-emerald-600" : "text-rose-600"}
        />
        <StatCard
          title="Bütçe Sapması"
          amount={budgetVariance}
          iconName="activity"
          description={budgetVariance >= 0 ? "Bütçeden Daha İyi" : "Bütçeden Sapma Var"}
          colorClass={budgetVariance >= 0 ? "text-green-600" : "text-red-600"}
        />

        {/* Actual Row */}
        <StatCard
          title="Gerçekleşen Gelir"
          amount={data.income.actual}
          iconName="trendingUp"
          description={`Bütçe Tamamlama: %${data.income.budget > 0 ? ((data.income.actual / data.income.budget) * 100).toFixed(1) : '0'}`}
          colorClass="text-green-500"
        />
        <StatCard
          title="Gerçekleşen Gider"
          amount={data.expense.actual}
          iconName="trendingDown"
          description={`Bütçe Kullanımı: %${data.expense.budget > 0 ? ((data.expense.actual / data.expense.budget) * 100).toFixed(1) : '0'}`}
          colorClass="text-red-500"
        />
        <StatCard
          title="Net Nakit Akışı (Fiili)"
          amount={netIncome}
          iconName="wallet"
          description="Şu ana kadar kasaya giren net"
          colorClass={netIncome >= 0 ? "text-blue-500" : "text-red-500"}
        />
        <StatCard
          title="Kalan Bütçe / Forecast"
          amount={netBudget - netIncome}
          iconName="hourglass"
          description="Yıl sonuna kadar beklenen hareket"
          colorClass="text-purple-500"
        />
      </div>

      {/* Main Charts Row */}
      <div className="grid gap-6 md:grid-cols-7">
        <div className="col-span-4 md:col-span-5">
          <BudgetPerformanceChart data={data.trendData} />
        </div>
        <div className="col-span-3 md:col-span-2">
          <ExpenseCategoryChart data={data.pieChartData} />
        </div>
      </div>

      {/* Budget Distribution Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <CompanyBudgetChart data={data.companyBudgetDistribution} />
        <CategoryBudgetChart data={data.categoryBudgetDistribution} />
      </div>

      {/* Drill Down / Detailed Tables */}
      <div className="grid gap-6">
        <RecentTransactions entries={data.recentEntries} />
      </div>
    </div>
  )
}

