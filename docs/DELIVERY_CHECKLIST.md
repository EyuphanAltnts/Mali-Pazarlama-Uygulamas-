# Teslim Hazırlık Kontrol Listesi

## 1. Kod ve derleme durumu
- [x] Proje derleniyor.
- [x] Frontend production build başarılı.
- [x] Tüm .NET testleri başarılı.
- [x] Önemli hata ve çalışma kırılganlığı bulunmuyor.

## 2. Çalıştırma ve ortam hazırlığı
- [x] README adımları mevcut.
- [x] Default demo kullanıcıları hazır.
- [x] Veritabanı otomatik oluşturma/seed işlemi çalışıyor.
- [ ] Gerçek SMTP bilgileri için değerler girilecek.
- [ ] Gerçek PostgreSQL bağlantı bilgileri girilecek.

## 3. Teslim dosyaları
- [x] ER diagram dosyası hazır.
- [x] Sunum metni hazır.
- [x] Proje açıklaması ve özellik listesi mevcut.
- [ ] GitLab remote adresi eklenecek.
- [ ] GitLab üzerinde repository push edilecek.

## 4. Son kontrol
- [x] Kayıt / giriş akışı hazır.
- [x] Şifre sıfırlama akışı hazır.
- [x] Profil ve şifre değiştirme akışı hazır.
- [x] Abone, şablon, kampanya ve raporlama ekranları hazır.
- [x] Yerel Git commit oluşturuldu.

## 5. Sonraki adım
Kuruma ait GitLab / remote URL'i verildikten sonra şu komutlar çalıştırılır:

```bash
git remote add origin <gitlab-url>
git push -u origin main
```

Daha sonra proje teslim için hazır hale gelir.
