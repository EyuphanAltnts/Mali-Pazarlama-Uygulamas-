using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using MailPulse.Domain.Entities;
using MailPulse.Domain.Enums;
using MailPulse.Persistence.Data;

namespace MailPulse.Persistence.Seed;

public static class DataSeeder
{
    public static async Task SeedAsync(MailPulseDbContext context)
    {
        await context.Database.EnsureCreatedAsync();

        if (!await context.Users.AnyAsync())
        {
            var adminId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            var (adminHash, adminSalt) = HashPassword("Admin123!");
            
            var adminUser = new User
            {
                Id = adminId,
                Email = "admin@mailpulse.com",
                FirstName = "Admin",
                LastName = "User",
                Role = "Admin",
                PasswordHash = adminHash,
                PasswordSalt = adminSalt,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var demoId = Guid.Parse("22222222-2222-2222-2222-222222222222");
            var (demoHash, demoSalt) = HashPassword("Demo1234");
            
            var demoUser = new User
            {
                Id = demoId,
                Email = "demo@mailpulse.com",
                FirstName = "Demo",
                LastName = "User",
                Role = "User",
                PasswordHash = demoHash,
                PasswordSalt = demoSalt,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await context.Users.AddRangeAsync(adminUser, demoUser);

            if (!await context.Subscribers.AnyAsync())
            {
                var subscribers = new List<Subscriber>();
                for (int i = 1; i <= 10; i++)
                {
                    subscribers.Add(new Subscriber
                    {
                        Id = Guid.NewGuid(),
                        Email = $"subscriber{i}@example.com",
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow
                    });
                }
                await context.Subscribers.AddRangeAsync(subscribers);
            }

            if (!await context.EmailTemplates.AnyAsync())
            {
                var templates = new List<EmailTemplate>
                {
                    new EmailTemplate
                    {
                        Id = Guid.Parse("33333333-3333-3333-3333-333333333331"),
                        Title = "Welcome Template",
                        HtmlContent = "<html><body style='font-family: Arial, sans-serif;'><h1>Welcome to MailPulse!</h1><p>We are glad to have you here.</p></body></html>",
                        IsActive = true,
                        CreatedByUserId = adminId,
                        CreatedAt = DateTime.UtcNow
                    },
                    new EmailTemplate
                    {
                        Id = Guid.Parse("33333333-3333-3333-3333-333333333332"),
                        Title = "Weekly Newsletter",
                        HtmlContent = "<html><body style='font-family: Arial, sans-serif;'><h2>Weekly Updates</h2><p>Here are the latest news from our platform.</p></body></html>",
                        IsActive = true,
                        CreatedByUserId = adminId,
                        CreatedAt = DateTime.UtcNow
                    },
                    new EmailTemplate
                    {
                        Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                        Title = "Special Promotion",
                        HtmlContent = "<html><body style='font-family: Arial, sans-serif; background-color: #f9f9f9;'><h1>Special Offer!</h1><p>Get 50% off on your next purchase.</p><a href='#' style='display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none;'>Claim Offer</a></body></html>",
                        IsActive = true,
                        CreatedByUserId = demoId,
                        CreatedAt = DateTime.UtcNow
                    }
                };
                await context.EmailTemplates.AddRangeAsync(templates);
            }

            if (!await context.SmtpSettings.AnyAsync())
            {
                var smtpSettings = new SmtpSettings
                {
                    Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
                    Host = "smtp.example.com",
                    Port = 587,
                    Username = "smtp_user",
                    EncryptedPassword = "encrypted_placeholder_password",
                    EnableSsl = true,
                    SenderEmail = "noreply@mailpulse.com",
                    SenderName = "MailPulse System",
                    CreatedAt = DateTime.UtcNow
                };
                await context.SmtpSettings.AddAsync(smtpSettings);
            }

            await context.SaveChangesAsync();
        }

    }

    private static (string hash, string salt) HashPassword(string password)
    {
        byte[] salt = RandomNumberGenerator.GetBytes(16);
        byte[] hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 210000, HashAlgorithmName.SHA512, 64);
        
        return (Convert.ToBase64String(hash), Convert.ToBase64String(salt));
    }
}
