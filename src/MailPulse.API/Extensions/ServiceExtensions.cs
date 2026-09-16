using Microsoft.Extensions.DependencyInjection;

namespace MailPulse.API.Extensions;

public static class ServiceExtensions
{
    // Clean DI registration methods can be placed here if Program.cs gets too large.
    // For now, most DI is handled in Program.cs as requested.
    
    public static IServiceCollection AddCustomApiServices(this IServiceCollection services)
    {
        // Add specific API-only services here if needed
        return services;
    }
}
