import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownIcon, ArrowUpIcon, DollarSign } from "lucide-react"

interface SummaryCardProps {
    title: string
    budget: number
    actual: number
    type: "INCOME" | "EXPENSE"
}

export function SummaryCard({ title, budget, actual, type }: SummaryCardProps) {
    const difference = actual - budget
    const percent = budget > 0 ? ((difference / budget) * 100).toFixed(1) : 0

    const isPositiveGood = type === "INCOME"
    const isGood = isPositiveGood ? difference >= 0 : difference <= 0

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(actual)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                    Bütçe: {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(budget)}
                </p>
                <div className={`flex items-center text-xs mt-2 ${isGood ? 'text-green-500' : 'text-red-500'}`}>
                    {difference > 0 ? <ArrowUpIcon className="h-3 w-3 mr-1" /> : <ArrowDownIcon className="h-3 w-3 mr-1" />}
                    {Math.abs(difference).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })} ({percent}%)
                </div>
            </CardContent>
        </Card>
    )
}
