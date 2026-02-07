"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface DashboardFilterProps {
    companies: { id: number; name: string }[]
    categories: { id: number; name: string }[]
}

export function DashboardFilter({ companies, categories }: DashboardFilterProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentYear = searchParams.get("year") || new Date().getFullYear().toString()
    const currentMonth = searchParams.get("month") || ""
    const currentCompany = searchParams.get("companyId") || ""
    const currentCategory = searchParams.get("categoryId") || ""

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value && value !== "all") {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`/?${params.toString()}`)
    }

    const clearFilters = () => {
        router.push("/")
    }

    const months = [
        { value: "1", label: "Ocak" },
        { value: "2", label: "Şubat" },
        { value: "3", label: "Mart" },
        { value: "4", label: "Nisan" },
        { value: "5", label: "Mayıs" },
        { value: "6", label: "Haziran" },
        { value: "7", label: "Temmuz" },
        { value: "8", label: "Ağustos" },
        { value: "9", label: "Eylül" },
        { value: "10", label: "Ekim" },
        { value: "11", label: "Kasım" },
        { value: "12", label: "Aralık" },
    ]

    const years = [2024, 2025, 2026, 2027, 2028]

    return (
        <div className="flex flex-wrap gap-2 items-center bg-card p-4 rounded-lg border shadow-sm">
            <Select value={currentYear} onValueChange={(val) => updateFilter("year", val)}>
                <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Yıl" />
                </SelectTrigger>
                <SelectContent>
                    {years.map(y => (
                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={currentMonth} onValueChange={(val) => updateFilter("month", val)}>
                <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Tüm Aylar" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tüm Aylar</SelectItem>
                    {months.map(m => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={currentCompany} onValueChange={(val) => updateFilter("companyId", val)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tüm Şirketler" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tüm Şirketler</SelectItem>
                    {companies.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select value={currentCategory} onValueChange={(val) => updateFilter("categoryId", val)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tüm Kategoriler" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Tüm Kategoriler</SelectItem>
                    {categories.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {(currentMonth || currentCompany || currentCategory || currentYear !== new Date().getFullYear().toString()) && (
                <Button variant="ghost" size="icon" onClick={clearFilters}>
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
    )
}
