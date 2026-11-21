# Veri sözlüğü

Bu sözlük [Prisma şemasındaki](../prisma/schema.prisma) modelleri ve önemli alanları açıklar.

## Kimlik ve sistem

- **User** oturum hesabını, rolü, etkinlik durumunu, müşteri bağlantısını ve teknik personel bilgilerini tutar. `sessionVersion` oturumun geçerliliği için kullanılır.
- **AuditLog** kullanıcı, işlem, nesne, ayrıntı ve zamanı kaydeder.
- **SequenceCounter** numara üretimi için anahtar ve sayaç tutar.
- **SystemSetting** anahtara bağlı JSON ayarını ve güncellenme zamanını tutar.

## Müşteri ve satış

- **Customer** firma kimliği ve iletişim bilgileriyle müşteri durumunu tutar.
- **Contact** müşteriye bağlı iletişim kişisini tutar.
- **Site** müşterinin tesisini ve adresini tutar.
- **SiteAsset** tesisteki ekipmanı, ekipman kodunu, tercih edilen şablon kodunu (`preferredTemplateCode`) ve kontrol tarihlerini tutar. Tesis ve ekipman kodu birlikte benzersizdir.
- **Opportunity** müşterinin satış fırsatını, aşamasını ve varsa bağlı teklifini tutar.
- **Activity** müşteri, kişi veya fırsatla ilişkilendirilebilen görüşme ve ileti geçmişidir.
- **Task** görev durumunu, son tarihi ve varsa sorumlu ile müşteri veya fırsat bağlantısını tutar.
- **Consent** kişi ve kanal için izin kaynağı, kayıt zamanı ve varsa iptal zamanını tutar.

## İletişim ve otomasyon

- **MessageTemplate** kanal, ad, konu ve ileti gövdesini tanımlar.
- **Campaign** şablona bağlı hedef kitle ve kampanya durumunu tutar.
- **OutboxMessage** alıcıyı, kanalı, gönderim durumunu, deneme bilgisini ve benzersiz `idempotencyKey` değerini tutar.
- **Automation** otomasyon anahtarını, etkinlik durumunu, varsa şablon ve son çalışma sonucunu tutar.

## Teklif, planlama ve saha

- **Offer** müşteri, teklif numarası, revizyon, durum, geçerlilik tarihi ve parasal toplamları (`Decimal(38,18)`) tutar.
- **OfferItem** teklifin hizmet kalemi, miktarı ve fiyatını tutar.
- **OfferReportSlot** teklif kaleminin sıra numarasını iş emrine bağlar.
- **WorkOrder** müşteri, tesis, varsa teklif ve sözleşme bağlantısını, plan tarihini ve KATİP bilgilerini tutar.
- **FieldVisit** iş emri için ziyaret tarihi, durum ve gerçekleşme zamanlarını tutar.
- **FieldVisitTemplateScope** ziyaretin kapsadığı şablonları bağlar.
- **VisitAssignment** personele atanan ziyareti ve ziyaret rolünü tutar.
- **InspectorQualification** personelin şablona ilişkin yetkinlik referanslarını ve geçerlilik dönemini tutar.
- **Instrument** ölçüm cihazını, kalibrasyon tarihlerini ve varsa sertifika dosya anahtarı ile SHA-256 özetini tutar.
- **InstrumentUsage** cihazı saha formuna bağlar ve varsa istisna gerekçesini kaydeder.

## Şablon ve rapor

- **FormTemplate** form kodunu, adını, kategorisini ve hizmet kodunu tutar.
- **FormTemplateVersion** şablonun numaralı sürümünü, durumunu, JSON tanımını ve onay bilgisini tutar.
- **FormSubmission** iş emri ve şablon sürümüne bağlı saha verisini `data` alanında saklar.
- **Attachment** forma bağlı dosya anahtarını, türünü, boyutunu ve SHA-256 özetini tutar.
- **Report** rapor numarasını, müşteri ve tesis ilişkilerini, durum ve tarihleri, dondurulmuş veriyi, dosya anahtarlarını, özetleri, imza kanıtını ve benzersiz QR belirtecini tutar.
- **IsgContract** sözleşme bilgilerini, PDF anahtarını, boyutunu ve özetini tutar.
- **EquipmentPhoto** fotoğraf dosyası ve özetini, çekim zamanını ve açıklamayı tutar.
- **QrVerificationEvent** rapor doğrulama olayını kaydeder.

## Uygunsuzluk ve finans

- **Nonconformity** rapor kalemine bağlı uygunsuzluk (`OPEN`, `EVIDENCE_SUBMITTED`, `REINSPECTED`, `CLOSED`), önem (`CRITICAL`, `MAJOR`, `MINOR`), müşteri kanıtı ve takip raporu bağlantısını tutar.
- **Invoice** müşteri ve varsa teklif veya iş emrine bağlı fatura numarasını, e-Fatura UUID'sini, tarihleri, para birimini, `Decimal(38,18)` tutarları ve durumu tutar.
- **InvoicePayment** faturaya bağlı tahsilat tutarını, tarihini, yöntemini ve kaydeden kullanıcıyı tutar.
