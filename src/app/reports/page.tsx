import { getReportData } from "@/lib/actions"
import { ReportsData } from "@/components/reports/ReportsData"

export default async function ReportsPage() {
    const currentYear = new Date().getFullYear()
    const data = await getReportData(currentYear)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Raporlar ({currentYear})</h1>
            </div>
            <ReportsData data={data} />
        </div>
    )
}
