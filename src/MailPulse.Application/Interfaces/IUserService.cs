using System;
using System.Threading;
using System.Threading.Tasks;
using MailPulse.Application.DTOs;
using MailPulse.Application.DTOs.Users;

namespace MailPulse.Application.Interfaces;

/// <summary>
/// Service for managing users.
/// </summary>
public interface IUserService
{
    Task<PagedResult<UserDto>> GetUsersAsync(UserFilterDto filter, CancellationToken ct = default);
    Task<UserDto> GetUserByIdAsync(Guid id, CancellationToken ct = default);
    Task UpdateUserStatusAsync(Guid id, UpdateUserStatusDto dto, CancellationToken ct = default);
}
