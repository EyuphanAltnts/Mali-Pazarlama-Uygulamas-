using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MailPulse.Application.DTOs;
using MailPulse.Application.DTOs.Users;
using MailPulse.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MailPulse.Application.Services;

public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;

    public UserService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<PagedResult<UserDto>> GetUsersAsync(UserFilterDto filter, CancellationToken ct = default)
    {
        var query = _unitOfWork.Users.Query();

        if (!string.IsNullOrEmpty(filter.Search))
        {
            query = query.Where(u => u.FirstName.Contains(filter.Search) || u.LastName.Contains(filter.Search) || u.Email.Contains(filter.Search));
        }

        if (filter.IsActive.HasValue)
        {
            query = query.Where(u => u.IsActive == filter.IsActive.Value);
        }

        var total = await query.CountAsync(ct);

        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(u => new UserDto(u.Id, u.FirstName, u.LastName, u.Email, u.IsActive, u.CreatedAt))
            .ToListAsync(ct);

        return PagedResult<UserDto>.Create(items, total, filter.PageNumber, filter.PageSize);
    }

    public async Task<UserDto> GetUserByIdAsync(Guid id, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null) throw new Exception("User not found");

        return new UserDto(user.Id, user.FirstName, user.LastName, user.Email, user.IsActive, user.CreatedAt);
    }

    public async Task UpdateUserStatusAsync(Guid id, UpdateUserStatusDto dto, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(id);
        if (user == null) throw new Exception("User not found");

        user.IsActive = dto.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Users.UpdateAsync(user);
        await _unitOfWork.SaveChangesAsync();
    }
}
