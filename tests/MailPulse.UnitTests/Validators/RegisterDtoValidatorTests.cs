using FluentAssertions;
using MailPulse.Application.DTOs.Auth;
using MailPulse.Application.Validators;
using Xunit;

namespace MailPulse.UnitTests.Validators;

public class RegisterDtoValidatorTests
{
    private readonly RegisterDtoValidator _validator = new();

    [Fact]
    public void Validate_WithValidData_ShouldBeValid()
    {
        // Arrange
        var dto = new RegisterDto("John", "Doe", "john.doe@example.com", "P@ssword123", "P@ssword123");

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("", "Doe", "valid@email.com", "Password123!", "Password123!")]
    [InlineData("John", "", "valid@email.com", "Password123!", "Password123!")]
    [InlineData("John", "Doe", "invalid-email", "Password123!", "Password123!")]
    [InlineData("John", "Doe", "valid@email.com", "short", "short")]
    [InlineData("John", "Doe", "valid@email.com", "Password123!", "MismatchPassword!")]
    public void Validate_WithInvalidData_ShouldFail(string firstName, string lastName, string email, string password, string confirmPassword)
    {
        // Arrange
        var dto = new RegisterDto(firstName, lastName, email, password, confirmPassword);

        // Act
        var result = _validator.Validate(dto);

        // Assert
        result.IsValid.Should().BeFalse();
    }
}

