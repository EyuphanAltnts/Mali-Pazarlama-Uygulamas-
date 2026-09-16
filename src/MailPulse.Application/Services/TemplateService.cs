using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MailPulse.Application.DTOs;
using MailPulse.Application.DTOs.Templates;
using MailPulse.Application.Interfaces;
using MailPulse.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MailPulse.Application.Services;

public class TemplateService : ITemplateService
{
    private readonly IUnitOfWork _unitOfWork;

    public TemplateService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<TemplateDto>> GetTemplatesAsync(int pageNumber = 1, int pageSize = 10, CancellationToken ct = default)
    {
        var query = _unitOfWork.EmailTemplates.Query();

        var total = await query.CountAsync(ct);

        var items = await query
            .Include(t => t.CreatedBy)
            .OrderByDescending(t => t.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new TemplateDto(t.Id, t.Title, t.HtmlContent, t.IsActive, t.CreatedBy != null ? t.CreatedBy.FirstName + " " + t.CreatedBy.LastName : "System", t.CreatedAt))
            .ToListAsync(ct);

        return PagedResult<TemplateDto>.Create(items, total, pageNumber, pageSize);
    }

    public async Task<TemplateDto> GetTemplateByIdAsync(Guid id, CancellationToken ct = default)
    {
        var template = await _unitOfWork.EmailTemplates.Query()
            .Include(t => t.CreatedBy)
            .FirstOrDefaultAsync(t => t.Id == id, ct);
            
        if (template == null) throw new Exception("Template not found");

        return new TemplateDto(template.Id, template.Title, template.HtmlContent, template.IsActive, template.CreatedBy != null ? template.CreatedBy.FirstName + " " + template.CreatedBy.LastName : "System", template.CreatedAt);
    }

    public async Task<TemplateDto> CreateTemplateAsync(CreateTemplateDto dto, Guid userId, CancellationToken ct = default)
    {
        var template = new EmailTemplate
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            HtmlContent = dto.HtmlContent,
            IsActive = true,
            CreatedByUserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.EmailTemplates.AddAsync(template);
        await _unitOfWork.SaveChangesAsync();

        var createdTemplate = await _unitOfWork.EmailTemplates.Query()
            .Include(t => t.CreatedBy)
            .FirstOrDefaultAsync(t => t.Id == template.Id, ct);

        if (createdTemplate == null)
            throw new InvalidOperationException("The created template could not be loaded.");

        return new TemplateDto(createdTemplate.Id, createdTemplate.Title, createdTemplate.HtmlContent, createdTemplate.IsActive, createdTemplate.CreatedBy != null ? createdTemplate.CreatedBy.FirstName + " " + createdTemplate.CreatedBy.LastName : "System", createdTemplate.CreatedAt);
    }

    public async Task<TemplateDto> UpdateTemplateAsync(Guid id, UpdateTemplateDto dto, CancellationToken ct = default)
    {
        var template = await _unitOfWork.EmailTemplates.Query()
            .Include(t => t.CreatedBy)
            .FirstOrDefaultAsync(t => t.Id == id, ct);
            
        if (template == null) throw new Exception("Template not found");

        template.Title = dto.Title;
        template.HtmlContent = dto.HtmlContent;
        template.IsActive = dto.IsActive;
        template.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.EmailTemplates.UpdateAsync(template);
        await _unitOfWork.SaveChangesAsync();

        return new TemplateDto(template.Id, template.Title, template.HtmlContent, template.IsActive, template.CreatedBy != null ? template.CreatedBy.FirstName + " " + template.CreatedBy.LastName : "System", template.CreatedAt);
    }

    public async Task DeleteTemplateAsync(Guid id, CancellationToken ct = default)
    {
        var template = await _unitOfWork.EmailTemplates.GetByIdAsync(id);
        if (template == null) throw new Exception("Template not found");

        var hasSendings = await _unitOfWork.EmailSendings.Query()
            .AnyAsync(e => e.Campaign != null && e.Campaign.TemplateId == id, ct);
        if (hasSendings)
        {
            template.IsActive = false;
            template.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.EmailTemplates.UpdateAsync(template);
        }
        else
        {
            await _unitOfWork.EmailTemplates.DeleteAsync(template);
        }
        await _unitOfWork.SaveChangesAsync();
    }
}
