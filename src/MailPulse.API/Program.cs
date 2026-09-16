using System.Text;
using System.Threading.RateLimiting;
using FluentValidation;
using MailPulse.API.Middleware;
using MailPulse.Application.Interfaces;
using MailPulse.Application.Services;
using MailPulse.Infrastructure;
using MailPulse.Persistence.Data;
using MailPulse.Persistence.Repositories;
using MailPulse.Persistence.Seed;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;
using Serilog.Events;
using MailPulse.API;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting MailPulse API");
    builder.Host.UseSerilog((context, services, configuration) => configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext());

    var config = builder.Configuration;

    // Database (Supports SQLite for instant zero-dependency local run, or PostgreSQL)
    var connectionString = config.GetConnectionString("DefaultConnection");
    builder.Services.AddDbContext<MailPulseDbContext>(options =>
    {
        if (connectionString != null && connectionString.Contains(".db"))
        {
            options.UseSqlite(connectionString);
        }
        else
        {
            options.UseNpgsql(connectionString);
        }
    });

    // Authentication
    builder.Services.AddAuthentication(options => {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    }).AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuer = true, 
            ValidateAudience = true,
            ValidateLifetime = true, 
            ValidateIssuerSigningKey = true,
            ValidIssuer = config["Jwt:Issuer"],
            ValidAudience = config["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(config["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key not configured"))),
            ClockSkew = TimeSpan.Zero
        };
    });
    builder.Services.AddAuthorization();

    // Controllers & Swagger
    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo { Title = "MailPulse API", Version = "v1" });
        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "JWT Authorization header using Bearer scheme. Example: \"Bearer {token}\"",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT"
        });
        c.AddSecurityRequirement(new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                },
                Array.Empty<string>()
            }
        });
    });

    // Data Access
    builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
    builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

    // Application Services
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<ISubscriberService, SubscriberService>();
    builder.Services.AddScoped<ITemplateService, TemplateService>();
    builder.Services.AddScoped<ICampaignService, CampaignService>();
    builder.Services.AddScoped<IDashboardService, DashboardService>();
    builder.Services.AddScoped<IReportService, ReportService>();
    builder.Services.AddScoped<IUserService, UserService>();
    builder.Services.AddScoped<IProfileService, ProfileService>();
    builder.Services.AddScoped<ISmtpSettingsService, SmtpSettingsService>();

    // FluentValidation
    builder.Services.AddValidatorsFromAssembly(typeof(IAuthService).Assembly);

    // Infrastructure
    builder.Services.AddInfrastructure();

    // CORS
    builder.Services.AddCors(options => {
        options.AddPolicy("AllowReactApp", policy => {
            policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        });
    });

    // Rate Limiting
    builder.Services.AddRateLimiter(options => {
        options.AddFixedWindowLimiter("Basic", opt => { 
            opt.Window = TimeSpan.FromMinutes(1); 
            opt.PermitLimit = 100;
            opt.QueueLimit = 2;
            opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        });
    });

    var app = builder.Build();

    app.UseMiddleware<ExceptionHandlingMiddleware>();
    app.UseSerilogRequestLogging();
    app.UseCors("AllowReactApp");

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "MailPulse API v1"));
    }

    app.UseAuthentication();
    app.UseAuthorization();
    app.UseRateLimiter();
    app.MapControllers();

    // Auto-migrate and seed database
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<MailPulseDbContext>();
        try
        {
            if (connectionString != null && connectionString.Contains(".db"))
            {
                await dbContext.Database.EnsureCreatedAsync();
                await SqliteSchemaCompatibility.ApplyAsync(dbContext);
            }
            else
            {
                await dbContext.Database.MigrateAsync();
            }
            await DataSeeder.SeedAsync(dbContext);
            Log.Information("Database prepared and seeded successfully.");
        }
        catch (Exception ex)
        {
            Log.Error(ex, "An error occurred while migrating/seeding the database.");
        }
    }

    await app.RunAsync();
}
catch (Exception ex) when (ex is not HostAbortedException)
{
    Log.Fatal(ex, "Host terminated unexpectedly");
}
finally
{
    await Log.CloseAndFlushAsync();
}
