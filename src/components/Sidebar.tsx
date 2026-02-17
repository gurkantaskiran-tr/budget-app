
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { FINANCE_NAV_ITEMS, CRM_NAV_ITEMS, SETTINGS_NAV_ITEM } from "../config/nav"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

export function Sidebar() {
    const pathname = usePathname()

    const SettingsIcon = SETTINGS_NAV_ITEM.icon

    return (
        <div className="flex h-full w-64 flex-col border-r bg-white text-gray-900">
            <div className="flex h-14 items-center border-b px-4 font-semibold">
                ThinkOne Budget
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    {/* FİNANS Section */}
                    <div className="mb-2 px-3">
                        <div className="flex items-center gap-2">
                            <div className="h-px flex-1 bg-gray-200" />
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Finans</span>
                            <div className="h-px flex-1 bg-gray-200" />
                        </div>
                    </div>

                    {FINANCE_NAV_ITEMS.map((item, index) => {
                        const Icon = item.icon
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
                                    pathname === item.href ? "bg-gray-100 text-gray-900" : ""
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        )
                    })}

                    {/* CRM Section */}
                    <div className="mt-4 mb-2 px-3">
                        <div className="flex items-center gap-2">
                            <div className="h-px flex-1 bg-gray-200" />
                            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">CRM</span>
                            <div className="h-px flex-1 bg-gray-200" />
                        </div>
                    </div>

                    {CRM_NAV_ITEMS.map((item, index) => {
                        const Icon = item.icon
                        return (
                            <Link
                                key={`crm-${index}`}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
                                    pathname === item.href || (item.href !== "/crm" && pathname.startsWith(item.href))
                                        ? "bg-indigo-50 text-indigo-700"
                                        : ""
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        )
                    })}

                    {/* Separator + Settings */}
                    <div className="mt-4 mb-2 px-3">
                        <div className="h-px bg-gray-200" />
                    </div>

                    <Link
                        href={SETTINGS_NAV_ITEM.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
                            pathname === SETTINGS_NAV_ITEM.href || pathname.startsWith("/settings")
                                ? "bg-gray-100 text-gray-900"
                                : ""
                        )}
                    >
                        <SettingsIcon className="h-4 w-4" />
                        {SETTINGS_NAV_ITEM.title}
                    </Link>
                </nav>
            </div>
            <div className="border-t p-4">
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => signOut({ callbackUrl: "/login" })}
                >
                    <LogOut className="h-4 w-4" />
                    Çıkış Yap
                </Button>
            </div>
        </div>
    )
}

