using System;

namespace MailPulse.Application.DTOs.Subscribers;

public record SubscriberDto(Guid Id, string Email, bool IsActive, DateTime CreatedAt);
