using MailPulse.Domain.Enums;

namespace MailPulse.Application.DTOs.Dashboard;

public record StatusDistributionDto(EmailSendingStatus Status, int Count);
