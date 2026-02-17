import { getMasterData } from "@/lib/actions"
import { getCustomers } from "@/lib/crm-actions"
import { CategoryManager } from "@/components/CategoryManager"
import { CompanyManager } from "@/components/CompanyManager"
import { CRMSettingsManager } from "@/components/crm/CRMSettingsManager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, DollarSign, Users } from "lucide-react"

export default async function SettingsPage() {
    const [{ companies, categories }, customers] = await Promise.all([
        getMasterData(),
        getCustomers()
    ])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Settings className="h-8 w-8 text-gray-400" />
                    Ayarlar
                </h1>
                <p className="text-muted-foreground mt-1">
                    Finans ve CRM modüllerinizin yapılandırma ayarları
                </p>
            </div>

            <Tabs defaultValue="categories" className="w-full">
                <TabsList className="grid w-full max-w-lg grid-cols-4">
                    <TabsTrigger value="categories" className="text-xs">
                        Kategoriler
                    </TabsTrigger>
                    <TabsTrigger value="companies" className="text-xs">
                        Şirketler
                    </TabsTrigger>
                    <TabsTrigger value="crm-pipeline" className="text-xs">
                        Pipeline
                    </TabsTrigger>
                    <TabsTrigger value="crm-general" className="text-xs">
                        CRM Genel
                    </TabsTrigger>
                </TabsList>

                {/* Finans - Kategoriler */}
                <TabsContent value="categories" className="mt-6">
                    <div className="mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-medium">Finans Modülü</span>
                            <span>·</span>
                            <span>Gelir ve gider kategorilerinizi yönetin</span>
                        </div>
                    </div>
                    <CategoryManager categories={categories} />
                </TabsContent>

                {/* Finans - Şirketler */}
                <TabsContent value="companies" className="mt-6">
                    <div className="mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-medium">Finans Modülü</span>
                            <span>·</span>
                            <span>Şirket kayıtlarınızı yönetin</span>
                        </div>
                    </div>
                    <CompanyManager companies={companies} />
                </TabsContent>

                {/* CRM - Pipeline */}
                <TabsContent value="crm-pipeline" className="mt-6">
                    <div className="mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span className="font-medium">CRM Modülü</span>
                            <span>·</span>
                            <span>Satış pipeline aşamalarını görüntüleyin</span>
                        </div>
                    </div>
                    <CRMSettingsManager
                        tab="pipeline"
                        customers={JSON.parse(JSON.stringify(customers))}
                    />
                </TabsContent>

                {/* CRM - Genel */}
                <TabsContent value="crm-general" className="mt-6">
                    <div className="mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <span className="font-medium">CRM Modülü</span>
                            <span>·</span>
                            <span>CRM genel ayarlarını yapılandırın</span>
                        </div>
                    </div>
                    <CRMSettingsManager
                        tab="general"
                        customers={JSON.parse(JSON.stringify(customers))}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
