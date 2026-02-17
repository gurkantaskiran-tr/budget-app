"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

// ==================== Customer Actions ====================

export async function getCustomers(filters?: {
    status?: string
    companyId?: number
    search?: string
}) {
    const where: any = {}

    if (filters?.status) where.status = filters.status
    if (filters?.companyId) where.companyId = filters.companyId
    if (filters?.search) {
        where.OR = [
            { name: { contains: filters.search } },
            { email: { contains: filters.search } },
            { phone: { contains: filters.search } },
        ]
    }

    return await prisma.customer.findMany({
        where,
        include: {
            company: true,
            contacts: true,
            deals: true,
            _count: {
                select: {
                    contacts: true,
                    deals: true,
                    activities: true
                }
            }
        },
        orderBy: { updatedAt: 'desc' }
    })
}

export async function getCustomer(id: number) {
    return await prisma.customer.findUnique({
        where: { id },
        include: {
            company: true,
            contacts: true,
            deals: {
                include: {
                    _count: { select: { activities: true } }
                },
                orderBy: { updatedAt: 'desc' }
            },
            activities: {
                orderBy: { date: 'desc' },
                take: 10
            }
        }
    })
}

export async function createCustomer(data: {
    name: string
    email?: string
    phone?: string
    address?: string
    industry?: string
    status?: string
    notes?: string
    companyId?: number
}) {
    await prisma.customer.create({
        data: {
            name: data.name,
            email: data.email || null,
            phone: data.phone || null,
            address: data.address || null,
            industry: data.industry || null,
            status: data.status || "ACTIVE",
            notes: data.notes || null,
            companyId: data.companyId || null,
        }
    })
    revalidatePath('/crm')
    revalidatePath('/crm/customers')
}

export async function updateCustomer(id: number, data: {
    name?: string
    email?: string
    phone?: string
    address?: string
    industry?: string
    status?: string
    notes?: string
    companyId?: number | null
}) {
    await prisma.customer.update({
        where: { id },
        data
    })
    revalidatePath('/crm')
    revalidatePath('/crm/customers')
}

export async function deleteCustomer(id: number) {
    try {
        await prisma.customer.delete({ where: { id } })
        revalidatePath('/crm')
        revalidatePath('/crm/customers')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Müşteri silinemedi." }
    }
}

// ==================== Contact Actions ====================

export async function createContact(data: {
    name: string
    email?: string
    phone?: string
    title?: string
    customerId: number
}) {
    await prisma.contact.create({
        data: {
            name: data.name,
            email: data.email || null,
            phone: data.phone || null,
            title: data.title || null,
            customerId: data.customerId,
        }
    })
    revalidatePath('/crm/customers')
}

export async function updateContact(id: number, data: {
    name?: string
    email?: string
    phone?: string
    title?: string
}) {
    await prisma.contact.update({
        where: { id },
        data
    })
    revalidatePath('/crm/customers')
}

export async function deleteContact(id: number) {
    await prisma.contact.delete({ where: { id } })
    revalidatePath('/crm/customers')
}

// ==================== Deal Actions ====================

export async function getDeals(filters?: {
    stage?: string
    customerId?: number
}) {
    const where: any = {}
    if (filters?.stage && filters.stage !== "ALL") where.stage = filters.stage
    if (filters?.customerId) where.customerId = filters.customerId

    return await prisma.deal.findMany({
        where,
        include: {
            customer: {
                include: { company: true }
            },
            _count: {
                select: { activities: true }
            }
        },
        orderBy: { updatedAt: 'desc' }
    })
}

export async function getDeal(id: number) {
    return await prisma.deal.findUnique({
        where: { id },
        include: {
            customer: {
                include: { company: true }
            },
            activities: {
                orderBy: { date: 'desc' }
            }
        }
    })
}

export async function createDeal(data: {
    title: string
    value?: number
    valueTRY?: number
    stage?: string
    probability?: number
    expectedCloseDate?: string
    lastContactDate?: string
    notes?: string
    customerId: number
    salesRep?: string
    dealCompany?: string
    productCategory?: string
    productSubCategory?: string
    currency?: string
    source?: string
    leadType?: string
    tag?: string
    isStale?: boolean
}) {
    await prisma.deal.create({
        data: {
            title: data.title,
            value: data.value || 0,
            valueTRY: data.valueTRY || 0,
            stage: data.stage || "LEAD",
            probability: data.probability || 0,
            expectedCloseDate: data.expectedCloseDate || null,
            lastContactDate: data.lastContactDate || null,
            notes: data.notes || null,
            customerId: data.customerId,
            salesRep: data.salesRep || null,
            dealCompany: data.dealCompany || null,
            productCategory: data.productCategory || null,
            productSubCategory: data.productSubCategory || null,
            currency: data.currency || "TRY",
            source: data.source || null,
            leadType: data.leadType || null,
            tag: data.tag || null,
            isStale: data.isStale || false,
        }
    })
    revalidatePath('/crm')
    revalidatePath('/crm/deals')
}

