import { getDeals, getCustomers } from "@/lib/crm-actions"
import { DealPipeline } from "@/components/crm/DealPipeline"

export default async function DealsPage() {
    const [deals, customers] = await Promise.all([
        getDeals(),
        getCustomers()
    ])

    const simpleCustomers = customers.map(c => ({
        id: c.id,
        name: c.name,
        company: c.company
    }))

    return (
        <DealPipeline
            deals={JSON.parse(JSON.stringify(deals))}
            customers={simpleCustomers}
        />
    )
}
