"use client"

import { useState, useEffect } from "react"
import { getCashflowData, getMasterData } from "@/lib/actions"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CashflowPage() {
    const [year, setYear] = useState(2026)
    const [companyId, setCompanyId] = useState<string>("all")
    const [data, setData] = useState<any[]>([])
    const [companies, setCompanies] = useState<any[]>([])

    useEffect(() => {
        const loadMasterData = async () => {
            const { companies } = await getMasterData()
            setCompanies(companies)
        }
        loadMasterData()
    }, [])

    useEffect(() => {
        const loadData = async () => {
            const result = await getCashflowData(year, companyId === "all" ? undefined : parseInt(companyId))
            setData(result)
        }
        loadData()
    }, [year, companyId])

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value)
    }

    const formatVariance = (val: number, isExpense: boolean = false) => {
        // For income: + is good (green), - is bad (red)
        // For expense: - is good (green) (under budget), + is bad (red) (over budget)
        // Wait, normally variance = Actual - Budget.
        // Income: Actual > Budget => + (Green)
        // Expense: Actual > Budget => + (Red)

        // Let's stick to standard: Variance = Actual - Budget

        let isGood = val >= 0
        if (isExpense) {
            isGood = val <= 0
        }

        return (
            <span className={isGood ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                {formatCurrency(val)}
            </span>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Nakit Akış Raporu</h1>
                <div className="flex gap-4">
                    <Select value={companyId} onValueChange={setCompanyId}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Şirket Seçiniz" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tüm Şirketler</SelectItem>
                            {companies.map((c) => (
                                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v))}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Yıl" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2026">2026</SelectItem>
                            <SelectItem value="2027">2027</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{year} Yılı Nakit Akış Tablosu</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ay</TableHead>
                                    <TableHead>Bütçe Gelir</TableHead>
                                    <TableHead>Gerçekleşen Gelir</TableHead>
                                    <TableHead>Gelir Farkı</TableHead>
                                    <TableHead>Bütçe Gider</TableHead>
                                    <TableHead>Gerçekleşen Gider</TableHead>
                                    <TableHead>Gider Farkı</TableHead>
                                    <TableHead>Net Bütçe</TableHead>
                                    <TableHead>Net Gerçekleşen</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((row) => {
                                    const incomeVar = row.incomeActual - row.incomeBudget
                                    const expenseVar = row.expenseActual - row.expenseBudget // Actual - Budget
                                    // Expense var display:
                                    // If Expense Actual (120) > Budget (100), Var is +20. This is BAD (Red).
                                    // If Expense Actual (80) < Budget (100), Var is -20. This is GOOD (Green).

                                    const netBudget = row.incomeBudget - row.expenseBudget
                                    const netActual = row.incomeActual - row.expenseActual

                                    return (
                                        <TableRow key={row.month}>
                                            <TableCell className="font-medium">
                                                {new Date(0, row.month - 1).toLocaleString('tr-TR', { month: 'long' })}
                                            </TableCell>
                                            <TableCell>{formatCurrency(row.incomeBudget)}</TableCell>
                                            <TableCell>{formatCurrency(row.incomeActual)}</TableCell>
                                            <TableCell>
                                                {formatVariance(incomeVar)}
                                            </TableCell>
                                            <TableCell>{formatCurrency(row.expenseBudget)}</TableCell>
                                            <TableCell>{formatCurrency(row.expenseActual)}</TableCell>
                                            <TableCell>
                                                {formatVariance(expenseVar, true)}
                                            </TableCell>
                                            <TableCell className="font-bold">{formatCurrency(netBudget)}</TableCell>
                                            <TableCell className="font-bold">{formatCurrency(netActual)}</TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
