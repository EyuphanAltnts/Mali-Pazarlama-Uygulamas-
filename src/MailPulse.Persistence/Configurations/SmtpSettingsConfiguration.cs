using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MailPulse.Domain.Entities;

namespace MailPulse.Persistence.Configurations;

public class SmtpSettingsConfiguration : IEntityTypeConfiguration<SmtpSettings>
{
    public void Configure(EntityTypeBuilder<SmtpSettings> builder)
    {
        builder.ToTable("SmtpSettings");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Host)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(s => s.Username)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(s => s.EncryptedPassword)
            .IsRequired();

        builder.Property(s => s.SenderEmail)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(s => s.SenderName)
            .HasMaxLength(256);
    }
}
