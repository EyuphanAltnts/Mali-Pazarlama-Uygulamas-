using System;

namespace MailPulse.Application.DTOs.Templates;

public record TemplateDto(Guid Id, string Title, string HtmlContent, bool IsActive, string CreatedByName, DateTime CreatedAt);
