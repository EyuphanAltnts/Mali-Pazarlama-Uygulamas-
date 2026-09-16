using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MailPulse.Domain.Entities;

namespace MailPulse.Persistence.Configurations;

public class AuditLogConfiguration : IEntityTypeConfiguration<AuditLog>
{
    public void Configure(EntityTypeBuilder<AuditLog> builder)
    {
        builder.ToTable("AuditLogs");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Action)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(a => a.EntityType)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(a => a.EntityId)
            .HasMaxLength(256);

        builder.Property(a => a.Details)
            .HasMaxLength(4000);

        builder.Property(a => a.IpAddress)
            .HasMaxLength(64);

        builder.HasIndex(a => a.UserId);
        builder.HasIndex(a => a.CreatedAt);
    }
}
