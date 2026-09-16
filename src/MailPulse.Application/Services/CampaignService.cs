using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MailPulse.Application.DTOs;
using MailPulse.Application.DTOs.Campaigns;
using MailPulse.Application.Interfaces;
using MailPulse.Domain.Entities;
using MailPulse.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace MailPulse.Application.Services;

public class CampaignService : ICampaignService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IBackgroundTaskQueue _taskQueue;

    public CampaignService(IUnitOfWork unitOfWork, IBackgroundTaskQueue taskQueue)
    {
        _unitOfWork = unitOfWork;
        _taskQueue = taskQueue;
    }

    public async Task<PagedResult<CampaignDto>> GetCampaignsAsync(CampaignFilterDto filter, CancellationToken ct = default)
    {
        var query = _unitOfWork.EmailCampaigns.Query()
            .Include(c => c.Template)
            .Include(c => c.CreatedBy)
            .AsQueryable();

        if (filter.Status.HasValue)
        {
            query = query.Where(c => c.Status == filter.Status.Value);
        }

        if (filter.StartDate.HasValue)
        {
            query = query.Where(c => c.CreatedAt >= filter.StartDate.Value);
        }

        if (filter.EndDate.HasValue)
        {
            query = query.Where(c => c.CreatedAt <= filter.EndDate.Value);
        }

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(c => new CampaignDto(c.Id, c.Name, c.Template != null ? c.Template.Title : "Unknown", c.CreatedBy != null ? c.CreatedBy.FirstName + " " + c.CreatedBy.LastName : "System", c.TotalRecipients, c.Status, c.CreatedAt, c.StartedAt, c.CompletedAt))
            .ToListAsync(ct);

        return PagedResult<CampaignDto>.Create(items, total, filter.PageNumber, filter.PageSize);
    }

    public async Task<CampaignDetailDto> GetCampaignByIdAsync(Guid id, CancellationToken ct = default)
    {
        var campaign = await _unitOfWork.EmailCampaigns.Query()
            .Include(c => c.Template)
            .Include(c => c.CreatedBy)
            .FirstOrDefaultAsync(c => c.Id == id, ct);
            
        if (campaign == null) throw new Exception("Campaign not found");

        var pendingCount = await _unitOfWork.EmailSendings.Query()
            .CountAsync(s => s.CampaignId == id && s.Status == EmailSendingStatus.Pending, ct);
            
        var processingCount = await _unitOfWork.EmailSendings.Query()
            .CountAsync(s => s.CampaignId == id && s.Status == EmailSendingStatus.Processing, ct);

        var sentCount = await _unitOfWork.EmailSendings.Query()
            .CountAsync(s => s.CampaignId == id && s.Status == EmailSendingStatus.Sent, ct);
            
        var failedCount = await _unitOfWork.EmailSendings.Query()
            .CountAsync(s => s.CampaignId == id && s.Status == EmailSendingStatus.Failed, ct);

        var totalProcessed = sentCount + failedCount;
        var progressPercentage = campaign.TotalRecipients > 0 ? (double)totalProcessed / campaign.TotalRecipients * 100 : 0;

        return new CampaignDetailDto(
            campaign.Id, campaign.Name, campaign.Template?.Title ?? "Unknown", campaign.CreatedBy != null ? campaign.CreatedBy.FirstName + " " + campaign.CreatedBy.LastName : "System", campaign.TotalRecipients, 
            campaign.Status, campaign.CreatedAt, campaign.StartedAt, campaign.CompletedAt,
            pendingCount, processingCount, sentCount, failedCount, progressPercentage);
    }

    public async Task<CampaignDto> CreateCampaignAsync(CreateCampaignDto dto, Guid userId, CancellationToken ct = default)
    {
        var subscriberIds = dto.SubscriberIds.Distinct().ToList();
        var subscribers = await _unitOfWork.Subscribers.Query()
            .Where(s => subscriberIds.Contains(s.Id) && s.IsActive)
            .ToListAsync(ct);

        if (subscribers.Count != subscriberIds.Count)
            throw new InvalidOperationException("One or more selected subscribers are invalid or inactive.");

        var templateExists = await _unitOfWork.EmailTemplates.Query()
            .AnyAsync(t => t.Id == dto.TemplateId && t.IsActive, ct);

        if (!templateExists)
            throw new InvalidOperationException("The selected template is invalid or inactive.");

        var campaign = new EmailCampaign
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            TemplateId = dto.TemplateId,
            CreatedByUserId = userId,
            TotalRecipients = subscribers.Count,
            Status = CampaignStatus.Draft,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.EmailCampaigns.AddAsync(campaign);
        foreach (var subscriber in subscribers)
        {
            await _unitOfWork.EmailSendings.AddAsync(new EmailSending
            {
                Id = Guid.NewGuid(),
                CampaignId = campaign.Id,
                SubscriberId = subscriber.Id,
                EmailAddress = subscriber.Email,
                Status = EmailSendingStatus.Pending,
                CreatedAt = DateTime.UtcNow
            }, ct);
        }
        await _unitOfWork.SaveChangesAsync();

        var created = await _unitOfWork.EmailCampaigns.Query()
            .Include(c => c.Template)
            .Include(c => c.CreatedBy)
            .FirstOrDefaultAsync(c => c.Id == campaign.Id, ct);

        if (created == null)
            throw new InvalidOperationException("The created campaign could not be loaded.");

        return new CampaignDto(created.Id, created.Name, created.Template?.Title ?? "Unknown", created.CreatedBy != null ? created.CreatedBy.FirstName + " " + created.CreatedBy.LastName : "System", created.TotalRecipients, created.Status, created.CreatedAt, created.StartedAt, created.CompletedAt);
    }

    public async Task<CampaignDto> UpdateCampaignAsync(Guid id, CreateCampaignDto dto, CancellationToken ct = default)
    {
        var campaign = await _unitOfWork.EmailCampaigns.Query()
            .Include(c => c.Template)
            .Include(c => c.CreatedBy)
            .FirstOrDefaultAsync(c => c.Id == id, ct);
            
        if (campaign == null) throw new Exception("Campaign not found");

        campaign.Name = dto.Name;
        campaign.TemplateId = dto.TemplateId;

        await _unitOfWork.EmailCampaigns.UpdateAsync(campaign);
        await _unitOfWork.SaveChangesAsync();
        
        var updated = await _unitOfWork.EmailCampaigns.Query()
            .Include(c => c.Template)
            .Include(c => c.CreatedBy)
            .FirstOrDefaultAsync(c => c.Id == id, ct);

        if (updated == null)
            throw new InvalidOperationException("The updated campaign could not be loaded.");

        return new CampaignDto(updated.Id, updated.Name, updated.Template?.Title ?? "Unknown", updated.CreatedBy != null ? updated.CreatedBy.FirstName + " " + updated.CreatedBy.LastName : "System", updated.TotalRecipients, updated.Status, updated.CreatedAt, updated.StartedAt, updated.CompletedAt);
    }

    public async Task DeleteCampaignAsync(Guid id, CancellationToken ct = default)
    {
        var campaign = await _unitOfWork.EmailCampaigns.GetByIdAsync(id);
        if (campaign == null) throw new Exception("Campaign not found");

        await _unitOfWork.EmailCampaigns.DeleteAsync(campaign);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task SendCampaignAsync(Guid id, CancellationToken ct = default)
    {
        var campaign = await _unitOfWork.EmailCampaigns.GetByIdAsync(id);
        if (campaign == null) throw new Exception("Campaign not found");
        
        if (campaign.Status != CampaignStatus.Draft)
            throw new Exception("Only draft campaigns can be sent");

        campaign.Status = CampaignStatus.Processing;
        campaign.StartedAt = DateTime.UtcNow;
        
        await _unitOfWork.EmailCampaigns.UpdateAsync(campaign);
        await _unitOfWork.SaveChangesAsync(ct);
        await _taskQueue.EnqueueAsync(id, ct);
    }
}
