using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MailPulse.Domain.Entities;

namespace MailPulse.Persistence.Configurations;

public class PasswordResetTokenConfiguration : IEntityTypeConfiguration<PasswordResetToken>
{
    public void Configure(EntityTypeBuilder<PasswordResetToken> builder)
    {
        builder.ToTable("PasswordResetTokens");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Token)
            .IsRequired()
            .HasMaxLength(512);

        builder.HasIndex(p => p.Token)
            .IsUnique();

        builder.Property(p => p.IsUsed)
            .HasDefaultValue(false);

        builder.Property(p => p.ExpiresAt)
            .IsRequired();

        builder.HasOne(p => p.User)
            .WithMany(u => u.PasswordResetTokens)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
