using System;

namespace MailPulse.Application.DTOs.Dashboard;

public record DailySendDto(DateTime Date, int Count, int Successful, int Failed);
