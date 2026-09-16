using Microsoft.EntityFrameworkCore;
using MailPulse.Application.Interfaces;
using MailPulse.Domain.Entities;
using MailPulse.Persistence.Data;

namespace MailPulse.Persistence.Repositories;

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly MailPulseDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public Repository(MailPulseDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public async Task<T?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        return await _dbSet.FindAsync(new object[] { id }, ct);
    }

    public async Task<IReadOnlyList<T>> GetAllAsync(CancellationToken ct = default)
    {
        return await _dbSet.ToListAsync(ct);
    }

    public async Task<T> AddAsync(T entity, CancellationToken ct = default)
    {
        if (entity is BaseEntity baseEntity)
        {
            baseEntity.CreatedAt = DateTime.UtcNow;
        }
        var entry = await _dbSet.AddAsync(entity, ct);
        return entry.Entity;
    }

    public Task UpdateAsync(T entity, CancellationToken ct = default)
    {
        if (entity is BaseEntity baseEntity)
        {
            baseEntity.UpdatedAt = DateTime.UtcNow;
        }
        _dbSet.Update(entity);
        return Task.CompletedTask;
    }

    public Task DeleteAsync(T entity, CancellationToken ct = default)
    {
        _dbSet.Remove(entity);
        return Task.CompletedTask;
    }

    public IQueryable<T> Query()
    {
        return _dbSet.AsQueryable();
    }
}
