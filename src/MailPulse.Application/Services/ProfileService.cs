using System;
using System.Threading;
using System.Threading.Tasks;
using MailPulse.Application.DTOs;
using MailPulse.Application.DTOs.Profile;
using MailPulse.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace MailPulse.Application.Services;

public class ProfileService : IProfileService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;

    public ProfileService(IUnitOfWork unitOfWork, IPasswordHasher passwordHasher)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
    }

    public async Task<ProfileDto> GetProfileAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId, ct);
        if (user == null) throw new KeyNotFoundException("User not found.");
        return new ProfileDto(user.FirstName, user.LastName, user.Email);
    }

    public async Task<ProfileDto> UpdateProfileAsync(Guid userId, UpdateProfileDto dto, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId, ct);
        if (user == null) throw new KeyNotFoundException("User not found.");

        if (user.Email != dto.Email)
        {
            var existing = await _unitOfWork.Users.Query().FirstOrDefaultAsync(u => u.Email == dto.Email && u.Id != userId, ct);
            if (existing != null) throw new InvalidOperationException("Email is already in use.");
        }

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.Email = dto.Email;
        await _unitOfWork.Users.UpdateAsync(user, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        return new ProfileDto(user.FirstName, user.LastName, user.Email);
    }

    public async Task<ApiResponse> ChangePasswordAsync(Guid userId, ChangePasswordDto dto, CancellationToken ct = default)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(userId, ct);
        if (user == null) throw new KeyNotFoundException("User not found.");

        if (!_passwordHasher.VerifyPassword(dto.CurrentPassword, user.PasswordHash, user.PasswordSalt))
            return new ApiResponse { Success = false, Message = "Current password is incorrect." };

        var (hash, salt) = _passwordHasher.HashPassword(dto.NewPassword);
        user.PasswordHash = hash;
        user.PasswordSalt = salt;
        await _unitOfWork.Users.UpdateAsync(user, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return new ApiResponse { Success = true, Message = "Password changed successfully." };
    }
}
