namespace MailPulse.Application.DTOs.Templates;

public record UpdateTemplateDto(string Title, string HtmlContent, bool IsActive);
