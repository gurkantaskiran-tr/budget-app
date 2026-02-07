import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const companies = [
  "Thinkone",
  "CyberUP",
  "Thinkflow",
  "NodesyAI"
]

const incomeCategories = [
  "Satış Gelirleri",
  "Hizmet Gelirleri",
  "Danışmanlık",
  "Diğer Gelirler"
]

const expenseCategories = [
  "Personel Maaş",
  "Kira",
  "Pazarlama",
  "Yazılım/SaaS",
  "Genel Giderler",
  "Seyahat",
  "Temsil Ağırlama",
  "Online Pazarlama",
  "GT SGK",
  "GT Araç",
  "Sonay ARAÇ",
  "Sonay SGK",
  "SMMM",
  "E-Normal Ofis",
  "Sonay Yakıt",
  "Sonay HGS",
  "Gürkan Yakıt",
  "Gürkan HGS",
  "Sonay Temsil Ağırlama",
  "Gürkan Temsil Ağırlama",
  "Muhasebe Programı",
  "Ofis Mutfak Gider",
  "Ofis İnternet | SuperBox",
  "Ofis Kırtasiye Gider",
  "Senelik Ticaret Sicil V.b.",
  "Gürkan Telefon",
  "Ayşe Maaş",
  "CRM Tool",
  "OÇ Maaş ( Ödenen )",
  "SG Maaş ( Ödenen )",
  "GT Maaş ( Ödenen )",
  "CyberUp internet"
]

async function main() {
  console.log('Start seeding ...')

  for (const company of companies) {
    const c = await prisma.company.upsert({
      where: { name: company },
      update: {},
      create: { name: company },
    })
    console.log(`Created company: ${c.name}`)
  }

  for (const category of incomeCategories) {
    const c = await prisma.category.upsert({
      where: { id: -1 }, // Hack to always create unless unique constraint fails (we don't have unique name yet but we should probably add it or just createMany)
      // Actually, upsert needs a unique field. Schema doesn't have unique on name for Category.
      // Let's check schema.
      update: {},
      create: { name: category, type: 'INCOME' },
    }).catch(async (e) => {
        // Fallback if upsert fails or just use create with findFirst check
        const existing = await prisma.category.findFirst({ where: { name: category, type: 'INCOME' } })
        if (!existing) {
            return prisma.category.create({ data: { name: category, type: 'INCOME' } })
        }
        return existing;
    })
    // Ensure we don't duplicate
  }

  // Better approach for categories: check existance first
  
  // Clear existing if needed? No, user might have added data.
  // Actually, for initial seed, let's just create if not exists.
}

// Rewriting main to be cleaner
async function seed() {
    // Companies
    for (const name of companies) {
        const existing = await prisma.company.findUnique({ where: { name } })
        if (!existing) {
            await prisma.company.create({ data: { name } })
            console.log(`Created company: ${name}`)
        }
    }

    // Income
    for (const name of incomeCategories) {
        const existing = await prisma.category.findFirst({ where: { name, type: 'INCOME' } })
        if (!existing) {
            await prisma.category.create({ data: { name, type: 'INCOME' } })
            console.log(`Created income category: ${name}`)
        }
    }

    // Expenses
    for (const name of expenseCategories) {
        const existing = await prisma.category.findFirst({ where: { name, type: 'EXPENSE' } })
        if (!existing) {
            await prisma.category.create({ data: { name, type: 'EXPENSE' } })
            console.log(`Created expense category: ${name}`)
        }
    }
}

seed()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
