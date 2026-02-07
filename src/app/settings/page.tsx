import { getMasterData } from "@/lib/actions"
import { CategoryManager } from "@/components/CategoryManager"
import { CompanyManager } from "@/components/CompanyManager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function SettingsPage() {
    const { companies, categories } = await getMasterData()

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Ayarlar</h1>

            <Tabs defaultValue="categories" className="w-full">
                <TabsList>
                    <TabsTrigger value="categories">Kategoriler</TabsTrigger>
                    <TabsTrigger value="companies">Şirketler</TabsTrigger>
                </TabsList>
                <TabsContent value="categories">
                    <CategoryManager categories={categories} />
                </TabsContent>
                <TabsContent value="companies">
                    <CompanyManager companies={companies} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
