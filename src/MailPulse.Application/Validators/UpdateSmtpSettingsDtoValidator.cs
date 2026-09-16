using FluentValidation;
using MailPulse.Application.DTOs.Settings;

namespace MailPulse.Application.Validators;

public class UpdateSmtpSettingsDtoValidator : AbstractValidator<UpdateSmtpSettingsDto>
{
    public UpdateSmtpSettingsDtoValidator()
    {
        RuleFor(x => x.Host).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Port).InclusiveBetween(1, 65535);
        RuleFor(x => x.Username).NotEmpty().MaximumLength(256);
        RuleFor(x => x.SenderEmail).NotEmpty().EmailAddress();
        RuleFor(x => x.SenderName).MaximumLength(256);
    }
}
