# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY ["src/Riada.Domain/Riada.Domain.csproj", "src/Riada.Domain/"]
COPY ["src/Riada.Application/Riada.Application.csproj", "src/Riada.Application/"]
COPY ["src/Riada.Infrastructure/Riada.Infrastructure.csproj", "src/Riada.Infrastructure/"]
COPY ["src/Riada.API/Riada.API.csproj", "src/Riada.API/"]

RUN dotnet restore "src/Riada.API/Riada.API.csproj" --nologo

COPY . .
RUN dotnet publish "src/Riada.API/Riada.API.csproj" \
  -c $BUILD_CONFIGURATION \
  --no-restore \
  -o /app/publish \
  /p:UseAppHost=false \
  --nologo

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Install curl for health checks
RUN apt-get update \
  && apt-get install -y --no-install-recommends curl \
  && rm -rf /var/lib/apt/lists/* \
  && addgroup --system riada \
  && adduser --system --ingroup riada riada

EXPOSE 5275 5174
ENV ASPNETCORE_URLS=https://+:5275;http://+:5174
ENV ASPNETCORE_ENVIRONMENT=Production
ENV DOTNET_EnableDiagnostics=0

COPY --from=build /app/publish ./
RUN chown -R riada:riada /app

USER riada

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD curl -fsS http://localhost:5174/health || exit 1

ENTRYPOINT ["dotnet", "Riada.API.dll"]
