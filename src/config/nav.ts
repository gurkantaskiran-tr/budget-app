import {
    LayoutDashboard,
    Wallet,
    CreditCard,
    Settings,
    PieChart,
    Users,
    Handshake,
    CalendarCheck,
    ContactRound,
    TrendingUp
} from "lucide-react"

export const FINANCE_NAV_ITEMS = [
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
        icon: TrendingUp,
    },
    {
        title: "Raporlar",
        href: "/reports",
        icon: PieChart,
    },
]

export const CRM_NAV_ITEMS = [
    {
        title: "CRM Panel",
        href: "/crm",
        icon: ContactRound,
    },
    {
        title: "Müşteriler",
        href: "/crm/customers",
        icon: Users,
    },
    {
        title: "Fırsatlar",
        href: "/crm/deals",
        icon: Handshake,
    },
    {
        title: "Aktiviteler",
        href: "/crm/activities",
        icon: CalendarCheck,
    },
]

export const SETTINGS_NAV_ITEM = {
    title: "Ayarlar",
    href: "/settings",
    icon: Settings,
}
