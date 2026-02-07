"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface ReportsDataProps {
    data: {
        monthlyTrend: any[]
        incomeByCategory: any[]
        expenseByCategory: any[]
        incomeByCompany: any[]
        expenseByCompany: any[]
        budgetVsActual: any[]
    }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export function ReportsData({ data }: ReportsDataProps) {
    return (
        <Tabs defaultValue="income" className="space-y-4">
            <TabsList>
                <TabsTrigger value="income">Gelir Raporları</TabsTrigger>
                <TabsTrigger value="expense">Gider Raporları</TabsTrigger>
                <TabsTrigger value="budget">Bütçe Analizi</TabsTrigger>
            </TabsList>

            <TabsContent value="income" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Aylık Gelir Trendi</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data.monthlyTrend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₺${value}`} />
                                        <Tooltip formatter={(value: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)} />
                                        <Line type="monotone" dataKey="income" stroke="#16a34a" strokeWidth={2} name="Gerçekleşen" />
                                        <Line type="monotone" dataKey="budgetIncome" stroke="#86efac" strokeWidth={2} strokeDasharray="5 5" name="Bütçelenen" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Kategori Bazlı Gelir</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={data.incomeByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                            {data.incomeByCategory.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Şirket/Müşteri Bazlı Gelir</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.incomeByCompany}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₺${value}`} />
                                    <Tooltip formatter={(value: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)} />
                                    <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]} name="Gelir" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="expense" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Aylık Gider Trendi</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data.monthlyTrend}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₺${value}`} />
                                        <Tooltip formatter={(value: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)} />
                                        <Line type="monotone" dataKey="expense" stroke="#dc2626" strokeWidth={2} name="Gerçekleşen" />
                                        <Line type="monotone" dataKey="budgetExpense" stroke="#fca5a5" strokeWidth={2} strokeDasharray="5 5" name="Bütçelenen" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Kategori Bazlı Gider</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={data.expenseByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                            {data.expenseByCategory.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Tedarikçi/Şirket Bazlı Gider</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.expenseByCompany}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₺${value}`} />
                                    <Tooltip formatter={(value: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)} />
                                    <Bar dataKey="value" fill="#dc2626" radius={[4, 4, 0, 0]} name="Gider" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="budget" className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Bütçe Performans Analizi (Aylık)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.monthlyTrend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₺${value}`} />
                                    <Tooltip
                                        formatter={(value: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)}
                                        cursor={{ fill: 'transparent' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="budgetIncome" name="Bütçelenen Gelir" fill="#86efac" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="income" name="Gerçekleşen Gelir" fill="#16a34a" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="budgetExpense" name="Bütçelenen Gider" fill="#fca5a5" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="expense" name="Gerçekleşen Gider" fill="#dc2626" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Bütçe Karşılaştırma Analizi (Kategori Bazlı)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground">
                                    <tr>
                                        <th className="p-4 font-medium">Kategori</th>
                                        <th className="p-4 font-medium">Tip</th>
                                        <th className="p-4 font-medium text-right">Bütçe</th>
                                        <th className="p-4 font-medium text-right">Gerçekleşen</th>
                                        <th className="p-4 font-medium text-right">Fark</th>
                                        <th className="p-4 font-medium text-right">Durum</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.budgetVsActual.map((item) => {
                                        const diff = item.actual - item.budget
                                        const isPositive = item.type === "INCOME" ? diff >= 0 : diff <= 0
                                        return (
                                            <tr key={item.name} className="border-b last:border-0 hover:bg-muted/50">
                                                <td className="p-4 font-medium">{item.name}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${item.type === "INCOME" ? "bg-green-50 text-green-700 ring-green-600/20" : "bg-red-50 text-red-700 ring-red-600/20"}`}>
                                                        {item.type === "INCOME" ? "Gelir" : "Gider"}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right tabular-nums">
                                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.budget)}
                                                </td>
                                                <td className="p-4 text-right tabular-nums">
                                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.actual)}
                                                </td>
                                                <td className={`p-4 text-right tabular-nums ${isPositive ? "text-green-600" : "text-red-600"}`}>
                                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', signDisplay: "always" }).format(diff)}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${isPositive ? "bg-green-50 text-green-700 ring-green-600/20" : "bg-red-50 text-red-700 ring-red-600/20"}`}>
                                                        {isPositive ? "Başarılı" : "Sapma Var"}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}
