"use client"

import { useState, useTransition } from "react"
import { createDeal, updateDeal, updateDealStage, deleteDeal } from "@/lib/crm-actions"
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
    DollarSign,
    Calendar,
    Building2,
    MoreHorizontal,
    Edit,
    Trash2,
    ArrowRight,
    Handshake,
    LayoutGrid,
    List,
    GripVertical
} from "lucide-react"

interface Customer {
    id: number
    name: string
    company?: { name: string } | null
}

interface Deal {
    id: number
    title: string
    value: number
    valueTRY: number
    stage: string
    probability: number
    expectedCloseDate: string | null
    lastContactDate: string | null
    notes: string | null
    customerId: number
    salesRep: string | null
    dealCompany: string | null
    productCategory: string | null
    productSubCategory: string | null
    currency: string
    source: string | null
    leadType: string | null
    tag: string | null
    isStale: boolean
    createdAt: string
    customer: Customer
    _count: { activities: number }
}

const STAGES = [
    { value: "LEAD", label: "Lead", color: "border-t-slate-400", bgColor: "bg-slate-50", headerColor: "bg-slate-100 text-slate-700" },
    { value: "QUALIFIED", label: "Nitelikli", color: "border-t-blue-400", bgColor: "bg-blue-50", headerColor: "bg-blue-100 text-blue-700" },
    { value: "PROPOSAL", label: "Teklif", color: "border-t-amber-400", bgColor: "bg-amber-50", headerColor: "bg-amber-100 text-amber-700" },
    { value: "NEGOTIATION", label: "Müzakere", color: "border-t-purple-400", bgColor: "bg-purple-50", headerColor: "bg-purple-100 text-purple-700" },
    { value: "WON", label: "Kazanıldı", color: "border-t-emerald-400", bgColor: "bg-emerald-50", headerColor: "bg-emerald-100 text-emerald-700" },
    { value: "LOST", label: "Kaybedildi", color: "border-t-rose-400", bgColor: "bg-rose-50", headerColor: "bg-rose-100 text-rose-700" },
]

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount)
}

