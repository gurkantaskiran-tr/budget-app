"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface RecentTransactionsProps {
    entries: any[]
}

export function RecentTransactions({ entries }: RecentTransactionsProps) {
    return (
        <Card className="col-span-7">
            <CardHeader>
                <CardTitle>Son Hareketler</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {entries.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Henüz veri girilmemiş.</p>
                    ) : (
                        entries.map((entry) => (
                            <div key={entry.id} className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback className={entry.category.type === "INCOME" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                                        {entry.company.name.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{entry.company.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {entry.category.name}
                                    </p>
                                </div>
                                <div className={`ml-auto font-medium ${entry.category.type === "INCOME" ? "text-green-600" : "text-red-600"}`}>
                                    {entry.category.type === "INCOME" ? "+" : "-"}
                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(entry.actualAmount)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
