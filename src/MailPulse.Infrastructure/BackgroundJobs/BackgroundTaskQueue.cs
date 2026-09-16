using System;
using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;
using MailPulse.Application.Interfaces;

namespace MailPulse.Infrastructure.BackgroundJobs;

/// <summary>
/// Implements background task queue using System.Threading.Channels.
/// </summary>
internal class BackgroundTaskQueue : IBackgroundTaskQueue
{
    private readonly Channel<Guid> _queue;

    public BackgroundTaskQueue()
    {
        var options = new BoundedChannelOptions(1000)
        {
            FullMode = BoundedChannelFullMode.Wait
        };
        _queue = Channel.CreateBounded<Guid>(options);
    }

    public async ValueTask EnqueueAsync(Guid campaignId, CancellationToken cancellationToken = default)
    {
        await _queue.Writer.WriteAsync(campaignId, cancellationToken);
    }

    public async ValueTask<Guid> DequeueAsync(CancellationToken cancellationToken = default)
    {
        return await _queue.Reader.ReadAsync(cancellationToken);
    }
}
