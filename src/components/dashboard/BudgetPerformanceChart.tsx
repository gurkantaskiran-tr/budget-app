"use client"

import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BudgetPerformanceChartProps {
    data: {
        name: string
        income: number
        expense: number
        budgetIncome: number
        budgetExpense: number
    }[]
}

export function BudgetPerformanceChart({ data }: BudgetPerformanceChartProps) {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Bütçe Performans Analizi (2026)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={data}
                            margin={{
                                top: 20,
                                right: 20,
                                bottom: 20,
                                left: 20,
                            }}
                        >
                            <CartesianGrid stroke="#f5f5f5" />
                            <XAxis dataKey="name" scale="point" padding={{ left: 20, right: 20 }} />
                            <YAxis tickFormatter={(value) => `₺${value / 1000}k`} />
                            <Tooltip
                                formatter={(value: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)}
                            />
                            <Legend />
                            {/* Budget Lines (Targets) */}
                            <Line type="monotone" dataKey="budgetIncome" name="Bütçelenen Gelir" stroke="#2563eb" strokeDasharray="5 5" dot={false} strokeWidth={2} />
                            <Line type="monotone" dataKey="budgetExpense" name="Bütçelenen Gider" stroke="#dc2626" strokeDasharray="5 5" dot={false} strokeWidth={2} />

                            {/* Actual Bars (Performance) */}
                            <Bar dataKey="income" name="Gerçekleşen Gelir" barSize={20} fill="#60a5fa" fillOpacity={0.6} />
                            <Bar dataKey="expense" name="Gerçekleşen Gider" barSize={20} fill="#f87171" fillOpacity={0.6} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
