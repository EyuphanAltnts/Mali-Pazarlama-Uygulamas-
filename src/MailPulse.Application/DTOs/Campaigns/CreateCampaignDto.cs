using System;
using System.Collections.Generic;

namespace MailPulse.Application.DTOs.Campaigns;

public record CreateCampaignDto(string Name, Guid TemplateId, List<Guid> SubscriberIds);
