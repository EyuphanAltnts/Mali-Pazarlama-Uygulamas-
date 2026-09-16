using System;
using System.Text;
using FluentAssertions;
using MailPulse.Application.Interfaces;
using MailPulse.Domain.Entities;
using MailPulse.Infrastructure.Security;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace MailPulse.UnitTests.Security;

public class TokenServiceTests
{
    private readonly ITokenService _tokenService;

    public TokenServiceTests()
    {
        var mockConfig = new Mock<IConfiguration>();
        mockConfig.Setup(c => c["Jwt:Key"]).Returns("SuperSecretJwtKeyForTestingOnlyMustBe32CharsLong!");
        mockConfig.Setup(c => c["Jwt:Issuer"]).Returns("MailPulseTest");
        mockConfig.Setup(c => c["Jwt:Audience"]).Returns("MailPulseClient");

        _tokenService = new TokenService(mockConfig.Object);
    }

    [Fact]
    public void GenerateAccessToken_ShouldReturnValidJwtToken()
    {
        // Arrange
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = "test@mailpulse.com",
            FirstName = "Test",
            LastName = "User",
            PasswordHash = "dummyHash",
            PasswordSalt = "dummySalt"
        };

        // Act
        var token = _tokenService.GenerateAccessToken(user);

        // Assert
        token.Should().NotBeNullOrWhiteSpace();
        token.Split('.').Should().HaveCount(3, "a valid JWT contains 3 segments separated by dots");
    }

    [Fact]
    public void GenerateRefreshToken_ShouldReturnUniqueRandomStrings()
    {
        // Act
        var token1 = _tokenService.GenerateRefreshToken();
        var token2 = _tokenService.GenerateRefreshToken();

        // Assert
        token1.Should().NotBeNullOrWhiteSpace();
        token2.Should().NotBeNullOrWhiteSpace();
        token1.Should().NotBe(token2);
    }

    [Fact]
    public void GeneratePasswordResetToken_ShouldReturnUrlSafeToken()
    {
        // Act
        var resetToken = _tokenService.GeneratePasswordResetToken();

        // Assert
        resetToken.Should().NotBeNullOrWhiteSpace();
        resetToken.Should().NotContain("+");
        resetToken.Should().NotContain("/");
        resetToken.Should().NotContain("=");
    }
}

