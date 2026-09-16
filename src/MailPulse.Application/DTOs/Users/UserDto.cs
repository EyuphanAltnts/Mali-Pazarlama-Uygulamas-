using System;

namespace MailPulse.Application.DTOs.Users;

public record UserDto(Guid Id, string FirstName, string LastName, string Email, bool IsActive, DateTime CreatedAt);
