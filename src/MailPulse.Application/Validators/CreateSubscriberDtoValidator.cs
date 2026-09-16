using FluentValidation;
using MailPulse.Application.DTOs.Subscribers;

namespace MailPulse.Application.Validators;

public class CreateSubscriberDtoValidator : AbstractValidator<CreateSubscriberDto>
{
    public CreateSubscriberDtoValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
    }
}
