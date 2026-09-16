using System;
using System.Threading;
using System.Threading.Tasks;

namespace MailPulse.Application.Interfaces;

/// <summary>
/// Background task queue for managing asynchronous operations like email sending.
/// </summary>
public interface IBackgroundTaskQueue
{
    ValueTask EnqueueAsync(Guid campaignId, CancellationToken ct = default);
    ValueTask<Guid> DequeueAsync(CancellationToken ct = default);
}
