import { getActivities, getCustomers, getDeals } from "@/lib/crm-actions"
import { ActivityList } from "@/components/crm/ActivityList"

export default async function ActivitiesPage() {
    const [activities, customers, deals] = await Promise.all([
        getActivities(),
        getCustomers(),
        getDeals()
    ])

    const simpleCustomers = customers.map(c => ({ id: c.id, name: c.name }))
    const simpleDeals = deals.map(d => ({ id: d.id, title: d.title }))

    return (
        <ActivityList
            activities={JSON.parse(JSON.stringify(activities))}
            customers={simpleCustomers}
            deals={simpleDeals}
        />
    )
}
