using System;
using System.Threading;
using System.Threading.Tasks;
using MailPulse.Application.DTOs;
using MailPulse.Application.DTOs.Templates;

namespace MailPulse.Application.Interfaces;

/// <summary>
/// Service for managing email templates.
/// </summary>
public interface ITemplateService
{
    Task<PagedResult<TemplateDto>> GetTemplatesAsync(int pageNumber = 1, int pageSize = 10, CancellationToken ct = default);
    Task<TemplateDto> GetTemplateByIdAsync(Guid id, CancellationToken ct = default);
    Task<TemplateDto> CreateTemplateAsync(CreateTemplateDto dto, Guid userId, CancellationToken ct = default);
    Task<TemplateDto> UpdateTemplateAsync(Guid id, UpdateTemplateDto dto, CancellationToken ct = default);
    Task DeleteTemplateAsync(Guid id, CancellationToken ct = default);
}
