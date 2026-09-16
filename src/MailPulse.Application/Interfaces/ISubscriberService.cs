using System;
using System.Threading;
using System.Threading.Tasks;
using MailPulse.Application.DTOs;
using MailPulse.Application.DTOs.Subscribers;

namespace MailPulse.Application.Interfaces;

/// <summary>
/// Service for managing subscribers.
/// </summary>
public interface ISubscriberService
{
    Task<PagedResult<SubscriberDto>> GetSubscribersAsync(SubscriberFilterDto filter, CancellationToken ct = default);
    Task<SubscriberDto> GetSubscriberByIdAsync(Guid id, CancellationToken ct = default);
    Task<SubscriberDto> CreateSubscriberAsync(CreateSubscriberDto dto, CancellationToken ct = default);
    Task<SubscriberDto> UpdateSubscriberAsync(Guid id, UpdateSubscriberDto dto, CancellationToken ct = default);
    Task DeleteSubscriberAsync(Guid id, CancellationToken ct = default);
}
