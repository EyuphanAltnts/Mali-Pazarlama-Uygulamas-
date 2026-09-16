using System;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using MailPulse.Application.DTOs;
using MailPulse.Application.DTOs.Auth;
using MailPulse.Application.Interfaces;
using MailPulse.Domain.Entities;
using MailPulse.Domain.Constants;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace MailPulse.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly IEmailSender _emailSender;
    private readonly IConfiguration _configuration;

    public AuthService(IUnitOfWork unitOfWork, IPasswordHasher passwordHasher, ITokenService tokenService, IEmailSender emailSender, IConfiguration configuration)
    {
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _emailSender = emailSender;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        var existingUser = await _unitOfWork.Users.Query()
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (existingUser != null)
            throw new InvalidOperationException("A user with this email already exists.");

        var (hash, salt) = _passwordHasher.HashPassword(dto.Password);

        var user = new User
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            PasswordHash = hash,
            PasswordSalt = salt,
            IsActive = true
        };

        await _unitOfWork.Users.AddAsync(user);
        await _unitOfWork.SaveChangesAsync();

        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = await IssueRefreshTokenAsync(user);
        await _unitOfWork.SaveChangesAsync();
        var fullName = $"{user.FirstName} {user.LastName}";
        var expiresAt = DateTime.UtcNow.AddMinutes(AppConstants.JwtAccessTokenExpirationMinutes);

        return new AuthResponseDto(accessToken, refreshToken, user.Email, fullName, user.Role, expiresAt);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        var user = await _unitOfWork.Users.Query()
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null)
            throw new InvalidOperationException("Invalid email or password.");

        if (!user.IsActive)
            throw new InvalidOperationException("This account has been deactivated.");

        if (!_passwordHasher.VerifyPassword(dto.Password, user.PasswordHash, user.PasswordSalt))
            throw new InvalidOperationException("Invalid email or password.");

        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = await IssueRefreshTokenAsync(user);
        await _unitOfWork.SaveChangesAsync();
        var fullName = $"{user.FirstName} {user.LastName}";
        var expiresAt = DateTime.UtcNow.AddMinutes(AppConstants.JwtAccessTokenExpirationMinutes);

        return new AuthResponseDto(accessToken, refreshToken, user.Email, fullName, user.Role, expiresAt);
    }

    public async Task<AuthResponseDto> RefreshAsync(RefreshTokenDto dto)
    {
        var tokenHash = HashRefreshToken(dto.RefreshToken);
        var storedToken = await _unitOfWork.RefreshTokens.Query()
            .Include(token => token.User)
            .FirstOrDefaultAsync(token => token.TokenHash == tokenHash && token.RevokedAt == null && token.ExpiresAt > DateTime.UtcNow);

        if (storedToken == null || !storedToken.User.IsActive)
            throw new UnauthorizedAccessException("Invalid or expired refresh token.");

        storedToken.RevokedAt = DateTime.UtcNow;
        await _unitOfWork.RefreshTokens.UpdateAsync(storedToken);

        var accessToken = _tokenService.GenerateAccessToken(storedToken.User);
        var refreshToken = await IssueRefreshTokenAsync(storedToken.User);
        await _unitOfWork.SaveChangesAsync();

        return new AuthResponseDto(
            accessToken,
            refreshToken,
            storedToken.User.Email,
            $"{storedToken.User.FirstName} {storedToken.User.LastName}",
            storedToken.User.Role,
            DateTime.UtcNow.AddMinutes(AppConstants.JwtAccessTokenExpirationMinutes));
    }

    public async Task<ApiResponse> ForgotPasswordAsync(ForgotPasswordDto dto)
    {
        var user = await _unitOfWork.Users.Query()
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user != null)
        {
            var tokenString = _tokenService.GeneratePasswordResetToken();
            var resetToken = new PasswordResetToken
            {
                UserId = user.Id,
                Token = tokenString,
                IsUsed = false,
                ExpiresAt = DateTime.UtcNow.AddHours(AppConstants.PasswordResetTokenExpirationHours)
            };

            await _unitOfWork.PasswordResetTokens.AddAsync(resetToken);
            await _unitOfWork.SaveChangesAsync();

            var resetBaseUrl = _configuration["ClientApp:ResetPasswordUrl"] ?? "http://localhost:5173/reset-password";
            var resetUrl = $"{resetBaseUrl}?token={Uri.EscapeDataString(tokenString)}";
            var body = $"<p>Use the following link to reset your MailPulse password:</p><p><a href=\"{resetUrl}\">Reset password</a></p>";
            await _emailSender.SendEmailAsync(user.Email, "MailPulse password reset", body);
        }

        return new ApiResponse { Success = true, Message = "If an account exists with that email, a reset link has been sent." };
    }

    public async Task<ApiResponse> ResetPasswordAsync(ResetPasswordDto dto)
    {
        var resetToken = await _unitOfWork.PasswordResetTokens.Query()
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.Token == dto.Token && !rt.IsUsed && rt.ExpiresAt > DateTime.UtcNow);

        if (resetToken == null)
            return new ApiResponse { Success = false, Message = "Invalid or expired reset token." };

        var (hash, salt) = _passwordHasher.HashPassword(dto.NewPassword);
        resetToken.User.PasswordHash = hash;
        resetToken.User.PasswordSalt = salt;
        resetToken.User.UpdatedAt = DateTime.UtcNow;
        resetToken.IsUsed = true;

        await _unitOfWork.Users.UpdateAsync(resetToken.User);
        await _unitOfWork.PasswordResetTokens.UpdateAsync(resetToken);
        await _unitOfWork.SaveChangesAsync();

        return new ApiResponse { Success = true, Message = "Password has been reset successfully." };
    }

    private async Task<string> IssueRefreshTokenAsync(User user)
    {
        var rawToken = _tokenService.GenerateRefreshToken();
        await _unitOfWork.RefreshTokens.AddAsync(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = HashRefreshToken(rawToken),
            ExpiresAt = DateTime.UtcNow.AddDays(AppConstants.JwtRefreshTokenExpirationDays)
        });
        return rawToken;
    }

    private static string HashRefreshToken(string token)
    {
        return Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
    }
}
