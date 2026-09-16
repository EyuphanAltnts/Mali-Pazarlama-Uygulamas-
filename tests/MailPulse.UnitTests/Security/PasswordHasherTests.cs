using FluentAssertions;
using MailPulse.Application.Interfaces;
using MailPulse.Infrastructure.Security;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace MailPulse.UnitTests.Security;

public class PasswordHasherTests
{
    private readonly IPasswordHasher _hasher;

    public PasswordHasherTests()
    {
        _hasher = new PasswordHasher();
    }

    [Fact]
    public void HashPassword_ShouldReturnValidHashAndSalt()
    {
        // Arrange
        var password = "SecurePassword123!";

        // Act
        var (hash, salt) = _hasher.HashPassword(password);

        // Assert
        hash.Should().NotBeNullOrWhiteSpace();
        salt.Should().NotBeNullOrWhiteSpace();
        hash.Should().NotBe(password);
    }

    [Fact]
    public void VerifyPassword_WithCorrectPassword_ShouldReturnTrue()
    {
        // Arrange
        var password = "MySecretPassword2026!";
        var (hash, salt) = _hasher.HashPassword(password);

        // Act
        var isValid = _hasher.VerifyPassword(password, hash, salt);

        // Assert
        isValid.Should().BeTrue();
    }

    [Fact]
    public void VerifyPassword_WithIncorrectPassword_ShouldReturnFalse()
    {
        // Arrange
        var password = "MySecretPassword2026!";
        var (hash, salt) = _hasher.HashPassword(password);

        // Act
        var isValid = _hasher.VerifyPassword("WrongPassword!", hash, salt);

        // Assert
        isValid.Should().BeFalse();
    }
}

