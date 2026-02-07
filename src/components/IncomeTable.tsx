"use client"

import { DataTable } from "@/components/DataTable"
import { EntryActions } from "@/components/EntryActions"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export function IncomeTable({ data }: { data: any[] }) {
    const columns: ColumnDef<any>[] = [
        {
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="px-0 hover:bg-transparent"
                    >
                        Şirket
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            accessorKey: "company.name",
            id: "companyName",
            cell: ({ row }) => row.original.company.name,
            filterFn: (row, id, value: string[]) => value.includes(row.getValue(id))
        },
        {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="px-0 hover:bg-transparent"
                >
                    Kategori
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            accessorKey: "category.name",
            id: "categoryName",
            cell: ({ row }) => row.original.category.name,
            filterFn: (row, id, value: string[]) => value.includes(row.getValue(id))
        },
        { header: "Açıklama", accessorKey: "description" },
        {
            header: "Ay", accessorKey: "month", cell: ({ row }) => {
                const date = new Date(0, row.original.month - 1);
                return date.toLocaleString('tr-TR', { month: 'long' });
            },
            filterFn: (row, id, value: number[]) => {
                return value.includes(row.getValue(id));
            }
        },
        { header: "Yıl", accessorKey: "year", filterFn: (row, id, value: string[]) => value.includes(String(row.getValue(id))) },
        {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="px-0 hover:bg-transparent"
                >
                    Bütçe
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            accessorKey: "budgetAmount",
            cell: ({ row }) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(row.original.budgetAmount)
        },
        {
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="px-0 hover:bg-transparent"
                >
                    Gerçekleşen
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            accessorKey: "actualAmount",
            cell: ({ row }) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(row.original.actualAmount)
        },
        {
            header: "Fark",
            accessorKey: "variance",
            cell: ({ row }) => {
                const variance = row.original.actualAmount - row.original.budgetAmount;
                const isPositive = variance >= 0;
                return (
                    <span className={isPositive ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(variance)}
                    </span>
                )
            }
        },
        {
            header: "İşlemler",
            id: "actions",
            cell: ({ row }) => <EntryActions entry={row.original} />
        }
    ]

    return <DataTable columns={columns} data={data} />
}
