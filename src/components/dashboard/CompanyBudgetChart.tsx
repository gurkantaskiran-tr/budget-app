"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CompanyBudgetChartProps {
    data: {
        name: string
        value: number
    }[]
}

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e']

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
                                    labelFormatter={(label) => `${label}`}
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                    {data.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
