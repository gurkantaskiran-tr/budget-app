"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useState } from "react"
import { createEntry } from "@/lib/actions"
import { Plus } from "lucide-react"

import { Switch } from "@/components/ui/switch"

const formSchema = z.object({
    companyId: z.string().min(1, "Company is required"),
    categoryId: z.string().min(1, "Category is required"),
    month: z.string().min(1, "Month is required"),
    year: z.string(),
    description: z.string().optional(),
    budgetAmount: z.string().refine((val) => !isNaN(Number(val)), "Must be a number"),
    actualAmount: z.string().refine((val) => !isNaN(Number(val)), "Must be a number"),
    isRecurring: z.boolean().default(false),
    repeatCount: z.string().optional(),
})

interface EntryDialogProps {
    type: "INCOME" | "EXPENSE"
    companies: { id: number; name: string }[]
    categories: { id: number; name: string }[]
}

export function EntryDialog({ type, companies, categories }: EntryDialogProps) {
    const [open, setOpen] = useState(false)
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            budgetAmount: "0",
            actualAmount: "0",
            year: "2026",
            companyId: "",
            categoryId: "",
            month: "",
            isRecurring: false,
            repeatCount: "12",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await createEntry({
                companyId: parseInt(values.companyId),
                categoryId: parseInt(values.categoryId),
                month: parseInt(values.month),
                year: parseInt(values.year),
                budgetAmount: parseFloat(values.budgetAmount),
                actualAmount: parseFloat(values.actualAmount),
                description: values.description,
                isRecurring: values.isRecurring,
                repeatCount: values.repeatCount ? parseInt(values.repeatCount) : 1
            })
            setOpen(false)
            form.reset()
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Yeni {type === "INCOME" ? "Gelir" : "Gider"} Ekle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Yeni {type === "INCOME" ? "Gelir" : "Gider"} Kaydı</DialogTitle>
                    <DialogDescription>
                        Bütçe ve gerçekleşen tutarları giriniz.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="companyId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Şirket</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Şirket Seçiniz" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {companies.map((company) => (
                                                <SelectItem key={company.id} value={company.id.toString()}>
                                                    {company.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="categoryId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kategori</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Kategori Seçiniz" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="month"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ay</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Ay" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                                    <SelectItem key={month} value={month.toString()}>
                                                        {new Date(0, month - 1).toLocaleString('tr-TR', { month: 'long' })}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="year"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Yıl</FormLabel>
                                        <Input {...field} type="number" />
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Açıklama / Kayıt İsmi</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Örn: Ocak ayı maaş ödemesi" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="budgetAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bütçe (TL)</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="number" step="0.01" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="actualAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Gerçekleşen (TL)</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="number" step="0.01" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="isRecurring"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Tekrarlı İşlem</FormLabel>
                                        <div className="text-sm text-muted-foreground">
                                            Bu kaydı gelecek aylar için otomatik tekrarla
                                        </div>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {form.watch("isRecurring") && (
                            <FormField
                                control={form.control}
                                name="repeatCount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tekrar Sayısı (Ay)</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="number" min="1" max="60" />
                                        </FormControl>
                                        <div className="text-xs text-muted-foreground">
                                            Seçilen aydan itibaren kaç ay boyunca eklensin? (Örn: 12)
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        <DialogFooter>
                            <Button type="submit">Kaydet</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
