namespace MailPulse.Application.DTOs.Dashboard;

public record TemplatePerformanceDto(string TemplateName, int TotalSent, int Successful, int Failed);
