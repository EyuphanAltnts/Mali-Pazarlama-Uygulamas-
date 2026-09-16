using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MailPulse.Domain.Entities;

namespace MailPulse.Persistence.Configurations;

public class EmailSendingConfiguration : IEntityTypeConfiguration<EmailSending>
{
    public void Configure(EntityTypeBuilder<EmailSending> builder)
    {
        builder.ToTable("EmailSendings");

        builder.HasKey(e => e.Id);

        builder.Property(e => e.EmailAddress)
            .IsRequired()
            .HasMaxLength(256);

        builder.Property(e => e.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(e => e.ErrorMessage)
            .HasMaxLength(2000);

        builder.HasIndex(e => e.CampaignId);
        builder.HasIndex(e => e.SubscriberId);
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => e.SentAt);

        builder.HasOne(e => e.Subscriber)
            .WithMany()
            .HasForeignKey(e => e.SubscriberId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
