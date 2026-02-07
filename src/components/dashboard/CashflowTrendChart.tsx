"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CashflowTrendChartProps {
    data: {
        name: string
        income: number
        expense: number
    }[]
}

export function CashflowTrendChart({ data }: CashflowTrendChartProps) {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Gelir/Gider Trendi (Bu Yıl)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `₺${value}`}
                            />
                            <Tooltip
                                formatter={(value: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)}
                            />
                            <Area
                                type="monotone"
                                dataKey="income"
                                name="Gelir"
                                stackId="1"
                                stroke="#16a34a"
                                fill="#22c55e"
                                fillOpacity={0.2}
                            />
                            <Area
                                type="monotone"
                                dataKey="expense"
                                name="Gider"
                                stackId="1"
                                stroke="#dc2626"
                                fill="#ef4444"
                                fillOpacity={0.2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
