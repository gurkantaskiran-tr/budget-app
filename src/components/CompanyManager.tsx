"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { createCompany, deleteCompany, updateCompany, bulkDeleteCompanies } from "@/lib/actions"
import { Trash2, Pencil, Check, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface Company {
    id: number
    name: string
}

interface CompanyManagerProps {
    companies: Company[]
}

export function CompanyManager({ companies }: CompanyManagerProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [newCompanyName, setNewCompanyName] = useState("")
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editName, setEditName] = useState("")
    const [selectedIds, setSelectedIds] = useState<number[]>([])

    // Delete dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)

    function handleAdd() {
        if (!newCompanyName.trim()) return
        startTransition(async () => {
            await createCompany(newCompanyName)
            setNewCompanyName("")
            router.refresh()
        })
    }

    function openDeleteDialog(id: number) {
        setDeleteTargetId(id)
        setDeleteDialogOpen(true)
    }

    function confirmDelete() {
        if (deleteTargetId === null) return
        startTransition(async () => {
            const result = await deleteCompany(deleteTargetId)
            if (!result.success) {
                alert(result.error)
            }
            setDeleteDialogOpen(false)
            setDeleteTargetId(null)
            router.refresh()
        })
    }

    function openBulkDeleteDialog() {
        setBulkDeleteDialogOpen(true)
    }

    function confirmBulkDelete() {
        startTransition(async () => {
            const result = await bulkDeleteCompanies(selectedIds)
            if (!result.success) {
                alert(result.error)
            } else {
                setSelectedIds([])
            }
            setBulkDeleteDialogOpen(false)
            router.refresh()
        })
    }

    function startEdit(company: Company) {
        setEditingId(company.id)
        setEditName(company.name)
    }

    function saveEdit(id: number) {
        if (!editName.trim()) return
        startTransition(async () => {
            await updateCompany(id, editName)
            setEditingId(null)
            router.refresh()
        })
    }

    function cancelEdit() {
        setEditingId(null)
        setEditName("")
    }

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(companies.map(c => c.id))
        } else {
            setSelectedIds([])
        }
    }

    const toggleSelect = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id])
        } else {
            setSelectedIds(prev => prev.filter(item => item !== id))
        }
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Şirket Yönetimi</CardTitle>
                    {selectedIds.length > 0 && (
                        <Button variant="destructive" size="sm" onClick={openBulkDeleteDialog} disabled={isPending}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Seçilenleri Sil ({selectedIds.length})
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <div className="flex gap-4 items-end">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="comp-name">Şirket Adı</Label>
                            <Input
                                id="comp-name"
                                value={newCompanyName}
                                onChange={(e) => setNewCompanyName(e.target.value)}
                                placeholder="Örn: Şirket A"
                            />
                        </div>
                        <Button onClick={handleAdd} disabled={isPending}>Ekle</Button>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox
                                            checked={companies.length > 0 && selectedIds.length === companies.length}
                                            onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                                            aria-label="Select all"
                                        />
                                    </TableHead>
                                    <TableHead>Ad</TableHead>
                                    <TableHead className="w-[100px]">İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {companies.map((company) => (
                                    <TableRow key={company.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedIds.includes(company.id)}
                                                onCheckedChange={(checked) => toggleSelect(company.id, !!checked)}
                                                aria-label={`Select ${company.name}`}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {editingId === company.id ? (
                                                <Input
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                />
                                            ) : (
                                                company.name
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {editingId === company.id ? (
                                                    <>
                                                        <Button variant="ghost" size="icon" onClick={() => saveEdit(company.id)} disabled={isPending}>
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={cancelEdit}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button variant="ghost" size="icon" onClick={() => startEdit(company)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(company.id)} disabled={isPending}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Single Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Şirket Silme</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu şirketi silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve şirkete bağlı tüm kayıtlar da silinecektir.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Sil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Delete Dialog */}
            <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Toplu Silme</AlertDialogTitle>
                        <AlertDialogDescription>
                            Seçili {selectedIds.length} şirketi silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve şirketlere bağlı tüm kayıtlar da silinecektir.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmBulkDelete} className="bg-red-600 hover:bg-red-700">
                            Sil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
