"use client"

import { useState, useTransition } from "react"
import { createActivity, toggleActivity, deleteActivity } from "@/lib/crm-actions"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Plus,
    Search,
    Phone,
    Mail,
    Users as UsersIcon,
    FileText,
    CheckSquare,
    Trash2,
    Clock,
    CalendarCheck,
    Check,
    Circle
} from "lucide-react"

interface Customer {
    id: number
    name: string
}

interface Deal {
    id: number
    title: string
}

interface Activity {
    id: number
    type: string
    title: string
    description: string | null
    date: string
    completed: boolean
    customerId: number | null
    dealId: number | null
    customer: Customer | null
    deal: Deal | null
}

const ACTIVITY_TYPES = [
    { value: "CALL", label: "Arama", icon: Phone, color: "text-blue-600 bg-blue-50" },
    { value: "MEETING", label: "Toplantı", icon: UsersIcon, color: "text-indigo-600 bg-indigo-50" },
    { value: "EMAIL", label: "E-posta", icon: Mail, color: "text-amber-600 bg-amber-50" },
    { value: "NOTE", label: "Not", icon: FileText, color: "text-green-600 bg-green-50" },
    { value: "TASK", label: "Görev", icon: CheckSquare, color: "text-purple-600 bg-purple-50" },
]

