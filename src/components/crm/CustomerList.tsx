"use client"

import { useState, useTransition } from "react"
import { createCustomer, updateCustomer, deleteCustomer } from "@/lib/crm-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    Mail,
    Phone,
    Building2,
    MoreHorizontal,
    Edit,
    Trash2,
    Handshake,
    MapPin,
    Users
} from "lucide-react"
import Link from "next/link"

interface Company {
    id: number
    name: string
}

interface Customer {
    id: number
    name: string
    email: string | null
    phone: string | null
    address: string | null
    status: string
    notes: string | null
    companyId: number | null
    createdAt: string
    company: Company | null
    _count: {
        contacts: number
        deals: number
        activities: number
    }
}

const STATUS_OPTIONS = [
    { value: "ACTIVE", label: "Aktif", color: "bg-emerald-100 text-emerald-700" },
    { value: "LEAD", label: "Lead", color: "bg-blue-100 text-blue-700" },
    { value: "INACTIVE", label: "Pasif", color: "bg-gray-100 text-gray-700" },
]

export function CustomerList({
    customers,
    companies
}: {
    customers: Customer[]
    companies: Company[]
}) {
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("ALL")
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
    const [isPending, startTransition] = useTransition()
    const [activeMenu, setActiveMenu] = useState<number | null>(null)

    // Form state
    const [formName, setFormName] = useState("")
    const [formEmail, setFormEmail] = useState("")
    const [formPhone, setFormPhone] = useState("")
    const [formAddress, setFormAddress] = useState("")
    const [formStatus, setFormStatus] = useState("ACTIVE")
    const [formCompanyId, setFormCompanyId] = useState<string>("")
    const [formNotes, setFormNotes] = useState("")

    const filteredCustomers = customers.filter(c => {
        const matchesSearch = search === "" ||
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.email?.toLowerCase().includes(search.toLowerCase()) ||
            c.phone?.includes(search)
        const matchesStatus = statusFilter === "ALL" || c.status === statusFilter
        return matchesSearch && matchesStatus
    })

    function resetForm() {
        setFormName("")
        setFormEmail("")
        setFormPhone("")
        setFormAddress("")
        setFormStatus("ACTIVE")
        setFormCompanyId("")
        setFormNotes("")
        setEditingCustomer(null)
    }

    function openEditDialog(customer: Customer) {
        setEditingCustomer(customer)
        setFormName(customer.name)
        setFormEmail(customer.email || "")
        setFormPhone(customer.phone || "")
        setFormAddress(customer.address || "")
        setFormStatus(customer.status)
        setFormCompanyId(customer.companyId?.toString() || "")
        setFormNotes(customer.notes || "")
        setDialogOpen(true)
        setActiveMenu(null)
    }

    function handleSubmit() {
        if (!formName.trim()) return

        startTransition(async () => {
            const data = {
                name: formName.trim(),
                email: formEmail.trim() || undefined,
                phone: formPhone.trim() || undefined,
                address: formAddress.trim() || undefined,
                status: formStatus,
                notes: formNotes.trim() || undefined,
                companyId: formCompanyId ? parseInt(formCompanyId) : undefined,
            }

            if (editingCustomer) {
                await updateCustomer(editingCustomer.id, data)
            } else {
                await createCustomer(data)
            }
            setDialogOpen(false)
            resetForm()
        })
    }

    function handleDelete(id: number) {
        if (!confirm("Bu müşteriyi silmek istediğinize emin misiniz?")) return
        startTransition(async () => {
            await deleteCustomer(id)
            setActiveMenu(null)
        })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Müşteriler</h1>
                    <p className="text-muted-foreground mt-1">
                        Toplam {customers.length} müşteri kayıtlı
                    </p>
                </div>
                <Dialog open={dialogOpen} onOpenChange={(open) => {
                    setDialogOpen(open)
                    if (!open) resetForm()
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Yeni Müşteri
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{editingCustomer ? "Müşteri Düzenle" : "Yeni Müşteri Ekle"}</DialogTitle>
                            <DialogDescription>
                                {editingCustomer ? "Müşteri bilgilerini güncelleyin." : "Yeni bir müşteri kaydı oluşturun."}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Ad Soyad / Firma *</Label>
                                <Input
                                    id="name"
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="Müşteri adı"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">E-posta</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formEmail}
                                        onChange={(e) => setFormEmail(e.target.value)}
                                        placeholder="ornek@email.com"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="phone">Telefon</Label>
                                    <Input
                                        id="phone"
                                        value={formPhone}
                                        onChange={(e) => setFormPhone(e.target.value)}
                                        placeholder="+90 ..."
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address">Adres</Label>
                                <Input
                                    id="address"
                                    value={formAddress}
                                    onChange={(e) => setFormAddress(e.target.value)}
                                    placeholder="Adres bilgisi"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Durum</Label>
                                    <Select value={formStatus} onValueChange={setFormStatus}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {STATUS_OPTIONS.map(opt => (
                                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Şirket</Label>
                                    <Select value={formCompanyId} onValueChange={setFormCompanyId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Şirket seçin" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {companies.map(c => (
                                                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notlar</Label>
                                <textarea
                                    id="notes"
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={formNotes}
                                    onChange={(e) => setFormNotes(e.target.value)}
                                    placeholder="Müşteri hakkında notlar..."
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">İptal</Button>
                            </DialogClose>
                            <Button
                                onClick={handleSubmit}
                                disabled={!formName.trim() || isPending}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                {isPending ? "Kaydediliyor..." : editingCustomer ? "Güncelle" : "Ekle"}
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
                        placeholder="Müşteri ara..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Durum" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">Tüm Durumlar</SelectItem>
                        {STATUS_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Customer Cards */}
            {filteredCustomers.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">
                            {search || statusFilter !== "ALL" ? "Filtrelere uygun müşteri bulunamadı." : "Henüz müşteri kaydı yok."}
                        </p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => setDialogOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            İlk müşteriyi ekle
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredCustomers.map(customer => {
                        const statusOpt = STATUS_OPTIONS.find(s => s.value === customer.status)
                        return (
                            <Card key={customer.id} className="relative group hover:shadow-md transition-shadow">
                                <CardContent className="pt-6">
                                    {/* Menu */}
                                    <div className="absolute top-3 right-3">
                                        <button
                                            onClick={() => setActiveMenu(activeMenu === customer.id ? null : customer.id)}
                                            className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                        {activeMenu === customer.id && (
                                            <div className="absolute right-0 top-8 z-10 w-36 rounded-md border bg-white shadow-lg py-1">
                                                <button
                                                    onClick={() => openEditDialog(customer)}
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50"
                                                >
                                                    <Edit className="h-3.5 w-3.5" />
                                                    Düzenle
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(customer.id)}
                                                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    Sil
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Customer Info */}
                                    <div className="flex items-start gap-3 mb-4">
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                                            {customer.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold truncate">{customer.name}</h3>
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium mt-1 ${statusOpt?.color}`}>
                                                {statusOpt?.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                                        {customer.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3.5 w-3.5" />
                                                <span className="truncate">{customer.email}</span>
                                            </div>
                                        )}
                                        {customer.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-3.5 w-3.5" />
                                                <span>{customer.phone}</span>
                                            </div>
                                        )}
                                        {customer.company && (
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-3.5 w-3.5" />
                                                <span>{customer.company.name}</span>
                                            </div>
                                        )}
                                        {customer.address && (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-3.5 w-3.5" />
                                                <span className="truncate">{customer.address}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 pt-3 border-t text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {customer._count.contacts} kişi
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Handshake className="h-3 w-3" />
                                            {customer._count.deals} fırsat
                                        </div>
                                        <div className="ml-auto text-[10px]">
                                            {new Date(customer.createdAt).toLocaleDateString('tr-TR')}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
