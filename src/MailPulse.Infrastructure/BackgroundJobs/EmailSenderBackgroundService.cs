using MailPulse.Application.Interfaces;
using MailPulse.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace MailPulse.Infrastructure.BackgroundJobs;

internal class EmailSenderBackgroundService : BackgroundService
{
    private readonly IBackgroundTaskQueue _taskQueue;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<EmailSenderBackgroundService> _logger;

    public EmailSenderBackgroundService(
        IBackgroundTaskQueue taskQueue,
        IServiceScopeFactory scopeFactory,
        ILogger<EmailSenderBackgroundService> logger)
    {
        _taskQueue = taskQueue;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Email Sender Background Service started.");
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var campaignId = await _taskQueue.DequeueAsync(stoppingToken);
                await ProcessCampaignAsync(campaignId, stoppingToken);
            }
            catch (OperationCanceledException) { }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in background email processing.");
            }
        }
    }

    private async Task ProcessCampaignAsync(Guid campaignId, CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var emailSender = scope.ServiceProvider.GetRequiredService<IEmailSender>();

        var campaign = await unitOfWork.EmailCampaigns.Query()
            .Include(c => c.Template)
            .Include(c => c.Sendings)
            .FirstOrDefaultAsync(c => c.Id == campaignId, ct);

        if (campaign == null) { _logger.LogWarning("Campaign {Id} not found.", campaignId); return; }

        var pendingSendings = campaign.Sendings.Where(s => s.Status == EmailSendingStatus.Pending).ToList();

        foreach (var sending in pendingSendings)
        {
            if (ct.IsCancellationRequested) break;
            sending.Status = EmailSendingStatus.Processing;
            await unitOfWork.SaveChangesAsync(ct);

            try
            {
                var sent = await emailSender.SendEmailAsync(sending.EmailAddress, campaign.Template.Title, campaign.Template.HtmlContent, ct);
                if (sent)
                {
                    sending.Status = EmailSendingStatus.Sent;
                    sending.SentAt = DateTime.UtcNow;
                    _logger.LogInformation("Sent email to {Email} for campaign {CampaignId}", sending.EmailAddress, campaignId);
                }
                else
                {
                    sending.Status = EmailSendingStatus.Failed;
                    sending.ErrorMessage = "The email sender reported a delivery failure.";
                }
            }
            catch (Exception ex)
            {
                sending.Status = EmailSendingStatus.Failed;
                sending.ErrorMessage = ex.Message.Length > 2000 ? ex.Message[..2000] : ex.Message;
                _logger.LogError(ex, "Failed to send email to {Email}", sending.EmailAddress);
            }
            await unitOfWork.SaveChangesAsync(ct);
        }

        var allSendings = campaign.Sendings.ToList();
        var allDone = allSendings.All(s => s.Status == EmailSendingStatus.Sent || s.Status == EmailSendingStatus.Failed);
        if (allDone)
        {
            campaign.Status = allSendings.All(s => s.Status == EmailSendingStatus.Failed)
                ? CampaignStatus.Failed : CampaignStatus.Completed;
            campaign.CompletedAt = DateTime.UtcNow;
            await unitOfWork.SaveChangesAsync(ct);
        }
    }
}
