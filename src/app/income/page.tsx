import { getEntries, getMasterData } from "@/lib/actions"
import { EntryDialog } from "@/components/EntryDialog"
import { IncomeTable } from "@/components/IncomeTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function IncomePage() {
    const entries = await getEntries("INCOME")
    const { companies, categories } = await getMasterData()
    const incomeCategories = categories.filter(c => c.type === "INCOME")

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Gelirler</h1>
                <EntryDialog
                    type="INCOME"
                    companies={companies}
                    categories={incomeCategories}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Gelir Listesi</CardTitle>
                </CardHeader>
                <CardContent>
                    <IncomeTable data={entries} />
                </CardContent>
            </Card>
        </div>
    )
}
