"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    ArrowRight,
    Zap,
    Users,
    TrendingUp,
    Target,
    Phone,
    Mail,
    FileText,
    CheckSquare,
    CalendarCheck
} from "lucide-react"

interface Customer {
    id: number
    name: string
    status: string
}

const PIPELINE_STAGES = [
    {
        value: "LEAD",
        label: "Lead",
        description: "İlk temas aşaması — potansiyel müşteri",
        probability: "10%",
        color: "bg-slate-100 text-slate-700 border-slate-200"
    },
    {
        value: "QUALIFIED",
        label: "Nitelikli",
        description: "İhtiyaç teyit edildi, bütçe uygun",
        probability: "25%",
        color: "bg-blue-100 text-blue-700 border-blue-200"
    },
    {
        value: "PROPOSAL",
        label: "Teklif",
        description: "Teklif gönderildi, değerlendirme bekleniyor",
        probability: "50%",
        color: "bg-amber-100 text-amber-700 border-amber-200"
    },
    {
        value: "NEGOTIATION",
        label: "Müzakere",
        description: "Fiyat ve koşullar üzerine görüşme",
        probability: "75%",
        color: "bg-purple-100 text-purple-700 border-purple-200"
    },
    {
        value: "WON",
        label: "Kazanıldı",
        description: "Anlaşma tamamlandı ✓",
        probability: "100%",
        color: "bg-emerald-100 text-emerald-700 border-emerald-200"
    },
    {
        value: "LOST",
        label: "Kaybedildi",
        description: "Fırsat kapatıldı (kayıp)",
        probability: "0%",
        color: "bg-rose-100 text-rose-700 border-rose-200"
    },
]

const ACTIVITY_TYPES = [
    { value: "CALL", label: "Arama", icon: Phone, description: "Telefon aramaları" },
    { value: "MEETING", label: "Toplantı", icon: Users, description: "Yüz yüze veya online toplantılar" },
    { value: "EMAIL", label: "E-posta", icon: Mail, description: "E-posta yazışmaları" },
    { value: "NOTE", label: "Not", icon: FileText, description: "Genel notlar ve yorumlar" },
    { value: "TASK", label: "Görev", icon: CheckSquare, description: "Yapılacak görevler ve to-do" },
]

const CUSTOMER_STATUSES = [
    { value: "ACTIVE", label: "Aktif", description: "Mevcut aktif müşteri" },
    { value: "INACTIVE", label: "Pasif", description: "Artık aktif olmayan müşteri" },
    { value: "LEAD", label: "Lead", description: "Potansiyel müşteri adayı" },
]

export function CRMSettingsManager({
    tab,
    customers
}: {
    tab: "pipeline" | "general"
    customers: Customer[]
}) {
    if (tab === "pipeline") {
        return (
            <div className="space-y-6">
                {/* Pipeline Stages */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-indigo-500" />
                            Satış Pipeline Aşamaları
                        </CardTitle>
                        <CardDescription>
                            Fırsatların geçtiği satış süreç aşamaları
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {PIPELINE_STAGES.map((stage, index) => (
                                <div key={stage.value} className="flex items-center gap-3">
                                    <div className={`flex items-center gap-3 flex-1 p-3 rounded-lg border ${stage.color}`}>
                                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/60 text-xs font-bold">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold">{stage.label}</p>
                                            <p className="text-xs opacity-80">{stage.description}</p>
                                        </div>
                                        <div className="text-xs font-medium px-2 py-1 rounded bg-white/60">
                                            {stage.probability}
                                        </div>
                                    </div>
                                    {index < PIPELINE_STAGES.length - 2 && (
                                        <ArrowRight className="h-4 w-4 text-gray-300 flex-shrink-0" />
                                    )}
                                    {index === PIPELINE_STAGES.length - 2 && (
                                        <div className="w-4 flex-shrink-0" />
                                    )}
                                    {index === PIPELINE_STAGES.length - 1 && (
                                        <div className="w-4 flex-shrink-0" />
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-start gap-2">
                                <Zap className="h-4 w-4 text-amber-500 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Pipeline Bilgisi</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Fırsatlar Lead → Nitelikli → Teklif → Müzakere akışında ilerler.
                                        Her aşamada olasılık yüzdesi otomatik güncellenir. Kanban board&apos;da
                                        kartları sürükleyerek aşama değiştirebilirsiniz.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Müşteri İstatistikleri */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-emerald-500" />
                            Müşteri Durumu Özeti
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            {CUSTOMER_STATUSES.map(status => {
                                const count = customers.filter(c => c.status === status.value).length
                                return (
                                    <div key={status.value} className="p-4 rounded-lg border text-center">
                                        <p className="text-2xl font-bold">{count}</p>
                                        <p className="text-sm font-medium mt-1">{status.label}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{status.description}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // General tab
    return (
        <div className="space-y-6">
            {/* Aktivite Türleri */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarCheck className="h-5 w-5 text-indigo-500" />
                        Aktivite Türleri
                    </CardTitle>
                    <CardDescription>
                        CRM&apos;de kullanılan aktivite türleri
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {ACTIVITY_TYPES.map(type => {
                            const Icon = type.icon
                            return (
                                <div key={type.value} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{type.label}</p>
                                        <p className="text-xs text-muted-foreground">{type.description}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Müşteri Durumları */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-500" />
                        Müşteri Durumları
                    </CardTitle>
                    <CardDescription>
                        Müşterilere atanabilecek durum tanımları
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {CUSTOMER_STATUSES.map(status => (
                            <div key={status.value} className="flex items-center gap-4 p-3 rounded-lg border">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                                    {status.value.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-sm font-medium">{status.label}</p>
                                    <p className="text-xs text-muted-foreground">{status.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Genel Bilgi */}
            <Card>
                <CardHeader>
                    <CardTitle>CRM Modülü Hakkında</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 text-sm text-muted-foreground">
                        <p>
                            CRM modülü müşteri ilişkilerinizi, satış fırsatlarınızı ve aktivitelerinizi
                            tek bir yerden yönetmenizi sağlar.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 rounded-lg bg-gray-50">
                                <p className="font-medium text-gray-900">Müşteri Yönetimi</p>
                                <p className="text-xs mt-1">Müşteri bilgileri, iletişim kişileri ve şirket bağlantıları</p>
                            </div>
                            <div className="p-3 rounded-lg bg-gray-50">
                                <p className="font-medium text-gray-900">Fırsat Takibi</p>
                                <p className="text-xs mt-1">Kanban board ile satış pipeline yönetimi</p>
                            </div>
                            <div className="p-3 rounded-lg bg-gray-50">
                                <p className="font-medium text-gray-900">Aktivite Kaydı</p>
                                <p className="text-xs mt-1">Arama, toplantı, e-posta ve görev takibi</p>
                            </div>
                            <div className="p-3 rounded-lg bg-gray-50">
                                <p className="font-medium text-gray-900">Finans Entegrasyonu</p>
                                <p className="text-xs mt-1">Müşteriler finans modülündeki şirketlerle bağlanabilir</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
