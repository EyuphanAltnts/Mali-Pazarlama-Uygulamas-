# 📬 MailPulse — Mail Marketing & Real-Time Analytics Platform

> **Enterprise-Grade Email Marketing & Analytics Platform** developed with **.NET 8/10 Clean Architecture**, **PostgreSQL**, and **React 18 + TypeScript + TailwindCSS**.

[![.NET Version](https://img.shields.io/badge/.NET-8%20%2F%2010-purple.svg)](https://dotnet.microsoft.com/)
[![React Version](https://img.shields.io/badge/React-18.3%20%2B%20TypeScript-blue.svg)](https://reactjs.org/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-336791.svg)](https://www.postgresql.org/)
[![Architecture](https://img.shields.io/badge/Architecture-Clean%20%2F%20N--Layer-success.svg)](#architecture)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)](#testing)

---

## 🌟 Key Features

- **⚡ High-Throughput Asynchronous Queue Engine**: Thread-safe bounded channel background queue (`IBackgroundTaskQueue` & `EmailSenderBackgroundService`) for parallel email delivery without blocking Web API requests.
- **📊 Real Data Analytics & KPI Dashboard**: 100% database-backed metrics, 7-day velocity area charts, status distribution pie charts, and template performance metrics (Recharts).
- **📝 HTML Email Template Designer**: Live HTML editor with built-in responsive iframe preview and multi-campaign support.
- **👥 Audience & Subscriber Management**: Full search, filtering, pagination, and soft-delete protections against breaking historic audit trails.
- **🔒 Enterprise Security**:
  - PBKDF2 with SHA-512 (210,000 iterations) + CSPRNG 16-byte salt password hashing.
  - Short-lived JWT Access Tokens & Refresh Tokens with constant-time verification.
  - AES-256 encrypted SMTP secret storage at rest.
  - IP & User-based rate limiting via ASP.NET Core RateLimiter.
- **📋 Audit & Delivery Logs**: Detailed delivery records per recipient with exact error tracking and retry mechanisms.

---

## 🏗️ Architecture

```
MailPulse/
├── src/
│   ├── MailPulse.Domain/          # Core entities, Enums, Constants (Zero external dependencies)
│   ├── MailPulse.Application/     # CQRS/Services interfaces, DTOs, FluentValidation validators
│   ├── MailPulse.Persistence/     # EF Core DbContext, PostgreSQL configs, Repositories, Migrations, Seed
│   ├── MailPulse.Infrastructure/  # Security (PBKDF2, JWT, AES), SmtpClient, Channels Queue, Hosted Services
│   └── MailPulse.API/             # Web API Controllers, Serilog, Swagger OpenAPI, Global Error Handling
├── client/                        # React 18 + TypeScript + TailwindCSS + Recharts SPA
├── tests/
│   └── MailPulse.UnitTests/       # XUnit + Moq + FluentAssertions Unit Tests
├── docker-compose.yml             # PostgreSQL & Multi-stage API orchestration
└── Dockerfile                     # Optimized multi-stage Docker build
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- [.NET 8 / 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/) (or Docker)

### 2. Database & Backend Setup
1. Configure database connection string in `src/MailPulse.API/appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Port=5432;Database=mailpulse;Username=postgres;Password=postgres"
}
```
2. Run database migration and launch the backend:
```powershell
dotnet build
dotnet run --project src/MailPulse.API
```
*The API will start at `http://localhost:5000`. Migrations and seed data (Admin & Demo users) are applied automatically in development mode.*

### 3. Frontend Setup
```powershell
cd client
npm install
npm run dev
```
*The React application will launch at `http://localhost:5173`.*

---

## 🔑 Default Credentials (Seed Data)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@mailpulse.com` | `Admin123!` |
| **Demo User** | `demo@mailpulse.com` | `Demo1234` |

---

## 🧪 Testing

Execute the comprehensive unit test suite:
```powershell
dotnet test
```

---

## 🐳 Docker Deployment

To spin up PostgreSQL and the MailPulse API in containers:
```powershell
docker-compose up -d --build
```

---

## � Delivery Notes

### Run the project locally
```powershell
dotnet restore
cd client
npm install
npm run dev
```

Then start the backend from the root folder:
```powershell
dotnet run --project src/MailPulse.API
```

### Demo accounts
- Admin: `admin@mailpulse.com` / `Admin123!`
- Demo user: `demo@mailpulse.com` / `Demo1234`

### Delivery checklist
- Build and tests already verified.
- Git repository initialized locally.
- ER diagram is available in [docs/ER_DIAGRAM.md](docs/ER_DIAGRAM.md).
- Presentation text is available in [docs/PRESENTATION_TEXT.md](docs/PRESENTATION_TEXT.md).
- Delivery checklist is available in [docs/DELIVERY_CHECKLIST.md](docs/DELIVERY_CHECKLIST.md).

## �📄 License
This project is licensed under the MIT License.

