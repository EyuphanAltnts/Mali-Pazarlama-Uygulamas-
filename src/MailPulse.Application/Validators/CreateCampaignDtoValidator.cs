using FluentValidation;
using MailPulse.Application.DTOs.Campaigns;

namespace MailPulse.Application.Validators;

public class CreateCampaignDtoValidator : AbstractValidator<CreateCampaignDto>
{
    public CreateCampaignDtoValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(256);
        RuleFor(x => x.TemplateId).NotEmpty();
        RuleFor(x => x.SubscriberIds).NotEmpty();
    }
}
