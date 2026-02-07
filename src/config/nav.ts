import {
    LayoutDashboard,
    Wallet,
    CreditCard,
    Settings,
    PieChart
} from "lucide-react"

export const NAV_ITEMS = [
    {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Gelirler",
        href: "/income",
        icon: Wallet,
    },
    {
        title: "Giderler",
        href: "/expenses",
        icon: CreditCard,
    },
    {
        title: "Nakit Akış",
        href: "/cashflow",
        icon: PieChart, // Reusing PieChart or maybe another icon like Activity
    },
    {
        title: "Raporlar",
        href: "/reports",
        icon: PieChart,
    },
    {
        title: "Ayarlar",
        href: "/settings",
        icon: Settings,
    },
]
