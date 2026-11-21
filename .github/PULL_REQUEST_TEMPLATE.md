## Değişiklik Özeti

- **Kapsam / Modül:** (Örn. Rapor Motoru, E-İmza, DÖF, Finans, Saha PWA, CRM)
- **İlgili Sorun / Talep:**

## Güvenlik ve Uyumluluk Kontrol Listesi

- [ ] **4-Göz İlkesi & İSG-KATİP Kapısı:** Rapor onaylarında `createdById !== reviewerId` ve İSG-KATİP / EKİPNET yetkinlik kontrolleri korundu.
- [ ] **5070 PAdES Elektronik İmza & QR Bütünlüğü:** İmzalı PDF (`FROZEN` / `SIGNED` / `PUBLISHED`) içerik ve SHA-256 özeti değişmezliği korundu.
- [ ] **144 Resmî Şablon A4 Tek Sayfa Garantisi:** PDF ve DOCX çıktılarında tek sayfa A4 sığdırma davranışı bozulmadı.
- [ ] **Kiracı ve Kaynak İzolasyonu (`resource-scope.ts`):** `CUSTOMER`, `ENGINEER`, `SALES`, `TECH_MANAGER`, `ADMIN` kapsam filtreleri doğrulandı.
- [ ] **Finansal Hassasiyet (`Decimal`):** Tutar ve KDV hesaplamalarında kayan nokta (`Number`) yerine `Decimal(38,18)` kullanıldı.
- [ ] **Kalite Kapıları:** `pnpm typecheck`, `pnpm lint`, `pnpm test` ve `pnpm build` hatasız geçti.
