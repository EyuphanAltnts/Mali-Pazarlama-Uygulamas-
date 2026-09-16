using FluentValidation;
using MailPulse.Application.DTOs.Templates;

namespace MailPulse.Application.Validators;

public class CreateTemplateDtoValidator : AbstractValidator<CreateTemplateDto>
{
    public CreateTemplateDtoValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(256);
        RuleFor(x => x.HtmlContent).NotEmpty();
    }
}