export async function updateDeal(id: number, data: {
    title?: string
    value?: number
    valueTRY?: number
    stage?: string
    probability?: number
    expectedCloseDate?: string
    lastContactDate?: string
    notes?: string
    customerId?: number
    salesRep?: string
    dealCompany?: string
    productCategory?: string
    productSubCategory?: string
    currency?: string
    source?: string
    leadType?: string
    tag?: string
    isStale?: boolean
}) {
    await prisma.deal.update({
        where: { id },
        data
    })
    revalidatePath('/crm')
    revalidatePath('/crm/deals')
}

export async function updateDealStage(id: number, stage: string) {
    // If stage transitions to WON, set probability to 100; if LOST, set to 0
    const probability = stage === "WON" ? 100 : stage === "LOST" ? 0 : undefined

    await prisma.deal.update({
        where: { id },
        data: {
            stage,
            ...(probability !== undefined ? { probability } : {})
        }
    })
    revalidatePath('/crm')
    revalidatePath('/crm/deals')
}

export async function deleteDeal(id: number) {
    try {
        await prisma.deal.delete({ where: { id } })
        revalidatePath('/crm')
        revalidatePath('/crm/deals')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Fırsat silinemedi." }
    }
}

// ==================== Activity Actions ====================

export async function getActivities(filters?: {
    type?: string
    customerId?: number
    dealId?: number
    completed?: boolean
}) {
    const where: any = {}
    if (filters?.type && filters.type !== "ALL") where.type = filters.type
    if (filters?.customerId) where.customerId = filters.customerId
    if (filters?.dealId) where.dealId = filters.dealId
    if (filters?.completed !== undefined) where.completed = filters.completed

    return await prisma.activity.findMany({
        where,
        include: {
            customer: true,
            deal: true
        },
        orderBy: { date: 'desc' }
    })
}

export async function createActivity(data: {
    type: string
    title: string
    description?: string
    date?: string
    customerId?: number
    dealId?: number
}) {
    await prisma.activity.create({
        data: {
            type: data.type,
            title: data.title,
            description: data.description || null,
            date: data.date ? new Date(data.date) : new Date(),
            customerId: data.customerId || null,
            dealId: data.dealId || null,
        }
    })
    revalidatePath('/crm')
    revalidatePath('/crm/activities')
    revalidatePath('/crm/customers')
    revalidatePath('/crm/deals')
}

export async function updateActivity(id: number, data: {
    type?: string
    title?: string
    description?: string
    date?: string
    completed?: boolean
}) {
    await prisma.activity.update({
        where: { id },
        data: {
            ...data,
            date: data.date ? new Date(data.date) : undefined,
        }
    })
    revalidatePath('/crm')
    revalidatePath('/crm/activities')
}

export async function toggleActivity(id: number) {
    const activity = await prisma.activity.findUnique({ where: { id } })
    if (!activity) return

    await prisma.activity.update({
        where: { id },
        data: { completed: !activity.completed }
    })
    revalidatePath('/crm')
    revalidatePath('/crm/activities')
}

export async function deleteActivity(id: number) {
    await prisma.activity.delete({ where: { id } })
    revalidatePath('/crm')
    revalidatePath('/crm/activities')
}

// ==================== CRM Dashboard Data ====================

export async function getCRMDashboardData() {
    const [
        totalCustomers,
        activeCustomers,
        leadCustomers,
        allDeals,
        wonDeals,
        lostDeals,
        recentActivities,
        recentCustomers
    ] = await Promise.all([
        prisma.customer.count(),
        prisma.customer.count({ where: { status: "ACTIVE" } }),
        prisma.customer.count({ where: { status: "LEAD" } }),
        prisma.deal.findMany({
            include: { customer: true }
        }),
        prisma.deal.aggregate({
            _sum: { value: true },
            where: { stage: "WON" }
        }),
        prisma.deal.count({ where: { stage: "LOST" } }),
        prisma.activity.findMany({
            take: 5,
            orderBy: { date: 'desc' },
            include: {
                customer: true,
                deal: true
            }
        }),
        prisma.customer.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                company: true,
                _count: { select: { deals: true } }
            }
        })
    ])

    // Pipeline data
    const stages = ["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]
    const pipelineData = stages.map(stage => {
        const stageDeals = allDeals.filter(d => d.stage === stage)
        return {
            stage,
            count: stageDeals.length,
            value: stageDeals.reduce((sum, d) => sum + d.value, 0)
        }
    })

    // Open pipeline (exclude WON and LOST)
    const openDeals = allDeals.filter(d => !["WON", "LOST"].includes(d.stage))
    const totalPipelineValue = openDeals.reduce((sum, d) => sum + d.value, 0)
    const weightedPipelineValue = openDeals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0)

    // Conversion rate
    const closedDeals = allDeals.filter(d => ["WON", "LOST"].includes(d.stage))
    const wonCount = allDeals.filter(d => d.stage === "WON").length
    const conversionRate = closedDeals.length > 0 ? (wonCount / closedDeals.length) * 100 : 0

    return {
        totalCustomers,
        activeCustomers,
        leadCustomers,
        totalPipelineValue,
        weightedPipelineValue,
        wonRevenue: wonDeals._sum.value || 0,
        conversionRate,
        pipelineData,
        recentActivities,
        recentCustomers,
        totalDeals: allDeals.length,
        openDeals: openDeals.length
    }
}
