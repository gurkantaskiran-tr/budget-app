# Changelog

## [v1.0.0] — 2026-02-17

### 🎉 İlk Ana Sürüm

ThinkOne Budget & CRM uygulamasının ilk kararlı sürümü.

---

### 🏦 Finans Modülü

- **Dashboard:** Gelir/gider özet kartları, aylık trend grafiği
- **Gelirler & Giderler:** Şirket ve kategoriye göre bütçe/gerçekleşen takibi
- **Nakit Akış:** Aylık nakit akış tablosu
- **Raporlar:** Detaylı finansal raporlama
- **Grafikler:**
  - Şirket bütçe dağılımı (gelir + gider yan yana)
  - Kategori bütçe dağılımı (gelir + gider yan yana)
- **Filtreler:** Dashboard'da şirket, kategori ve dönem (ay/yıl) filtreleme
- **Kategori Yönetimi:** Gelir ve gider kategorileri CRUD
- **Şirket Yönetimi:** Şirket kayıtları CRUD + toplu silme

### 🤝 CRM Modülü

- **CRM Panel:** Genel CRM dashboard'u — pipeline özeti, son fırsatlar, son aktiviteler
- **Müşteri Yönetimi:**
  - Müşteri listesi (kart görünümü) + arama ve durum filtreleme
  - Müşteri ekleme, düzenleme, silme
  - Müşteri detay sayfası (iletişim kişileri, fırsatlar, aktiviteler)
- **Fırsat / Deal Yönetimi:**
  - **Kanban Board** görünümü (sürükle-bırak destekli)
  - Liste görünümü
  - Fırsat ekleme, düzenleme, silme
  - Aşama geçişleri: Lead → Nitelikli → Teklif → Müzakere → Kazanıldı / Kaybedildi
- **İletişim Kişileri:** Müşterilere bağlı kişi CRUD
- **Aktiviteler:** Arama, toplantı, e-posta, not, görev takibi

### 📊 CRM Veri Alanları (Excel Import Desteği)

Aşağıdaki alanlar `crmdata.xlsx` import gereksinimine göre eklendi:

| Alan | Model | Açıklama |
|---|---|---|
| `industry` | Customer | Sektör |
| `valueTRY` | Deal | TL Karşılığı |
| `salesRep` | Deal | Satış Temsilcisi |
| `dealCompany` | Deal | Fırsat Firması |
| `productCategory` | Deal | Ürün Kategorisi |
| `productSubCategory` | Deal | Ürün Alt Kategorisi |
| `currency` | Deal | Para Birimi (TRY, USD, EUR) |
| `source` | Deal | Kaynak (Ortak, Doğrudan, Çalışan/Dışarıdan Yönlendirme) |
| `leadType` | Deal | Potansiyel Müşteri Türü (Yeni/Mevcut Müşteri/İş) |
| `tag` | Deal | Etiket |
| `isStale` | Deal | Çürümüş Lead |
| `lastContactDate` | Deal | Son Temas Tarihi |

### ⚙️ Ayarlar (Birleşik Sayfa)

- **Kategoriler** sekmesi — Gelir/gider kategori yönetimi
- **Şirketler** sekmesi — Şirket yönetimi
- **Pipeline** sekmesi — CRM satış aşamaları ve müşteri durumu özeti
- **CRM Genel** sekmesi — Aktivite türleri, müşteri durumları, genel bilgi

### 🧭 Navigasyon

- Sidebar **FINANS** ve **CRM** bölümleri ile gruplandı
- Ayarlar alt kısımda ayrı konumlandırıldı

### 📦 Veri Import

- `scripts/import_crm.js` — Excel'den CRM verisi aktarma scripti
- `scripts/analyze_crm.js` — Excel dosyası analiz aracı
- **v1.0 Import:** 48 fırsat, 36 müşteri başarıyla aktarıldı

### 🛠️ Teknik Altyapı

- **Framework:** Next.js 15 (App Router)
- **Veritabanı:** SQLite + Prisma ORM
- **UI:** shadcn/ui + Tailwind CSS + Recharts
- **İkonlar:** Lucide React

---

> **Sonraki adımlar için notlar:**
>
> - Lint hataları (inline CSS, buton erişilebilirlik) temizlenecek
> - CRM dashboard grafikleri geliştirilebilir
> - Ürün kategorisi ve kaynak alanları için ayrı konfigürasyon yönetimi eklenebilir
> - Raporlama modülü CRM verileri ile zenginleştirilebilir
