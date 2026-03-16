# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["src/Riada.Domain/Riada.Domain.csproj", "src/Riada.Domain/"]
COPY ["src/Riada.Application/Riada.Application.csproj", "src/Riada.Application/"]
COPY ["src/Riada.Infrastructure/Riada.Infrastructure.csproj", "src/Riada.Infrastructure/"]
COPY ["src/Riada.API/Riada.API.csproj", "src/Riada.API/"]
COPY ["Riada.sln", "./"]

RUN dotnet restore "Riada.sln"

COPY . .
RUN dotnet publish "src/Riada.API/Riada.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

EXPOSE 5275 5174
ENV ASPNETCORE_URLS=https://+:5275;http://+:5174
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish .

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:5174/health || exit 1

ENTRYPOINT ["dotnet", "Riada.API.dll"]
