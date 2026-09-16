using System;
using System.Threading;
using System.Threading.Tasks;
using MailPulse.Application.DTOs;
using MailPulse.Application.DTOs.Campaigns;

namespace MailPulse.Application.Interfaces;

/// <summary>
/// Service for managing email campaigns.
/// </summary>
public interface ICampaignService
{
    Task<PagedResult<CampaignDto>> GetCampaignsAsync(CampaignFilterDto filter, CancellationToken ct = default);
    Task<CampaignDetailDto> GetCampaignByIdAsync(Guid id, CancellationToken ct = default);
    Task<CampaignDto> CreateCampaignAsync(CreateCampaignDto dto, Guid userId, CancellationToken ct = default);
    Task<CampaignDto> UpdateCampaignAsync(Guid id, CreateCampaignDto dto, CancellationToken ct = default);
    Task DeleteCampaignAsync(Guid id, CancellationToken ct = default);
    Task SendCampaignAsync(Guid id, CancellationToken ct = default);
}
