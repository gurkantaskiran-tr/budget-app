"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ChevronDown, Trash, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import * as XLSX from 'xlsx'
import { deleteEntries } from "@/lib/actions"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [globalFilter, setGlobalFilter] = React.useState("")
    const [isDeleteOpen, setIsDeleteOpen] = React.useState(false)

    // Add selection column if not present
    const tableColumns = React.useMemo(() => {
        const selectionColumn: ColumnDef<TData, TValue> = {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        }
        return [selectionColumn, ...columns]
    }, [columns])

    const table = useReactTable({
        data,
        columns: tableColumns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
    })

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1")
        XLSX.writeFile(wb, "DataExport.xlsx")
    }

    const confirmDelete = async () => {
        try {
            const selectedRows = table.getFilteredSelectedRowModel().rows
            const ids = selectedRows.map((row) => (row.original as any).id as number)

            console.log("Deleting ids:", ids)
            await deleteEntries(ids)
            setRowSelection({})
            setIsDeleteOpen(false)
        } catch (error) {
            console.error("Delete failed:", error)
            alert("Silme işlemi sırasında bir hata oluştu.")
        }
    }

    // Helper for unique values for filters
    const getUniqueValues = (key: string, accessorKey?: string) => {
        const dataKey = accessorKey || key
        const values = Array.from(new Set(data.map((item: any) => {
            if (dataKey.includes('.')) {
                return dataKey.split('.').reduce((obj, k) => obj?.[k], item)
            }
            return item[dataKey]
        }))).filter(Boolean)
        return values.sort() as string[] | number[]
    }

    // Filter Components
    const renderFilter = (columnId: string, title: string, accessorKey?: string) => {
        const values = getUniqueValues(columnId, accessorKey)
        const column = table.getColumn(columnId)
        const currentFilterValue = (column?.getFilterValue() as any[]) || []

        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 border-dashed">
                        <Filter className="mr-2 h-4 w-4" />
                        {title}
                        {currentFilterValue.length > 0 && (
                            <span className="ml-1 rounded-sm bg-secondary px-1 font-normal lg:hidden">
                                {currentFilterValue.length}
                            </span>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[200px]">
                    <DropdownMenuLabel>{title} Filtrele</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {values.map((value) => {
                        const isSelected = currentFilterValue.includes(value)
                        return (
                            <DropdownMenuCheckboxItem
                                key={String(value)}
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                    const newValue = checked
                                        ? [...currentFilterValue, value]
                                        : currentFilterValue.filter((v: any) => v !== value)
                                    column?.setFilterValue(newValue.length ? newValue : undefined)
                                }}
                            >
                                {String(value)}
                            </DropdownMenuCheckboxItem>
                        )
                    })}
                    {currentFilterValue.length > 0 && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onSelect={() => column?.setFilterValue(undefined)}
                                className="justify-center text-center"
                            >
                                Filtreyi Temizle
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    return (
        <div className="w-full">
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Seçilen {Object.keys(rowSelection).length} kaydı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
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

            <div className="flex items-center py-4 space-x-2">
                <Input
                    placeholder="Ara (Açıklama, Şirket, Kategori)..."
                    value={(table.getState().globalFilter as string) ?? ""}
                    onChange={(event) =>
                        table.setGlobalFilter(event.target.value)
                    }
                    className="max-w-sm"
                />

                {Object.keys(rowSelection).length > 0 && (
                    <Button variant="destructive" size="sm" onClick={() => setIsDeleteOpen(true)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Seçilenleri Sil ({Object.keys(rowSelection).length})
                    </Button>
                )}

                {/* Filters */}
                {table.getColumn("categoryName") && renderFilter("categoryName", "Kategori", "category.name")}
                {table.getColumn("companyName") && renderFilter("companyName", "Şirket", "company.name")}
                {table.getColumn("year") && renderFilter("year", "Yıl")}

                {/* Month Handling */}
                {table.getColumn("month") && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 border-dashed">
                                <Filter className="mr-2 h-4 w-4" />
                                Ay
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-[200px]">
                            {[...Array(12)].map((_, i) => (
                                <DropdownMenuCheckboxItem
                                    key={i + 1}
                                    checked={(table.getColumn("month")?.getFilterValue() as any[])?.includes(i + 1)}
                                    onCheckedChange={(checked) => {
                                        const current = (table.getColumn("month")?.getFilterValue() as any[]) || []
                                        const newValue = checked
                                            ? [...current, i + 1]
                                            : current.filter((v) => v !== i + 1)
                                        table.getColumn("month")?.setFilterValue(newValue.length ? newValue : undefined)
                                    }}
                                >
                                    {new Date(0, i).toLocaleString('tr-TR', { month: 'long' })}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}

                <Button variant="outline" size="sm" onClick={handleExport} className="ml-auto">
                    Excel&apos;e Aktar
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-2">
                            Kolonlar <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length + 1}
                                    className="h-24 text-center"
                                >
                                    Sonuç bulunamadı.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} /{" "}
                    {table.getFilteredRowModel().rows.length} satır seçildi.
                </div>

                <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium">Sayfa Başına:</p>
                    <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={(value) => {
                            table.setPageSize(Number(value))
                        }}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={`${table.getState().pagination.pageSize}`} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 50, 100, 200, 1000].map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Önceki
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Sonraki
                    </Button>
                </div>
            </div>
        </div>
    )
}
