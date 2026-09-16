FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy solution and project definitions
COPY MailPulse.slnx ./
COPY src/MailPulse.Domain/*.csproj ./src/MailPulse.Domain/
COPY src/MailPulse.Application/*.csproj ./src/MailPulse.Application/
COPY src/MailPulse.Infrastructure/*.csproj ./src/MailPulse.Infrastructure/
COPY src/MailPulse.Persistence/*.csproj ./src/MailPulse.Persistence/
COPY src/MailPulse.API/*.csproj ./src/MailPulse.API/
COPY tests/MailPulse.UnitTests/*.csproj ./tests/MailPulse.UnitTests/

# Restore dependencies
RUN dotnet restore src/MailPulse.API/MailPulse.API.csproj

# Copy source code
COPY . .

# Build and publish
WORKDIR /app/src/MailPulse.API
RUN dotnet publish -c Release -o /out

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /out ./

EXPOSE 8080
ENTRYPOINT ["dotnet", "MailPulse.API.dll"]

