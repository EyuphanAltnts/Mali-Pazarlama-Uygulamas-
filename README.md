# MailPulse

Mail marketing ve e-posta kampanya yönetimi için geliştirilmiş, modern ve ölçeklenebilir bir uygulamadır. React + TypeScript frontend ve .NET 8 backend mimarisiyle oluşturulmuş olan proje; kampanya tasarımı, abone yönetimi, analitik raporlar ve güvenli kimlik doğrulama işlemlerini tek bir platformda sunar.

[![.NET 8](https://img.shields.io/badge/.NET-8-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

## Özellikler

- E-posta kampanya oluşturma ve yönetimi
- Abone / müşteri listesi yönetimi
- HTML e-posta şablon tasarımı
- Gerçek zamanlı dashboard ve metrikler
- Kampanya performans analizi
- Güvenli JWT tabanlı kimlik doğrulama
- SMTP ayarları ve e-posta gönderim iş akışı
- SQLite ile hızlı lokal geliştirme desteği
- PostgreSQL uyumlu üretim tabanı desteği

## Teknoloji Yığını

### Frontend
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- React Router

### Backend
- ASP.NET Core Web API
- .NET 8
- Entity Framework Core
- FluentValidation
- JWT Authentication
- Serilog

### Veritabanı
- SQLite (geliştirme / hızlı başlatma)
- PostgreSQL (üretim / tam kurulum)

## Mimari Yapı

```text
MailPulse/
├── client/                          # React frontend uygulaması
├── src/
│   ├── MailPulse.API/               # ASP.NET Core Web API
│   ├── MailPulse.Application/       # Uygulama katmanı, servisler ve DTO'lar
│   ├── MailPulse.Domain/            # Domain modelleri ve enumlar
│   ├── MailPulse.Infrastructure/    # Güvenlik, email ve altyapı servisleri
│   ├── MailPulse.Persistence/       # EF Core, repository ve veritabanı yapılandırması
│   └── MailPulse.API/               # API katmanı
├── tests/
│   └── MailPulse.UnitTests/         # Birim testleri
├── docs/                            # Proje dokümantasyonu
├── docker-compose.yml               # Docker kurulumu
├── Dockerfile                       # Uygulama conteynırı
├── MailPulse.slnx                   # Çözüm dosyası
├── README.md                        # Proje dokümantasyonu
└── .gitignore
```

## Başlangıç

### Gereksinimler

- .NET 8 SDK
- Node.js 18+
- npm veya pnpm

### 1) Projeyi klonlayın

```bash
git clone https://github.com/EyuphanAltnts/Mali-Pazarlama-Uygulamas-.git
cd Mali-Pazarlama-Uygulamas-
```

### 2) Backend'i çalıştırın

```bash
dotnet restore
dotnet run --project src/MailPulse.API
```

Varsayılan geliştirme ortamı için API şu adreste çalışır:

```text
http://localhost:5212
```

### 3) Frontend'i çalıştırın

```bash
cd client
npm install
npm run dev
```

Frontend şu adreste açılacaktır:

```text
http://localhost:5173
```

## Varsayılan Hesaplar

Aşağıdaki hesaplar seed verilerle otomatik olarak oluşturulabilir:

| Rol | E-posta | Şifre |
| --- | --- | --- |
| Yönetici | admin@mailpulse.com | Admin123! |
| Demo Kullanıcı | demo@mailpulse.com | Demo1234 |

## Testler

Tüm birim testleri çalıştırmak için:

```bash
dotnet test
```

## Yapılandırma

API yapılandırması için `src/MailPulse.API/appsettings.json` dosyasını kontrol edebilirsiniz. Geliştirme ortamında SQLite kullanılır; üretim veya tam kurulum için PostgreSQL bağlantı dizesi düzenlenmelidir.

## Çözüm Hakkında

Bu proje, e-posta pazarlama süreçlerini yönetmek için tasarlanmış pratik ve modern bir çözüm sunar. MailPulse, kampanya yönetimi, hedef kitle takibi, e-posta şablonları ve performans analitiği gibi alanları tek bir uygulama içinde bir araya getirir.

## Lisans

Bu proje MIT lisansı ile lisanslanmıştır.

## Katkı

Katkı sağlamak isterseniz lütfen branch oluşturup pull request açınız.

## İletişim

Proje sahibi ve geliştirici: Eyüphan Altuntaş

