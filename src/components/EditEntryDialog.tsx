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
import { useState } from "react"
import { updateEntry } from "@/lib/actions"
import { Pencil } from "lucide-react"

const formSchema = z.object({
    budgetAmount: z.string().refine((val) => !isNaN(Number(val)), "Must be a number"),
    actualAmount: z.string().refine((val) => !isNaN(Number(val)), "Must be a number"),
    description: z.string().optional(),
})

interface EditEntryDialogProps {
    entry: {
        id: number
        company: { name: string }
        category: { name: string }
        month: number
        year: number
        budgetAmount: number
        actualAmount: number
        description?: string | null
    }
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function EditEntryDialog({ entry, open: controlledOpen, onOpenChange: setControlledOpen }: EditEntryDialogProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : uncontrolledOpen
    const setOpen = isControlled ? setControlledOpen : setUncontrolledOpen

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            budgetAmount: entry.budgetAmount.toString(),
            actualAmount: entry.actualAmount.toString(),
            description: entry.description || "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await updateEntry(entry.id, {
                budgetAmount: parseFloat(values.budgetAmount),
                actualAmount: parseFloat(values.actualAmount),
                description: values.description,
            })
            if (setOpen) setOpen(false)
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {/* If not controlled, render default trigger (or user can pass partial control) */}
            {!isControlled && (
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Kaydı Düzenle</DialogTitle>
                    <DialogDescription>
                        {entry.company.name} - {entry.category.name} ({entry.month}/{entry.year})
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        <DialogFooter>
                            <Button type="submit">Güncelle</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
