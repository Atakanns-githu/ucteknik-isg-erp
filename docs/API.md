# HTTP API envanteri

Bu envanter `src/app/api` altındaki mevcut route handler'ları özetler. Uygulamanın birçok kayıt işlemi Next.js sunucu işlemleri üzerinden yapılır. Bu işlemler aşağıdaki HTTP rota envanterine dahil değildir. İstek gövdeleri, yanıt alanları ve duruma özgü hata davranışları için ilgili rota dosyası esas alınır.

[OpenAPI tanımı](openapi.yaml) HTTP rotalarını ve uygulamanın kullandığı Auth.js kimlik doğrulama işlemlerini kapsar. Next.js sunucu işlemleri bu tanımın dışındadır.

Oturum gerektiren rotalarda rol izni ve ilgili kaydın kapsamı kontrol edilir. Rol izinleri [rol belgesinde](ROLES.md), kapsam filtreleri [kaynak kodda](../src/lib/security/resource-scope.ts) yer alır. Doğrulama belirteçli rotalar raporun durumuna ve erişim koşullarına göre ayrıca karar verir. Dosya rotaları başarılı olduğunda JSON yerine ilgili dosya türünü döndürür.

## Oturum, durum ve otomasyon

- `GET /api/health` veritabanı ve depo durumunu döndürür. Sağlıklı durumda 200, kontrollerden biri başarısızsa 503 döner.
- `GET, POST /api/auth/[...nextauth]` kimlik doğrulama işlemlerini yürütür.
- `POST /api/cron/run` otomasyon döngüsünü çalıştırır. `CRON_SECRET` ile Bearer kimlik doğrulaması veya `automations:manage` izinli oturum kullanır. `GET` 405 döndürür.

## Rapor ve dosyalar

- `GET /api/reports/[id]/pdf`, `/docx`, `/xlsx` ve `/qr` rapor dosyasını veya QR görselini sunar.
- `POST /api/reports/import/parse` geçmiş PDF'den alan önerileri çıkarır. `POST /api/reports/import` geçmiş PDF'yi taslak kayıt olarak alır. Her ikisi `multipart/form-data` içinde `file` kullanır.
- `GET /api/verify/[token]/qr` doğrulama QR görselini, `GET /api/verify/[token]/download` uygun imzalı PDF'yi sunar. Her iki rotada hız sınırı uygulanır.
- `GET, POST /api/submissions/[id]/attachments` saha formunun eklerini listeler veya yükler.
- `GET, DELETE /api/attachments/[attachmentId]` eki sunar veya iş akışı izin veriyorsa siler.
- `GET /api/templates/catalog/[code]` katalog şablonunu döndürür.

## Sözleşme, teklif ve kalibrasyon

- `POST /api/contracts/parse` `file` alanındaki PDF'yi ayrıştırır.
- `GET /api/contracts/[id]/pdf` sözleşme PDF'sini bütünlük kontrolünden geçirerek sunar.
- `GET /api/offers/[id]/pdf` ve `GET /api/offers/[id]/xlsx` teklif çıktısı üretir.
- `GET, POST, DELETE /api/instruments/[id]/certificate` cihaz sertifikasını sunar, yükler veya kaldırır.

## Fotoğraflar, QR ve DÖF Kanıtları

- `GET /api/field-photos` erişilebilir fotoğrafları listeler.
- `POST /api/field-photos` `multipart/form-data` ile en fazla 10 fotoğraf alır.
- `GET, PATCH, DELETE /api/field-photos/[id]` tek fotoğrafı sunar, günceller veya siler.
- `GET /api/field/qr-lookup?code=...` QR belirteci, rapor numarası, ekipman kodu veya seri numarasından erişilebilir kayıtları bulur.
- `GET, POST /api/portal/nonconformities/[id]/evidence` uygunsuzluğun kanıt görselini sunar veya kanıt yükler.

## Toplu Çıktılar & İçe Aktarımlar

- `GET /api/exports/delivery-pack?workOrderId=...` iş emri imzalı PDF'leri + `00_Rapor_Fihristi.xlsx` ZIP teslimat paketi üretir.
- `GET /api/exports/qr-labels` A4 2×4 vektörel QR ekipman etiketi PDF üretir.
- `GET /api/exports/assets`, `/customers`, `/finance`, `/instruments`, `/reports`, `/work-orders` Excel (`.xlsx`) çıktıları sunar.
- `GET /api/imports/assets/template` ve `POST /api/imports/assets/parse` toplu ekipman içe aktarma şablonu ve ayrıştırıcısını sunar.
