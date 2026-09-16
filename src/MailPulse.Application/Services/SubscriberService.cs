using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MailPulse.Application.DTOs;
using MailPulse.Application.DTOs.Subscribers;
using MailPulse.Application.Interfaces;
using MailPulse.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MailPulse.Application.Services;

public class SubscriberService : ISubscriberService
{
    private readonly IUnitOfWork _unitOfWork;

    public SubscriberService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<SubscriberDto>> GetSubscribersAsync(SubscriberFilterDto filter, CancellationToken ct = default)
    {
        var query = _unitOfWork.Subscribers.Query();

        if (!string.IsNullOrEmpty(filter.Search))
        {
            query = query.Where(s => s.Email.Contains(filter.Search));
        }

        if (filter.IsActive.HasValue)
        {
            query = query.Where(s => s.IsActive == filter.IsActive.Value);
        }

        if (filter.StartDate.HasValue)
        {
            query = query.Where(s => s.CreatedAt >= filter.StartDate.Value);
        }

        if (filter.EndDate.HasValue)
        {
            query = query.Where(s => s.CreatedAt <= filter.EndDate.Value);
        }

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(s => s.CreatedAt)
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(s => new SubscriberDto(s.Id, s.Email, s.IsActive, s.CreatedAt))
            .ToListAsync(ct);

        return PagedResult<SubscriberDto>.Create(items, total, filter.PageNumber, filter.PageSize);
    }

    public async Task<SubscriberDto> GetSubscriberByIdAsync(Guid id, CancellationToken ct = default)
    {
        var subscriber = await _unitOfWork.Subscribers.GetByIdAsync(id);
        if (subscriber == null) throw new Exception("Subscriber not found");

        return new SubscriberDto(subscriber.Id, subscriber.Email, subscriber.IsActive, subscriber.CreatedAt);
    }

    public async Task<SubscriberDto> CreateSubscriberAsync(CreateSubscriberDto dto, CancellationToken ct = default)
    {
        var existing = await _unitOfWork.Subscribers.Query().AnyAsync(s => s.Email == dto.Email, ct);
        if (existing) throw new Exception("Subscriber already exists");

        var subscriber = new Subscriber
        {
            Id = Guid.NewGuid(),
            Email = dto.Email,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Subscribers.AddAsync(subscriber);
        await _unitOfWork.SaveChangesAsync();

        return new SubscriberDto(subscriber.Id, subscriber.Email, subscriber.IsActive, subscriber.CreatedAt);
    }

    public async Task<SubscriberDto> UpdateSubscriberAsync(Guid id, UpdateSubscriberDto dto, CancellationToken ct = default)
    {
        var subscriber = await _unitOfWork.Subscribers.GetByIdAsync(id);
        if (subscriber == null) throw new Exception("Subscriber not found");

        subscriber.IsActive = dto.IsActive;
        subscriber.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Subscribers.UpdateAsync(subscriber);
        await _unitOfWork.SaveChangesAsync();

        return new SubscriberDto(subscriber.Id, subscriber.Email, subscriber.IsActive, subscriber.CreatedAt);
    }

    public async Task DeleteSubscriberAsync(Guid id, CancellationToken ct = default)
    {
        var subscriber = await _unitOfWork.Subscribers.GetByIdAsync(id);
        if (subscriber == null) throw new Exception("Subscriber not found");

        var hasSendings = await _unitOfWork.EmailSendings.Query()
            .AnyAsync(e => e.SubscriberId == subscriber.Id, ct);
        if (hasSendings)
        {
            subscriber.IsActive = false;
            subscriber.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Subscribers.UpdateAsync(subscriber);
        }
        else
        {
            await _unitOfWork.Subscribers.DeleteAsync(subscriber);
        }
        await _unitOfWork.SaveChangesAsync();
    }
}
