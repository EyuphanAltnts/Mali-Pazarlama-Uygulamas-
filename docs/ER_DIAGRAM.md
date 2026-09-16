# MailPulse — Entity-Relationship (ER) Diagram

Bu belge, **MailPulse** E-posta Pazarlama & Analitik Platformu'nun veritabanı şemasını, varlıkları (Entities), birincil anahtarlarını (PK), yabancı anahtarlarını (FK) ve kardinalite ilişkilerini tanımlamaktadır.

---

## 📐 ER Diyagramı (Mermaid)

```mermaid
erDiagram
    Users ||--o{ EmailTemplates : "creates"
    Users ||--o{ EmailCampaigns : "launches"
    Users ||--o{ RefreshTokens : "owns"
    Users ||--o{ PasswordResetTokens : "requests"
    Users ||--o{ AuditLogs : "triggers"
    EmailTemplates ||--o{ EmailCampaigns : "used in"
    EmailCampaigns ||--o{ EmailSendings : "dispatches"
    Subscribers ||--o{ EmailSendings : "receives"

    Users {
        Guid Id PK
        string Email UK
        string FirstName
        string LastName
        string PasswordHash
        string PasswordSalt
        string Role
        bool IsActive
        DateTime CreatedAt
        DateTime UpdatedAt
    }

    Subscribers {
        Guid Id PK
        string Email UK
        bool IsActive
        DateTime CreatedAt
    }

    EmailTemplates {
        Guid Id PK
        string Title
        string HtmlContent
        bool IsActive
        Guid CreatedByUserId FK
        DateTime CreatedAt
        DateTime UpdatedAt
    }

    EmailCampaigns {
        Guid Id PK
        string Name
        Guid TemplateId FK
        Guid CreatedByUserId FK
        int TotalRecipients
        int Status
        DateTime CreatedAt
        DateTime StartedAt
        DateTime CompletedAt
    }

    EmailSendings {
        Guid Id PK
        Guid CampaignId FK
        Guid SubscriberId FK
        string EmailAddress
        int Status
        string ErrorMessage
        DateTime SentAt
        DateTime CreatedAt
    }

    SmtpSettings {
        Guid Id PK
        string Host
        int Port
        string Username
        string EncryptedPassword
        bool EnableSsl
        string SenderEmail
        string SenderName
        DateTime CreatedAt
        DateTime UpdatedAt
    }

    RefreshTokens {
        Guid Id PK
        Guid UserId FK
        string TokenHash UK
        DateTime ExpiresAt
        DateTime CreatedAt
        DateTime RevokedAt
    }

    PasswordResetTokens {
        Guid Id PK
        Guid UserId FK
        string Token UK
        bool IsUsed
        DateTime ExpiresAt
        DateTime CreatedAt
    }

    AuditLogs {
        Guid Id PK
        Guid UserId FK
        string Action
        string IpAddress
        DateTime CreatedAt
    }
```

---

## 🔗 Tablo İlişkileri & Silme Davranışları (Delete Behaviors)

| Birincil Tablo (Parent) | Yabancı Tablo (Child) | Yabancı Anahtar (FK) | Silme Davranışı (Delete Behavior) | Açıklama |
| :--- | :--- | :--- | :--- | :--- |
| **Users** | `EmailTemplates` | `CreatedByUserId` | `Restrict` | Kullanıcı silinirse oluşturduğu şablonlar silinmez. |
| **Users** | `EmailCampaigns` | `CreatedByUserId` | `Restrict` | Kullanıcı silinirse oluşturduğu kampanyalar korunur. |
| **Users** | `RefreshTokens` | `UserId` | `Cascade` | Kullanıcı silindiğinde tüm oturum token'ları silinir. |
| **Users** | `PasswordResetTokens` | `UserId` | `Cascade` | Kullanıcı silindiğinde tüm şifre sıfırlama token'ları silinir. |
| **Users** | `AuditLogs` | `UserId` | `SetNull` | Kullanıcı silinirse denetim logundaki kullanıcı ID'si null yapılır. |
| **EmailTemplates** | `EmailCampaigns` | `TemplateId` | `Restrict` | Kampanyada kullanılan şablonun kazaen silinmesi engellenir. |
| **EmailCampaigns** | `EmailSendings` | `CampaignId` | `Cascade` | Kampanya silindiğinde tüm gönderim günlükleri silinir. |
| **Subscribers** | `EmailSendings` | `SubscriberId` | `SetNull` | Abone silinirse geçmiş e-posta gönderim kaydı korunur, alıcı ID'si null yapılır. |

