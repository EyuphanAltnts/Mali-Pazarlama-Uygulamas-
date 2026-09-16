# MailPulse Proje Sunum Metni

## Proje Özeti
MailPulse, kullanıcıların e-posta abonelerini yönetebildiği, şablonlar oluşturabildiği ve kampanya gönderimi yapabildiği bir e-posta pazarlama platformudur. Proje, .NET 8 API, Entity Framework Core, PostgreSQL/SQLite uyumlu veri yapısı ve React + TypeScript arayüzü ile geliştirilmiştir.

Uygulama kullanıcı tarafında abonelik alma ekranı, giriş ve kayıt işlemleri sunar. Yönetim tarafında ise kullanıcı yönetimi, şablon oluşturma, kampanya oluşturma ve raporlama ekranları yer alır. Gönderim işlemleri arka planda asenkron şekilde çalışır; sonuçlar raporlama ekranında takip edilebilir.

## Teknik Özellikler
- Katmanlı mimari: Domain, Application, Persistence, Infrastructure, API
- JWT tabanlı güvenlik ve kullanıcı doğrulama
- Şifreleme ve güvenlik katmanı
- SMTP ayarları ve e-posta gönderim desteği
- Abone, şablon, kampanya ve raporlama modülleri
- React arayüzü ve modern dashboard yapısı

## Demo Akışı
1. Uygulama açılır.
2. Admin veya demo kullanıcı ile giriş yapılır.
3. Dashboard üzerinden toplam abone, şablon ve kampanya bilgileri görülür.
4. Abone sayfasından yeni aboneler eklenir.
5. Şablon sayfasından HTML e-posta şablonu oluşturulur.
6. Kampanyalar sayfasında hedef aboneler ve şablon seçilir.
7. Gönderim başlatılır.
8. Raporlar sayfasında başarılı/başarısız gönderim sonuçları kontrol edilir.

## Teslim Notları
- Proje yerel olarak çalışır durumda hazırlanmıştır.
- Testler çalıştırılmış ve başarıyla geçmiştir.
- Git deposu yerel olarak oluşturulmuştur.
- Firma / okul tarafından istenen GitLab remote adresi eklenirse aynı anda teslim için hazır hale gelir.

## Varsayılan Kullanıcılar
- Yönetici: admin@mailpulse.com / Admin123!
- Demo: demo@mailpulse.com / Demo1234

## Kısa Sonuç
Bu proje, modern bir e-posta pazarlama uygulaması için gerekli temel iş akışlarını başarıyla sağlar. Kullanıcı yönetimi, abonelik, şablon, kampanya, SMTP ve raporlama modülleri birlikte çalışır şekilde tasarlanmıştır.
