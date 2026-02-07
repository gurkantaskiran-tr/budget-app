import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Target, Activity, Hourglass, LucideIcon } from "lucide-react"

interface StatCardProps {
    title: string
    amount: number
    iconName: "trendingUp" | "trendingDown" | "wallet" | "piggyBank" | "target" | "activity" | "hourglass"
    description?: string
    colorClass?: string
}

const iconMap: Record<string, LucideIcon> = {
    trendingUp: TrendingUp,
    trendingDown: TrendingDown,
    wallet: Wallet,
    piggyBank: PiggyBank,
    target: Target,
    activity: Activity,
    hourglass: Hourglass
}

export function StatCard({ title, amount, iconName, description, colorClass = "text-primary" }: StatCardProps) {
    const Icon = iconMap[iconName]

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className={`h-4 w-4 ${colorClass}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount)}
                </div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
