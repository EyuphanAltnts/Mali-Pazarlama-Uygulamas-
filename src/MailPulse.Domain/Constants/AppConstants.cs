namespace MailPulse.Domain.Constants
{
    /// <summary>
    /// Contains application-wide constant values.
    /// </summary>
    public static class AppConstants
    {
        public const int PasswordMinLength = 8;
        public const int PasswordResetTokenExpirationHours = 24;
        public const int SmtpTimeoutSeconds = 30;
        public const int DefaultPageSize = 10;
        public const int MaxPageSize = 100;
        public const int JwtAccessTokenExpirationMinutes = 15;
        public const int JwtRefreshTokenExpirationDays = 7;
    }
}
