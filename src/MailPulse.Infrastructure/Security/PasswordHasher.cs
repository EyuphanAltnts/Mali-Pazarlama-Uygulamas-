using System;
using System.Security.Cryptography;
using MailPulse.Application.Interfaces;

namespace MailPulse.Infrastructure.Security;

/// <summary>
/// Implements password hashing and verification using PBKDF2.
/// </summary>
public class PasswordHasher : IPasswordHasher
{
    private const int SaltSize = 16;
    private const int KeySize = 64;
    private const int Iterations = 210000;
    private static readonly HashAlgorithmName _hashAlgorithmName = HashAlgorithmName.SHA512;

    public (string hash, string salt) HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, _hashAlgorithmName, KeySize);

        return (Convert.ToBase64String(hash), Convert.ToBase64String(salt));
    }

    public bool VerifyPassword(string password, string hash, string salt)
    {
        var hashBytes = Convert.FromBase64String(hash);
        var saltBytes = Convert.FromBase64String(salt);

        var computedHash = Rfc2898DeriveBytes.Pbkdf2(password, saltBytes, Iterations, _hashAlgorithmName, KeySize);

        return CryptographicOperations.FixedTimeEquals(hashBytes, computedHash);
    }
}