export function ActivityList({
    activities,
    customers,
    deals
}: {
    activities: Activity[]
    customers: Customer[]
    deals: Deal[]
}) {
    const [search, setSearch] = useState("")
    const [typeFilter, setTypeFilter] = useState<string>("ALL")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [isPending, startTransition] = useTransition()

    // Form
    const [formType, setFormType] = useState("CALL")
    const [formTitle, setFormTitle] = useState("")
    const [formDesc, setFormDesc] = useState("")
    const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0])
    const [formCustomerId, setFormCustomerId] = useState<string>("")
    const [formDealId, setFormDealId] = useState<string>("")

    const filtered = activities.filter(a => {
        const matchesSearch = search === "" ||
            a.title.toLowerCase().includes(search.toLowerCase()) ||
            a.description?.toLowerCase().includes(search.toLowerCase()) ||
            a.customer?.name.toLowerCase().includes(search.toLowerCase())
        const matchesType = typeFilter === "ALL" || a.type === typeFilter
        return matchesSearch && matchesType
    })

    function resetForm() {
        setFormType("CALL")
        setFormTitle("")
        setFormDesc("")
        setFormDate(new Date().toISOString().split('T')[0])
        setFormCustomerId("")
        setFormDealId("")
    }

    function handleSubmit() {
        if (!formTitle.trim()) return

        startTransition(async () => {
            await createActivity({
                type: formType,
                title: formTitle.trim(),
                description: formDesc.trim() || undefined,
                date: formDate || undefined,
                customerId: formCustomerId ? parseInt(formCustomerId) : undefined,
                dealId: formDealId ? parseInt(formDealId) : undefined,
            })
            setDialogOpen(false)
            resetForm()
        })
    }

    function handleToggle(id: number) {
        startTransition(async () => {
            await toggleActivity(id)
        })
    }

    function handleDelete(id: number) {
        if (!confirm("Bu aktiviteyi silmek istediğinize emin misiniz?")) return
        startTransition(async () => {
            await deleteActivity(id)
        })
    }

    // Group by date
    const grouped = filtered.reduce<Record<string, Activity[]>>((acc, activity) => {
        const dateKey = new Date(activity.date).toLocaleDateString('tr-TR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        if (!acc[dateKey]) acc[dateKey] = []
        acc[dateKey].push(activity)
        return acc
    }, {})

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Aktiviteler</h1>
                    <p className="text-muted-foreground mt-1">
                        {activities.length} aktivite kaydı
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                    setDialogOpen(open)
                    if (!open) resetForm()
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Yeni Aktivite
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Yeni Aktivite</DialogTitle>
                            <DialogDescription>Yeni bir aktivite kaydı oluşturun.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Tür</Label>
                                <Select value={formType} onValueChange={setFormType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ACTIVITY_TYPES.map(t => (
                                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="title">Başlık *</Label>
                                <Input
                                    id="title"
                                    value={formTitle}
                                    onChange={(e) => setFormTitle(e.target.value)}
                                    placeholder="Aktivite başlığı"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="desc">Açıklama</Label>
                                <textarea
                                    id="desc"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={formDesc}
                                    onChange={(e) => setFormDesc(e.target.value)}
                                    placeholder="Detaylar..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="date">Tarih</Label>
                                    <Input
                                        id="date"
                                        type="date"
                                        value={formDate}
                                        onChange={(e) => setFormDate(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Müşteri</Label>
                                    <Select value={formCustomerId} onValueChange={setFormCustomerId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seçin" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map(c => (
                                                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>İlgili Fırsat</Label>
                                <Select value={formDealId} onValueChange={setFormDealId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seçin (opsiyonel)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {deals.map(d => (
                                            <SelectItem key={d.id} value={d.id.toString()}>{d.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">İptal</Button>
                            </DialogClose>
                            <Button
                                onClick={handleSubmit}
                                disabled={!formTitle.trim() || isPending}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                {isPending ? "Kaydediliyor..." : "Ekle"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Aktivite ara..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Tür" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tüm Türler</SelectItem>
                        {ACTIVITY_TYPES.map(t => (
                            <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Activity Timeline */}
            {filtered.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <CalendarCheck className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">
                            {search || typeFilter !== "ALL" ? "Filtrelere uygun aktivite bulunamadı." : "Henüz aktivite kaydı yok."}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([date, dayActivities]) => (
                        <div key={date}>
                            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5" />
                                {date}
                            </h3>
                            <div className="space-y-2 ml-2 border-l-2 border-gray-100 pl-4">
                                {dayActivities.map(activity => {
                                    const typeDef = ACTIVITY_TYPES.find(t => t.value === activity.type)
                                    const Icon = typeDef?.icon || FileText
                                    return (
                                        <div
                                            key={activity.id}
                                            className={`flex items-start gap-3 p-3 rounded-lg border bg-white hover:shadow-sm transition-shadow ${activity.completed ? "opacity-60" : ""
                                                }`}
                                        >
                                            {/* Toggle */}
                                            <button
                                                onClick={() => handleToggle(activity.id)}
                                                className={`mt-0.5 flex-shrink-0 rounded-full p-1 transition-colors ${activity.completed
                                                    ? "text-emerald-600 bg-emerald-50"
                                                    : "text-gray-300 hover:text-gray-500"
                                                    }`}
                                            >
                                                {activity.completed ? (
                                                    <Check className="h-4 w-4" />
                                                ) : (
                                                    <Circle className="h-4 w-4" />
                                                )}
                                            </button>

                                            {/* Icon */}
                                            <div className={`p-1.5 rounded-lg flex-shrink-0 ${typeDef?.color}`}>
                                                <Icon className="h-3.5 w-3.5" />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium ${activity.completed ? "line-through" : ""}`}>
                                                    {activity.title}
                                                </p>
                                                {activity.description && (
                                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                                        {activity.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
                                                    {activity.customer && (
                                                        <span className="flex items-center gap-1">
                                                            <UsersIcon className="h-2.5 w-2.5" />
                                                            {activity.customer.name}
                                                        </span>
                                                    )}
                                                    {activity.deal && (
                                                        <span className="flex items-center gap-1">
                                                            💰 {activity.deal.title}
                                                        </span>
                                                    )}
                                                    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 font-medium ${typeDef?.color}`}>
                                                        {typeDef?.label}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Delete */}
                                            <button
                                                onClick={() => handleDelete(activity.id)}
                                                className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
