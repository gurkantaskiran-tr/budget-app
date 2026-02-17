import { getCustomers } from "@/lib/crm-actions"
import { getMasterData } from "@/lib/actions"
import { CustomerList } from "@/components/crm/CustomerList"

export default async function CustomersPage() {
    const [customers, masterData] = await Promise.all([
        getCustomers(),
        getMasterData()
    ])

    return (
        <CustomerList
            customers={JSON.parse(JSON.stringify(customers))}
            companies={masterData.companies}
        />
    )
}
