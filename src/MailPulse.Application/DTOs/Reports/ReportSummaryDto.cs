namespace MailPulse.Application.DTOs.Reports;

public record ReportSummaryDto(int TotalSent, int Successful, int Failed, double SuccessRate);
