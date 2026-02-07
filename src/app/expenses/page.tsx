import { getEntries, getMasterData } from "@/lib/actions"
import { EntryDialog } from "@/components/EntryDialog"
import { ExpensesTable } from "@/components/ExpensesTable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ExpensesPage() {
    const entries = await getEntries("EXPENSE")
    const { companies, categories } = await getMasterData()
    const expenseCategories = categories.filter(c => c.type === "EXPENSE")

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Giderler</h1>
                <EntryDialog
                    type="EXPENSE"
                    companies={companies}
                    categories={expenseCategories}
                />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Gider Listesi</CardTitle>
                </CardHeader>
                <CardContent>
                    <ExpensesTable data={entries} />
                </CardContent>
            </Card>
        </div>
    )
}
