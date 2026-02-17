// CRM Data Import Script
// Usage: npx xlsx-cli ../Sample/crmdata.xlsx | node scripts/import_crm.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function parseCSV(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        if (line[i] === '"') { inQuotes = !inQuotes; continue; }
        if (line[i] === ',' && !inQuotes) { result.push(current.trim()); current = ''; continue; }
        current += line[i];
    }
    result.push(current.trim());
    return result;
}

// Stage mapping from Excel to our DB stages
const STAGE_MAP = {
    'Yeni Fırsat': 'LEAD',
    'Qualify | Sınıflandırma': 'QUALIFIED',
    'Prospect | Potansiyel': 'QUALIFIED',
    'Proposal | Teklif': 'PROPOSAL',
    '🤝 Negotation | Müzakere - Pazarlık': 'NEGOTIATION',
    'Won': 'WON',
    'Lost': 'LOST',
};

function parseDate(dateStr) {
    if (!dateStr || dateStr === '0000-00-00' || dateStr === '') return null;
    // Handle "2025-10-18 13:51:00" format -> "2025-10-18"
    const match = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : null;
}

async function main() {
    const input = require('fs').readFileSync('/dev/stdin', 'utf8');
    const lines = input.trim().split('\n');
    const headers = parseCSV(lines[0]);
    const rows = lines.slice(1).map(l => parseCSV(l));

    console.log(`📊 Found ${rows.length} rows to import`);
    console.log(`📋 Columns: ${headers.join(', ')}\n`);

    // Column indices
    const COL = {
        ID: 0,
        SALES_REP: 1,
        SUBJECT: 2,         // Konu -> Deal.title
        DEAL_COMPANY: 3,    // Fırsat Firması
        PRODUCT_CAT: 4,     // Ürün Kategorisi
        PRODUCT_SUBCAT: 5,  // Ürün Alt Kategorisi
        CURRENCY: 6,        // Para Birimi
        SOURCE: 7,          // Kaynak
        LEAD_VALUE: 8,      // Lead Değeri -> Deal.value
        TL_VALUE: 9,        // TL Karşılığı -> Deal.valueTRY
        LEAD_TYPE: 10,      // Potansiyel Müşteri Türü
        TAG: 11,            // Etiket Adı
        CONTACT_PERSON: 12, // İletişim Kişisi -> Contact.name
        CUSTOMER: 13,       // Müşteri/Şirket -> Customer.name
        STAGE: 14,          // Aşama -> mapped to STAGES
        IS_STALE: 15,       // Çürümüş Lead
        CLOSE_DATE: 16,     // Bitiş Tarihi
        LAST_CONTACT: 17,   // Son Temas Tarihi
        CREATED_AT: 18,     // Oluşturulma Tarihi
    };

    // Step 1: Collect unique customers
    const customerNames = [...new Set(rows.map(r => r[COL.CUSTOMER]).filter(Boolean))];
    console.log(`👥 Unique customers: ${customerNames.length}`);

    // Step 2: Create/find customers
    const customerMap = new Map(); // name -> id

    for (const name of customerNames) {
        // Check if already exists
        let customer = await prisma.customer.findFirst({
            where: { name: { equals: name } }
        });

        if (!customer) {
            customer = await prisma.customer.create({
                data: {
                    name,
                    status: 'ACTIVE',
                }
            });
            console.log(`  ✅ Created customer: ${name} (ID: ${customer.id})`);
        } else {
            console.log(`  ⏭️  Existing customer: ${name} (ID: ${customer.id})`);
        }
        customerMap.set(name, customer.id);
    }

    console.log(`\n📦 Importing ${rows.length} deals...\n`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const row of rows) {
        const excelId = row[COL.ID];
        const customerName = row[COL.CUSTOMER];
        const title = row[COL.SUBJECT];

        if (!customerName || !title) {
            console.log(`  ⚠️ Skipping row ${excelId}: missing customer or title`);
            skipped++;
            continue;
        }

        const customerId = customerMap.get(customerName);
        if (!customerId) {
            console.log(`  ⚠️ Skipping row ${excelId}: customer not found: ${customerName}`);
            skipped++;
            continue;
        }

        // Check if deal already exists (by title + customerId)
        const existing = await prisma.deal.findFirst({
            where: { title, customerId }
        });

        if (existing) {
            console.log(`  ⏭️  Deal already exists: "${title}" for ${customerName}`);
            skipped++;
            continue;
        }

        const stageRaw = row[COL.STAGE] || 'Yeni Fırsat';
        const stage = STAGE_MAP[stageRaw] || 'LEAD';

        const probMap = {
            'LEAD': 10,
            'QUALIFIED': 25,
            'PROPOSAL': 50,
            'NEGOTIATION': 75,
            'WON': 100,
            'LOST': 0,
        };

        const closeDate = parseDate(row[COL.CLOSE_DATE]);
        const lastContact = parseDate(row[COL.LAST_CONTACT]);
        const createdAtStr = row[COL.CREATED_AT];
        const createdAt = createdAtStr && createdAtStr !== '' ? new Date(createdAtStr.replace(' ', 'T')) : new Date();

        try {
            const deal = await prisma.deal.create({
                data: {
                    title,
                    value: parseFloat(row[COL.LEAD_VALUE]) || 0,
                    valueTRY: parseFloat(row[COL.TL_VALUE]) || 0,
                    stage,
                    probability: probMap[stage] || 10,
                    expectedCloseDate: closeDate,
                    lastContactDate: lastContact,
                    customerId,
                    salesRep: row[COL.SALES_REP] || null,
                    dealCompany: row[COL.DEAL_COMPANY] || null,
                    productCategory: row[COL.PRODUCT_CAT] || null,
                    productSubCategory: row[COL.PRODUCT_SUBCAT] || null,
                    currency: row[COL.CURRENCY] || 'TRY',
                    source: row[COL.SOURCE] || null,
                    leadType: row[COL.LEAD_TYPE] || null,
                    tag: row[COL.TAG] || null,
                    isStale: row[COL.IS_STALE] === '1',
                    createdAt: isNaN(createdAt.getTime()) ? new Date() : createdAt,
                }
            });

            // Create contact if exists
            const contactName = row[COL.CONTACT_PERSON];
            if (contactName && contactName.trim()) {
                // Check if contact already exists for this customer
                const existingContact = await prisma.contact.findFirst({
                    where: { name: contactName.trim(), customerId }
                });

                if (!existingContact) {
                    await prisma.contact.create({
                        data: {
                            name: contactName.trim(),
                            customerId,
                        }
                    });
                }
            }

            console.log(`  ✅ [${stage}] ${title} | ${customerName} | ${row[COL.CURRENCY]} ${row[COL.LEAD_VALUE]} (ID: ${deal.id})`);
            created++;
        } catch (err) {
            console.error(`  ❌ Error creating deal "${title}": ${err.message}`);
            errors++;
        }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`📊 Import Summary:`);
    console.log(`  ✅ Created: ${created}`);
    console.log(`  ⏭️  Skipped: ${skipped}`);
    console.log(`  ❌ Errors: ${errors}`);
    console.log(`  👥 Customers: ${customerMap.size}`);
    console.log(`${'='.repeat(50)}`);

    await prisma.$disconnect();
}

main().catch(e => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
});
