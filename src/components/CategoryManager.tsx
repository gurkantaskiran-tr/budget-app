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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
import { createCategory, deleteCategory, updateCategory, bulkDeleteCategories } from "@/lib/actions"
import { Trash2, Pencil, Check, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

interface Category {
    id: number
    name: string
    type: string
}

interface CategoryManagerProps {
    categories: Category[]
}

export function CategoryManager({ categories }: CategoryManagerProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [newCategoryName, setNewCategoryName] = useState("")
    const [newCategoryType, setNewCategoryType] = useState("EXPENSE")
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editName, setEditName] = useState("")
    const [selectedIds, setSelectedIds] = useState<number[]>([])

    // Delete dialog state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)

    async function handleAdd() {
        if (!newCategoryName.trim()) return
        startTransition(async () => {
            await createCategory({ name: newCategoryName, type: newCategoryType })
            setNewCategoryName("")
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
            const result = await deleteCategory(deleteTargetId)
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
            const result = await bulkDeleteCategories(selectedIds)
            if (!result.success) {
                alert(result.error)
            } else {
                setSelectedIds([])
            }
            setBulkDeleteDialogOpen(false)
            router.refresh()
        })
    }

    function startEdit(category: Category) {
        setEditingId(category.id)
        setEditName(category.name)
    }

    function saveEdit(id: number) {
        if (!editName.trim()) return
        startTransition(async () => {
            await updateCategory(id, editName)
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
            setSelectedIds(categories.map(c => c.id))
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
                    <CardTitle>Kategori Yönetimi</CardTitle>
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
                            <Label htmlFor="cat-name">Kategori Adı</Label>
                            <Input
                                id="cat-name"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Örn: Market, Kira"
                            />
                        </div>
                        <div className="grid w-full max-w-[150px] items-center gap-1.5">
                            <Label htmlFor="cat-type">Tür</Label>
                            <Select value={newCategoryType} onValueChange={setNewCategoryType}>
                                <SelectTrigger id="cat-type">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="INCOME">Gelir</SelectItem>
                                    <SelectItem value="EXPENSE">Gider</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleAdd} disabled={isPending}>Ekle</Button>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">
                                        <Checkbox
                                            checked={categories.length > 0 && selectedIds.length === categories.length}
                                            onCheckedChange={(checked) => toggleSelectAll(!!checked)}
                                            aria-label="Select all"
                                        />
                                    </TableHead>
                                    <TableHead>Ad</TableHead>
                                    <TableHead>Tür</TableHead>
                                    <TableHead className="w-[100px]">İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedIds.includes(category.id)}
                                                onCheckedChange={(checked) => toggleSelect(category.id, !!checked)}
                                                aria-label={`Select ${category.name}`}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {editingId === category.id ? (
                                                <Input
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                />
                                            ) : (
                                                category.name
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {category.type === "INCOME" ? (
                                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
                                                    Gelir
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800">
                                                    Gider
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {editingId === category.id ? (
                                                    <>
                                                        <Button variant="ghost" size="icon" onClick={() => saveEdit(category.id)} disabled={isPending}>
                                                            <Check className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={cancelEdit}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button variant="ghost" size="icon" onClick={() => startEdit(category)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(category.id)} disabled={isPending}>
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
                        <AlertDialogTitle>Kategori Silme</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu kategoriyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve kategoriye bağlı tüm kayıtlar da silinecektir.
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
                            Seçili {selectedIds.length} kategoriyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz ve kategorilere bağlı tüm kayıtlar da silinecektir.
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
