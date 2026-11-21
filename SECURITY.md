# Güvenlik Politikası (Security Policy)

## Desteklenen Sürümler

| Sürüm | Destek Durumu |
| :--- | :--- |
| `1.0.x` (`main`) | ✅ Aktif Güvenlik Desteği |

## Güvenlik Mimarisi Özeti

Üçteknik İSG-ERP aşağıdaki zorunlu güvenlik kontrolleriyle korunmaktadır:

1. **5070 Sayılı Elektronik İmza Kanunu Uyumluluğu (PAdES):**
   - `FROZEN` aşamasına geçen rapor PDF'leri filigransız olarak dondurulur ve SHA-256 özeti mühürlenir.
   - USB akıllı kart / nitelikli elektronik sertifika (NES) ile imzalanan PDF'ler OpenSSL 3 CMS, X.509 zincir, EKU, KeyUsage ve CRL kontrollerinden geçmeden `SIGNED` / `PUBLISHED` olamaz.
2. **4-Göz Teknik Onay ve İSG-KATİP / EKİPNET Kapısı:**
   - Raporu hazırlayan mühendis (`authorId`) kendi raporunu onaylayamaz (`reviewerId !== authorId`).
   - Ölçüm cihazı kalibrasyonu geçmişse veya mühendisin EKİPNET / kategori yetkinliği eksikse rapor üretimi engellenir.
3. **Çok Kiracılı Kaynak İzolasyonu (`src/lib/auth/resource-scope.ts`):**
   - Müşteri portalı (`CUSTOMER`) yalnızca kendi `customerId` kapsamındaki yayınlanmış raporları, tesisleri, ekipmanları ve DÖF kayıtlarını görebilir.
   - Saha mühendisi (`ENGINEER`) yalnızca kendisine atanan iş emirleri ve kendi raporları üzerinde işlem yapabilir.
4. **Çevrimdışı Saha Kriptografisi (`AES-GCM-256`):**
   - IndexedDB üzerinde tutulan çevrimdışı saha taslakları ve fotoğraflar kullanıcıya özel oturum anahtarıyla `AES-GCM-256` ile şifrelenir; oturum kapatıldığında kriptografik anahtar imha edilir.