export function DealPipeline({
    deals,
    customers
}: {
    deals: Deal[]
    customers: Customer[]
}) {
    const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingDeal, setEditingDeal] = useState<Deal | null>(null)
    const [isPending, startTransition] = useTransition()
    const [activeMenu, setActiveMenu] = useState<number | null>(null)

    // Drag and drop state
    const [draggedDealId, setDraggedDealId] = useState<number | null>(null)
    const [dragOverStage, setDragOverStage] = useState<string | null>(null)

    // Form state
    const [formTitle, setFormTitle] = useState("")
    const [formValue, setFormValue] = useState("")
    const [formValueTRY, setFormValueTRY] = useState("")
    const [formStage, setFormStage] = useState("LEAD")
    const [formProbability, setFormProbability] = useState("10")
    const [formCloseDate, setFormCloseDate] = useState("")
    const [formLastContactDate, setFormLastContactDate] = useState("")
    const [formCustomerId, setFormCustomerId] = useState("")
    const [formNotes, setFormNotes] = useState("")
    const [formSalesRep, setFormSalesRep] = useState("")
    const [formDealCompany, setFormDealCompany] = useState("")
    const [formProductCategory, setFormProductCategory] = useState("")
    const [formProductSubCategory, setFormProductSubCategory] = useState("")
    const [formCurrency, setFormCurrency] = useState("TRY")
    const [formSource, setFormSource] = useState("")
    const [formLeadType, setFormLeadType] = useState("")

    function resetForm() {
        setFormTitle("")
        setFormValue("")
        setFormValueTRY("")
        setFormStage("LEAD")
        setFormProbability("10")
        setFormCloseDate("")
        setFormLastContactDate("")
        setFormCustomerId("")
        setFormNotes("")
        setFormSalesRep("")
        setFormDealCompany("")
        setFormProductCategory("")
        setFormProductSubCategory("")
        setFormCurrency("TRY")
        setFormSource("")
        setFormLeadType("")
        setEditingDeal(null)
    }

    function openEditDialog(deal: Deal) {
        setEditingDeal(deal)
        setFormTitle(deal.title)
        setFormValue(deal.value.toString())
        setFormValueTRY(deal.valueTRY.toString())
        setFormStage(deal.stage)
        setFormProbability(deal.probability.toString())
        setFormCloseDate(deal.expectedCloseDate || "")
        setFormLastContactDate(deal.lastContactDate || "")
        setFormCustomerId(deal.customerId.toString())
        setFormNotes(deal.notes || "")
        setFormSalesRep(deal.salesRep || "")
        setFormDealCompany(deal.dealCompany || "")
        setFormProductCategory(deal.productCategory || "")
        setFormProductSubCategory(deal.productSubCategory || "")
        setFormCurrency(deal.currency || "TRY")
        setFormSource(deal.source || "")
        setFormLeadType(deal.leadType || "")
        setDialogOpen(true)
        setActiveMenu(null)
    }

    function handleSubmit() {
        if (!formTitle.trim() || !formCustomerId) return

        startTransition(async () => {
            const data = {
                title: formTitle.trim(),
                value: parseFloat(formValue) || 0,
                valueTRY: parseFloat(formValueTRY) || 0,
                stage: formStage,
                probability: parseInt(formProbability) || 0,
                expectedCloseDate: formCloseDate || undefined,
                lastContactDate: formLastContactDate || undefined,
                notes: formNotes.trim() || undefined,
                customerId: parseInt(formCustomerId),
                salesRep: formSalesRep.trim() || undefined,
                dealCompany: formDealCompany.trim() || undefined,
                productCategory: formProductCategory.trim() || undefined,
                productSubCategory: formProductSubCategory.trim() || undefined,
                currency: formCurrency || "TRY",
                source: formSource || undefined,
                leadType: formLeadType || undefined,
            }

            if (editingDeal) {
                await updateDeal(editingDeal.id, data)
            } else {
                await createDeal(data)
            }
            setDialogOpen(false)
            resetForm()
        })
    }

    function handleStageChange(dealId: number, newStage: string) {
        startTransition(async () => {
            await updateDealStage(dealId, newStage)
        })
    }

    function handleDelete(id: number) {
        if (!confirm("Bu fırsatı silmek istediğinize emin misiniz?")) return
        startTransition(async () => {
            await deleteDeal(id)
            setActiveMenu(null)
        })
    }

    // Drag and drop handlers
    function handleDragStart(e: React.DragEvent, dealId: number) {
        setDraggedDealId(dealId)
        e.dataTransfer.effectAllowed = 'move'
        // Make the drag image slightly transparent
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '0.5'
        }
    }

    function handleDragEnd(e: React.DragEvent) {
        setDraggedDealId(null)
        setDragOverStage(null)
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '1'
        }
    }

    function handleDragOver(e: React.DragEvent, stageValue: string) {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        setDragOverStage(stageValue)
    }

    function handleDragLeave() {
        setDragOverStage(null)
    }

    function handleDrop(e: React.DragEvent, targetStage: string) {
        e.preventDefault()
        setDragOverStage(null)
        if (draggedDealId === null) return

        const deal = deals.find(d => d.id === draggedDealId)
        if (deal && deal.stage !== targetStage) {
            handleStageChange(draggedDealId, targetStage)
        }
        setDraggedDealId(null)
    }

    const totalPipeline = deals.filter(d => !["WON", "LOST"].includes(d.stage)).reduce((s, d) => s + d.value, 0)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Fırsatlar</h1>
                    <p className="text-muted-foreground mt-1">
                        {deals.length} fırsat · Pipeline: {formatCurrency(totalPipeline)}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center border rounded-lg p-0.5">
                        <button
                            onClick={() => setViewMode("kanban")}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === "kanban" ? "bg-gray-100 text-gray-900" : "text-gray-400"}`}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-1.5 rounded-md transition-colors ${viewMode === "list" ? "bg-gray-100 text-gray-900" : "text-gray-400"}`}
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                    <Dialog open={dialogOpen} onOpenChange={(open) => {
                        setDialogOpen(open)
                        if (!open) resetForm()
                    }}>
                        <DialogTrigger asChild>
                            <Button className="bg-indigo-600 hover:bg-indigo-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Yeni Fırsat
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>{editingDeal ? "Fırsat Düzenle" : "Yeni Fırsat Ekle"}</DialogTitle>
                                <DialogDescription>
                                    {editingDeal ? "Fırsat bilgilerini güncelleyin." : "Yeni bir satış fırsatı oluşturun."}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                {/* Row 1: Title */}
                                <div className="grid gap-2">
                                    <Label htmlFor="title">Konu / Fırsat Adı *</Label>
                                    <Input
                                        id="title"
                                        value={formTitle}
                                        onChange={(e) => setFormTitle(e.target.value)}
                                        placeholder="Proje adı veya fırsat başlığı"
                                    />
                                </div>
                                {/* Row 2: Müşteri + Fırsat Firması */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Müşteri / Şirket *</Label>
                                        <Select value={formCustomerId} onValueChange={setFormCustomerId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Müşteri seçin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {customers.map(c => (
                                                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="dealCompany">Fırsat Firması</Label>
                                        <Input
                                            id="dealCompany"
                                            value={formDealCompany}
                                            onChange={(e) => setFormDealCompany(e.target.value)}
                                            placeholder="Ör: ThinkOne Teknoloji"
                                        />
                                    </div>
                                </div>
                                {/* Row 3: Value + Currency + TL */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="value">Lead Değeri</Label>
                                        <Input
                                            id="value"
                                            type="number"
                                            value={formValue}
                                            onChange={(e) => setFormValue(e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Para Birimi</Label>
                                        <Select value={formCurrency} onValueChange={setFormCurrency}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="TRY">TRY (₺)</SelectItem>
                                                <SelectItem value="USD">USD ($)</SelectItem>
                                                <SelectItem value="EUR">EUR (€)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="valueTRY">TL Karşılığı</Label>
                                        <Input
                                            id="valueTRY"
                                            type="number"
                                            value={formValueTRY}
                                            onChange={(e) => setFormValueTRY(e.target.value)}
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                {/* Row 4: Stage + Probability + Source */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Aşama</Label>
                                        <Select value={formStage} onValueChange={setFormStage}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {STAGES.map(s => (
                                                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="probability">Olasılık (%)</Label>
                                        <Input
                                            id="probability"
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={formProbability}
                                            onChange={(e) => setFormProbability(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Kaynak</Label>
                                        <Select value={formSource} onValueChange={setFormSource}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seçin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Ortak">Ortak</SelectItem>
                                                <SelectItem value="Doğrudan">Doğrudan</SelectItem>
                                                <SelectItem value="Çalışan Yönlendirmesi">Çalışan Yönlendirmesi</SelectItem>
                                                <SelectItem value="Dışarıdan Yönlendirme">Dışarıdan Yönlendirme</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                {/* Row 5: Lead Type + Sales Rep + Dates */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Potansiyel Müşteri Türü</Label>
                                        <Select value={formLeadType} onValueChange={setFormLeadType}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seçin" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Yeni Müşteri">Yeni Müşteri</SelectItem>
                                                <SelectItem value="Yeni İş">Yeni İş</SelectItem>
                                                <SelectItem value="Mevcut Müşteri">Mevcut Müşteri</SelectItem>
                                                <SelectItem value="Mevcut İş">Mevcut İş</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="salesRep">Satış Temsilcisi</Label>
                                        <Input
                                            id="salesRep"
                                            value={formSalesRep}
                                            onChange={(e) => setFormSalesRep(e.target.value)}
                                            placeholder="Ad Soyad"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="closeDate">Tahmini Kapanış</Label>
                                        <Input
                                            id="closeDate"
                                            type="date"
                                            value={formCloseDate}
                                            onChange={(e) => setFormCloseDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                                {/* Row 6: Product Category + SubCategory + Last Contact */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="productCategory">Ürün Kategorisi</Label>
                                        <Input
                                            id="productCategory"
                                            value={formProductCategory}
                                            onChange={(e) => setFormProductCategory(e.target.value)}
                                            placeholder="Ör: Security"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="productSubCategory">Ürün Alt Kategorisi</Label>
                                        <Input
                                            id="productSubCategory"
                                            value={formProductSubCategory}
                                            onChange={(e) => setFormProductSubCategory(e.target.value)}
                                            placeholder="Ör: CTI"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="lastContactDate">Son Temas Tarihi</Label>
                                        <Input
                                            id="lastContactDate"
                                            type="date"
                                            value={formLastContactDate}
                                            onChange={(e) => setFormLastContactDate(e.target.value)}
                                        />
                                    </div>
                                </div>
                                {/* Row 7: Notes */}
                                <div className="grid gap-2">
                                    <Label htmlFor="notes">Notlar</Label>
                                    <textarea
                                        id="notes"
                                        className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={formNotes}
                                        onChange={(e) => setFormNotes(e.target.value)}
                                        placeholder="Fırsat hakkında notlar..."
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">İptal</Button>
                                </DialogClose>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={!formTitle.trim() || !formCustomerId || isPending}
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                >
                                    {isPending ? "Kaydediliyor..." : editingDeal ? "Güncelle" : "Ekle"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Kanban View */}
            {viewMode === "kanban" ? (
                <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 280px)' }}>
                    {STAGES.map(stage => {
                        const stageDeals = deals.filter(d => d.stage === stage.value)
                        const stageTotal = stageDeals.reduce((s, d) => s + d.value, 0)

                        return (
                            <div
                                key={stage.value}
                                className={`flex-shrink-0 w-[280px] rounded-xl border-t-4 ${stage.color} bg-white transition-all duration-200 ${dragOverStage === stage.value
                                    ? 'ring-2 ring-indigo-400 ring-offset-2 scale-[1.01]'
                                    : ''
                                    }`}
                                onDragOver={(e) => handleDragOver(e, stage.value)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, stage.value)}
                            >
                                {/* Column Header */}
                                <div className="p-3 border-b">
                                    <div className="flex items-center justify-between">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stage.headerColor}`}>
                                            {stage.label}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{stageDeals.length}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">{formatCurrency(stageTotal)}</p>
                                </div>

                                {/* Cards */}
                                <div className="p-2 space-y-2 max-h-[calc(100vh-380px)] overflow-y-auto">
                                    {stageDeals.length === 0 ? (
                                        <div className={`p-4 rounded-lg ${stage.bgColor} text-center text-xs text-muted-foreground`}>
                                            Fırsat yok
                                        </div>
                                    ) : (
                                        stageDeals.map(deal => (
                                            <div
                                                key={deal.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, deal.id)}
                                                onDragEnd={handleDragEnd}
                                                className={`p-3 rounded-lg border bg-white hover:shadow-md transition-all cursor-grab active:cursor-grabbing group ${draggedDealId === deal.id ? 'opacity-50 scale-95 shadow-lg' : ''
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-1.5 flex-1 mr-2">
                                                        <GripVertical className="h-3 w-3 text-gray-300 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        <h4 className="text-sm font-medium leading-tight">{deal.title}</h4>
                                                    </div>
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setActiveMenu(activeMenu === deal.id ? null : deal.id)}
                                                            className="p-0.5 rounded hover:bg-gray-100 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <MoreHorizontal className="h-3.5 w-3.5" />
                                                        </button>
                                                        {activeMenu === deal.id && (
                                                            <div className="absolute right-0 top-6 z-20 w-40 rounded-md border bg-white shadow-lg py-1">
                                                                <button
                                                                    onClick={() => openEditDialog(deal)}
                                                                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-50"
                                                                >
                                                                    <Edit className="h-3 w-3" />
                                                                    Düzenle
                                                                </button>
                                                                {/* Stage transitions */}
                                                                {STAGES.filter(s => s.value !== deal.stage).map(s => (
                                                                    <button
                                                                        key={s.value}
                                                                        onClick={() => {
                                                                            handleStageChange(deal.id, s.value)
                                                                            setActiveMenu(null)
                                                                        }}
                                                                        className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-50"
                                                                    >
                                                                        <ArrowRight className="h-3 w-3" />
                                                                        {s.label}&apos;a taşı
                                                                    </button>
                                                                ))}
                                                                <hr className="my-1" />
                                                                <button
                                                                    onClick={() => handleDelete(deal.id)}
                                                                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                                                                >
                                                                    <Trash2 className="h-3 w-3" />
                                                                    Sil
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                                    <Building2 className="h-3 w-3" />
                                                    {deal.customer.name}
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-sm font-semibold text-indigo-600">
                                                        {formatCurrency(deal.value)}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        %{deal.probability}
                                                    </span>
                                                </div>
                                                {deal.expectedCloseDate && (
                                                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                                                        <Calendar className="h-2.5 w-2.5" />
                                                        {deal.expectedCloseDate}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                /* List View */
                <Card>
                    <CardContent className="p-0">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="p-4 font-medium">Fırsat</th>
                                    <th className="p-4 font-medium">Müşteri</th>
                                    <th className="p-4 font-medium">Aşama</th>
                                    <th className="p-4 font-medium text-right">Tutar</th>
                                    <th className="p-4 font-medium text-right">Olasılık</th>
                                    <th className="p-4 font-medium text-right">Tahmini Kapanış</th>
                                    <th className="p-4 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {deals.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="p-8 text-center text-muted-foreground">
                                            <Handshake className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                                            Henüz fırsat kaydı yok.
                                        </td>
                                    </tr>
                                ) : (
                                    deals.map(deal => {
                                        const stageDef = STAGES.find(s => s.value === deal.stage)
                                        return (
                                            <tr key={deal.id} className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="p-4 font-medium">{deal.title}</td>
                                                <td className="p-4 text-muted-foreground">{deal.customer.name}</td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${stageDef?.headerColor}`}>
                                                        {stageDef?.label}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right font-semibold">{formatCurrency(deal.value)}</td>
                                                <td className="p-4 text-right">%{deal.probability}</td>
                                                <td className="p-4 text-right text-muted-foreground text-xs">{deal.expectedCloseDate || "—"}</td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center gap-1 justify-end">
                                                        <button
                                                            onClick={() => openEditDialog(deal)}
                                                            className="p-1 rounded hover:bg-gray-100 text-gray-400"
                                                        >
                                                            <Edit className="h-3.5 w-3.5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(deal.id)}
                                                            className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
