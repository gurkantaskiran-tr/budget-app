"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CompanyBudgetChartProps {
    data: {
        name: string
        income: number
        expense: number
    }[]
}

export function CompanyBudgetChart({ data }: CompanyBudgetChartProps) {
    const formatCurrency = (value: number) => {
        if (value >= 1000000) {
            return `₺${(value / 1000000).toFixed(1)}M`
        }
        if (value >= 1000) {
            return `₺${(value / 1000).toFixed(0)}K`
        }
        return `₺${value}`
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Şirket Bazında Bütçe Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    {data.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            Veri bulunamadı
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={data}
                                layout="vertical"
                                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                            >
                                <XAxis
                                    type="number"
                                    tickFormatter={formatCurrency}
                                    tick={{ fontSize: 12 }}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="name"
                                    width={75}
                                    tick={{ fontSize: 11 }}
                                />
                                <Tooltip
                                    formatter={(value) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value as number)}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                                <Bar
                                    dataKey="income"
                                    name="Gelir"
                                    fill="#10b981"
                                    radius={[0, 4, 4, 0]}
                                />
                                <Bar
                                    dataKey="expense"
                                    name="Gider"
                                    fill="#ef4444"
                                    radius={[0, 4, 4, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
