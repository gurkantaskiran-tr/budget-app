import { getCRMDashboardData } from "@/lib/crm-actions"
import { getMasterData } from "@/lib/actions"
import {
    Users,
    Handshake,
    TrendingUp,
    Target,
    DollarSign,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    Building2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"

const STAGE_LABELS: Record<string, string> = {
    LEAD: "Lead",
    QUALIFIED: "Nitelikli",
    PROPOSAL: "Teklif",
    NEGOTIATION: "Müzakere",
    WON: "Kazanıldı",
    LOST: "Kaybedildi"
}

const STAGE_COLORS: Record<string, string> = {
    LEAD: "bg-slate-100 text-slate-700",
    QUALIFIED: "bg-blue-100 text-blue-700",
    PROPOSAL: "bg-amber-100 text-amber-700",
    NEGOTIATION: "bg-purple-100 text-purple-700",
    WON: "bg-emerald-100 text-emerald-700",
    LOST: "bg-rose-100 text-rose-700"
}

const ACTIVITY_ICONS: Record<string, string> = {
    CALL: "📞",
    MEETING: "🤝",
    EMAIL: "📧",
    NOTE: "📝",
    TASK: "✅"
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount)
}

export default async function CRMDashboard() {
    const data = await getCRMDashboardData()

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Building2 className="h-4 w-4" />
                        <span className="text-sm font-medium uppercase tracking-wider">ThinkOne Group Technology</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">CRM Yönetim Paneli</h1>
                    <p className="text-muted-foreground mt-1">Müşteri ilişkileri ve satış pipeline özeti</p>
                </div>
                <div className="flex gap-2">
                    <Link
                        href="/crm/customers"
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                    >
                        <Users className="h-4 w-4" />
                        Müşteriler
                    </Link>
                    <Link
                        href="/crm/deals"
                        className="inline-flex items-center gap-2 rounded-lg bg-white border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <Handshake className="h-4 w-4" />
                        Fırsatlar
                    </Link>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Müşteri</CardTitle>
                        <Users className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalCustomers}</div>
                        <p className="text-xs text-muted-foreground">
                            {data.activeCustomers} aktif · {data.leadCustomers} lead
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pipeline Değeri</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(data.totalPipelineValue)}</div>
                        <p className="text-xs text-muted-foreground">
                            {data.openDeals} açık fırsat
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Kazanılan Gelir</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600">{formatCurrency(data.wonRevenue)}</div>
                        <p className="text-xs text-muted-foreground">
                            Kapatılan fırsatlardan
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Dönüşüm Oranı</CardTitle>
                        <Target className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">%{data.conversionRate.toFixed(1)}</div>
                        <p className="text-xs text-muted-foreground">
                            Kazanılan / Toplam kapatılan
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Pipeline & Recent */}
            <div className="grid gap-6 md:grid-cols-7">
                {/* Pipeline */}
                <Card className="col-span-4 md:col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Handshake className="h-5 w-5 text-indigo-500" />
                            Satış Pipeline
                        </CardTitle>
                        <CardDescription>Fırsatların aşama dağılımı</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.pipelineData.map((stage) => {
                                const maxValue = Math.max(...data.pipelineData.map(s => s.value), 1)
                                const widthPercent = (stage.value / maxValue) * 100
                                return (
                                    <div key={stage.stage} className="space-y-1">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STAGE_COLORS[stage.stage]}`}>
                                                    {STAGE_LABELS[stage.stage]}
                                                </span>
                                                <span className="text-muted-foreground">{stage.count} fırsat</span>
                                            </div>
                                            <span className="font-medium">{formatCurrency(stage.value)}</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-gray-100">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-500 ${stage.stage === "WON" ? "bg-emerald-500" :
                                                    stage.stage === "LOST" ? "bg-rose-400" :
                                                        "bg-indigo-500"
                                                    }`}
                                                style={{ width: `${Math.max(widthPercent, 2)}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="mt-6 flex items-center justify-between rounded-lg bg-indigo-50 p-4">
                            <div>
                                <p className="text-xs text-indigo-600 font-medium">Ağırlıklı Pipeline</p>
                                <p className="text-lg font-bold text-indigo-700">{formatCurrency(data.weightedPipelineValue)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-indigo-600 font-medium">Toplam Fırsat</p>
                                <p className="text-lg font-bold text-indigo-700">{data.totalDeals}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activities */}
                <Card className="col-span-3 md:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-amber-500" />
                            Son Aktiviteler
                        </CardTitle>
                        <CardDescription>Son gerçekleştirilen aktiviteler</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.recentActivities.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">
                                    Henüz aktivite kaydı yok.
                                </p>
                            ) : (
                                data.recentActivities.map((activity: any) => (
                                    <div key={activity.id} className="flex items-start gap-3 text-sm">
                                        <span className="text-lg">{ACTIVITY_ICONS[activity.type] || "📋"}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{activity.title}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                {activity.customer && <span>{activity.customer.name}</span>}
                                                <span>·</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(activity.date).toLocaleDateString('tr-TR')}
                                                </span>
                                            </div>
                                        </div>
                                        {activity.completed ? (
                                            <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Tamamlandı</span>
                                        ) : (
                                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Devam</span>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <Link href="/crm/activities" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1">
                                Tüm aktiviteleri görüntüle
                                <ArrowUpRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Customers */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-500" />
                        Son Eklenen Müşteriler
                    </CardTitle>
                    <CardDescription>En son eklenen müşteriler</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="pb-3 font-medium">Müşteri</th>
                                    <th className="pb-3 font-medium">Şirket</th>
                                    <th className="pb-3 font-medium">Durum</th>
                                    <th className="pb-3 font-medium text-right">Fırsatlar</th>
                                    <th className="pb-3 font-medium text-right">Eklenme</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recentCustomers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-muted-foreground">
                                            Henüz müşteri kaydı yok.
                                        </td>
                                    </tr>
                                ) : (
                                    data.recentCustomers.map((customer: any) => (
                                        <tr key={customer.id} className="border-b last:border-0">
                                            <td className="py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs">
                                                        {customer.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{customer.name}</p>
                                                        {customer.email && (
                                                            <p className="text-xs text-muted-foreground">{customer.email}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 text-muted-foreground">
                                                {customer.company?.name || "—"}
                                            </td>
                                            <td className="py-3">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${customer.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" :
                                                    customer.status === "LEAD" ? "bg-blue-100 text-blue-700" :
                                                        "bg-gray-100 text-gray-700"
                                                    }`}>
                                                    {customer.status === "ACTIVE" ? "Aktif" :
                                                        customer.status === "LEAD" ? "Lead" : "Pasif"}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right font-medium">{customer._count.deals}</td>
                                            <td className="py-3 text-right text-muted-foreground text-xs">
                                                {new Date(customer.createdAt).toLocaleDateString('tr-TR')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
