# Üçteknik İSG-ERP — 81 İl Periyodik Muayene, Raporlama, 5070 PAdES E-İmza ve Kurumsal Operasyon Sistemi

[![CI Durumu](https://github.com/Atakanns-githu/ucteknik-isg-erp/actions/workflows/ci.yml/badge.svg)](https://github.com/Atakanns-githu/ucteknik-isg-erp/actions)
[![Next.js 16.4.6](https://img.shields.io/badge/Next.js-16.4.6-000000?logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-149eca?logo=react)](https://react.dev/)
[![Prisma 6](https://img.shields.io/badge/Prisma-6.4.1-2D3748?logo=prisma)](https://www.prisma.io/)
[![Vitest 366/366](https://img.shields.io/badge/Vitest-366%2F366%20Passed-22c55e)](./src)
[![Playwright E2E 45/45](https://img.shields.io/badge/Playwright%20E2E-45%2F45%20Passed-16a34a)](./e2e)

**Üçteknik İSG-ERP**, 6331 sayılı İş Sağlığı ve Güvenliği Kanunu, *İş Ekipmanlarının Kullanımında Sağlık ve Güvenlik Şartları Yönetmeliği* ve 5070 sayılı Elektronik İmza Kanunu kapsamında Türkiye'nin 81 ilinde yürütülen periyodik kontrol, teklif, İSG-KATİP sözleşme, saha planlama, tek sayfa A4 resmî rapor üretimi, USB token PAdES e-imza, DÖF (Düzeltici/Önleyici Faaliyet), ekipman dijital karnesi, finans/tahsilat ve müşteri portalı süreçlerini uçtan uca yöneten kurumsal bir İSG-ERP platformudur.

- **Canlı Uygulama (Vercel Production):** [https://ucteknik-isg-erp-zynox6.vercel.app](https://ucteknik-isg-erp-zynox6.vercel.app)
- **GitHub Deposu:** [https://github.com/Atakanns-githu/ucteknik-isg-erp](https://github.com/Atakanns-githu/ucteknik-isg-erp)

---

## Sistem Mimarisi

```mermaid
flowchart TB
  subgraph Client["İstemci & Saha Katmanı"]
    Office["Ofis & Yönetici Arayüzü\n(Next.js 16 App Router · React 19)"]
    PWA["Şifreli Çevrimdışı Saha PWA\n(Service Worker v13 · IndexedDB AES-GCM-256)"]
    Portal["Müşteri Portalı 2.0 & Kamu QR Doğrulama\n(/portal · /verify/[token])"]
    Signer["Yerel USB Akıllı Kart E-İmza Köprüsü\n(127.0.0.1:45678 · PKCS#11 PAdES)"]
  end

  subgraph Core["Üçteknik İSG-ERP Çekirdek Servisleri"]
    RBAC["RBAC & Çok Kiracılı Kapsam İzolasyonu\n(ADMIN · TECH_MANAGER · ENGINEER · SALES · CUSTOMER)"]
    Catalog["144 Resmî TÜRKAK/ENLAP Şablon Motoru\n(Tek Sayfa A4 PDF & Word DOCX + Dinamik Matris)"]
    Verify["OpenSSL 3 CMS & X.509 / CRL PAdES Doğrulayıcı\n(4-Göz Onay · İSG-KATİP · EKİPNET · Kalibrasyon Kapısı)"]
    NextGen["Yeni Nesil 5 İnovasyon Paketi\n(Toplu Teslimat ZIP · QR Etiket · DÖF · 81 İl Analitik · Finans)"]
    Worker["Otomasyon İşçisi & Giden Kutusu\n(60/30/7g Hatırlatma · Kalibrasyon · DÖF & Fatura Vade)"]
  end

  subgraph Data["Veri & Depolama Katmanı"]
    PG[("PostgreSQL 16 / Serverless PGlite\n(11 İdempotent Prisma Göçü · Decimal(38,18))")]
    Store[("SHA-256 Doğrulamalı Dosya Deposu\n(İmzalı PDF · Kalibrasyon & DÖF Kanıtları · Google Drive Arşiv)")]
  end

  Office --> RBAC
  PWA --> RBAC
  Portal --> RBAC
  Signer --> Verify
  RBAC --> Catalog
  RBAC --> Verify
  RBAC --> NextGen
  Worker --> PG
  Catalog --> PG
  Verify --> PG
  Verify --> Store
  NextGen --> PG
  NextGen --> Store
```

---

## Öne Çıkan Kurumsal Yetenekler

### 1. 144 Resmî Rapor Şablonu & Tek Sayfa A4 PDF / Word (DOCX) Üretimi
- **6 Ana Kategori, 144 Resmî Şablon:** Kaldırma ve İletme Ekipmanları (`34`), Basınçlı Kaplar (`23`), İş Makineleri (`24`), Elektrik & Topraklama & Paratoner (`11`), İSG Ortam Ölçümleri (`11`), Tezgâhlar ve Tesisatlar (`41`).
- **Sıfır Taşmalı Tek Sayfa A4:** `pdf-lib` ve `docx` motorlarıyla tüm raporlar resmî antet, dinamik ölçüm matrisleri, otomatik hidrostatik/halat/topraklama formülleri, cihaz kalibrasyon tablosu, kusur fotoğrafları, denetçi/onaylayan imza blokları ve sağ-alt QR doğrulama kutusuyla **tek bir A4 sayfasına** otomatik ölçeklenir.

### 2. 4-Göz Teknik Onay, İSG-KATİP / EKİPNET Kapıları ve 5070 PAdES E-İmza
- **Zorunlu Kapılar:** Raporu yazan mühendis kendi raporunu onaylayamaz (`authorId !== reviewerId`). İş emrinde İSG-KATİP onayı (`APPROVED` veya gerekçeli `EXEMPT`), mühendisin EKİPNET/kategori yetkinliği ve ölçüm cihazlarının geçerli kalibrasyonu zorunludur.
- **Kriptografik PAdES Doğrulaması:** `FROZEN` aşamasında filigransız PDF üretilip SHA-256 özeti kilitlenir. USB token ile imzalanan PDF üzerinde OpenSSL 3 CMS imza doğrulaması, imzalı byte-range kapsamı, X.509 CA zinciri, `nonRepudiation`/`digitalSignature` KeyUsage ve CRL iptal kontrolleri yapılır.

### 3. Yeni Nesil 5 İnovasyon Paketi (Next-Gen İSG-ERP)
1. **Paket 1 — Fabrika Teslimat & Toplu İmza Hızlandırıcı (`/reports/sign-queue`, `/work-orders/[id]`):**
   - Tek tıkla iş emrindeki tüm imzalı PDF'leri + `00_Rapor_Fihristi.xlsx` özetini içeren **Toplu Teslimat Paketi (`.zip`)** (`/api/exports/delivery-pack`).
   - A4 `2×4` (sayfa başı 8 adet) suya/yağa dayanıklı **Vektörel QR Ekipman Etiketi PDF** (`/api/exports/qr-labels`).
   - **Geçen Yılın Raporlarını Klonla** (sabit fabrika/ekipman verilerini koruyup eski ölçüm ve fotoğrafları sıfırlayarak) ve 40 ayrı e-posta yerine **Tekli İş Emri Özet Bildirimi**.
2. **Paket 2 — Saha Ekipman Sicili, Toplu Excel/CSV İçe Aktarım, QR Okuyucu & Dijital Karne (`/assets`, `/assets/[id]`, `/field`):**
   - 2.000 satıra kadar `.xlsx`/`.csv` ekipman listesini Türkçe/İngilizce başlıklarla önizleyip aktaran sihirbaz (`/api/imports/assets/{template,parse}`).
   - `jsqr` + `BarcodeDetector` tabanlı kamera/fotoğraf/manuel **Saha QR Okuyucu** ve ekipman bazlı **Dijital Karne** zaman çizelgesi.
3. **Paket 3 — DÖF / Uygunsuzluk Takip Motoru & Müşteri Portalı 2.0 (`/nonconformities`, `/portal`):**
   - `KUSURLU_UYGUNDUR` (`MAJOR`, +30 gün) ve `UYGUN_DEGILDIR` (`CRITICAL`, +15 gün) raporlar yayımlandığında otomatik `Nonconformity` (DÖF) kaydı açılır.
   - Müşteri portalından giderim kanıtı (fotoğraf + açıklama) yüklendiğinde durum `EVIDENCE_SUBMITTED` ("Kanıt Yüklendi") olur; yetkili teknik personel incelemesi veya aynı ekipmanda yeni `UYGUNDUR` takip raporu yayımlanmasıyla `CLOSED` durumuna geçer.
4. **Paket 4 — Akıllı Saha Planlama Takvimi & 81-İl Yönetici Analitik Panosu (`/planning`, `/analytics`):**
   - Haftalık/Aylık/Liste mühendis takvimi, aynı gün farklı il (`crossCity`) çakışma uyarısı, EKİPNET/kalibrasyon hazırlık rozetleri ve 81 il / 7 bölge SVG ısı haritalı yönetici analitiği.
5. **Paket 5 — Operasyonel Fatura & Tahsilat Defteri & Dinamik Mesaj Şablonları (`/finance`, `/settings/templates`):**
   - Onaylı teklif veya tamamlanan iş emrinden `Decimal(38,18)` kuruş hassasiyetli fatura oluşturma, kısmi/tam tahsilat (`InvoicePayment`), vadesi geçmiş alacak takibi, `.xlsx` ihracatı ve `{{musteri}}`, `{{ekipman}}`, `{{rapor_no}}` değişkenli canlı mesaj şablon editörü.

---

## Hızlı Kurulum ve Çalıştırma

```bash
# Bağımlılıkları yükleyin ve Prisma istemcisini üretin
pnpm install

# Ortam değişkenlerini kopyalayın
cp .env.example .env.local

# PostgreSQL göçlerini uygulayın ve başlangıç verilerini yükleyin
pnpm prisma:deploy
pnpm prisma:seed

# Geliştirme sunucusunu başlatın (http://localhost:3000)
pnpm dev
```

---

## Kalite Kapıları ve Doğrulama Özeti

| Kontrol | Komut | Sonuç |
| :--- | :--- | :--- |
| TypeScript Tip Denetimi | `pnpm typecheck` | **`0` hata** |
| ESLint Statik Analiz | `pnpm lint` | **`0` hata** |
| Birim & Entegrasyon Testleri (Vitest) | `pnpm test` | **`49/49` dosya, `366/366` test başarılı** |
| Üretim Derlemesi & Standalone Denetimi | `pnpm build` | **`0` Turbopack uyarısı, `exit 0`** |
| Canlıya Geçiş Ön Kontrolü | `pnpm preflight:prod` | **`11 PASS \| 5 WARN \| 0 FAIL -> HAZIR`** |
| İzole Yedek & Geri Yükleme Tatbikatı | `pnpm drill:restore` | **`%100` satır ve göç eşleşmesi (`exit 0`)** |
| Playwright E2E (PGlite + Gerçek PostgreSQL 16) | `pnpm test:e2e` | **Toplam `45/45` benzersiz E2E senaryosu %100 başarılı** |
