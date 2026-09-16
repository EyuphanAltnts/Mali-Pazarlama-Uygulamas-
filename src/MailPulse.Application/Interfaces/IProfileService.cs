using System;
using System.Threading;
using System.Threading.Tasks;
using MailPulse.Application.DTOs;
using MailPulse.Application.DTOs.Profile;

namespace MailPulse.Application.Interfaces;

/// <summary>
/// Service for managing user profiles.
/// </summary>
public interface IProfileService
{
    Task<ProfileDto> GetProfileAsync(Guid userId, CancellationToken ct = default);
    Task<ProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto, CancellationToken ct = default);
    Task<ApiResponse> ChangePasswordAsync(Guid userId, ChangePasswordDto dto, CancellationToken ct = default);
}
