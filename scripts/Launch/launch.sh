#!/usr/bin/env bash
# ============================================================================
# Riada - Launch Script (Bash)
# ============================================================================
# Description: Main automation entry point for Linux/macOS.
# Usage: ./launch.sh [run|build-only|test-only|release|clean|health|docker|help]
# ============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
API_PROJECT="$PROJECT_ROOT/src/Riada.API"
SOLUTION="$PROJECT_ROOT/Riada.sln"
UNIT_TESTS="$PROJECT_ROOT/tests/Riada.UnitTests/Riada.UnitTests.csproj"
HEALTH_URL="https://localhost:5275/health"
SWAGGER_URL="https://localhost:5275/swagger"
API_URL="https://localhost:5275"

COMMAND="${1:-run}"

log_info() { echo -e "${CYAN}[INFO ]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK   ]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN ]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

header() {
  echo ""
  echo "=============================================================================="
  echo "$1"
  echo "=============================================================================="
  echo ""
}

show_help() {
  cat <<EOF
RIADA API - Launch Script

USAGE:
  ./launch.sh [command]

COMMANDS:
  run          Restore, build, test, and launch the API (default)
  build-only   Restore and build only
  test-only    Restore, build, and run unit tests
  release      Restore and build in Release mode
  clean        Remove bin/ and obj/ folders
  health       Check API health endpoint
  docker       Start services with Docker Compose
  help         Show this help
EOF
}

validate() {
  header "VALIDATION"
  if ! command -v dotnet >/dev/null 2>&1; then
    log_error "dotnet is not installed or not available in PATH."
    exit 1
  fi
  log_success "dotnet found: $(dotnet --version)"

  if [[ ! -f "$SOLUTION" ]]; then
    log_error "Solution file not found: $SOLUTION"
    exit 1
  fi
  log_success "Solution file found"

  if [[ ! -d "$API_PROJECT" ]]; then
    log_error "API project directory not found: $API_PROJECT"
    exit 1
  fi
  log_success "API project directory found"
}

clean() {
  header "CLEAN"
  log_info "Removing bin and obj directories..."
  find "$PROJECT_ROOT" -type d \( -name bin -o -name obj \) -prune -print | while read -r dir; do
    rm -rf "$dir"
  done
  log_success "Clean completed"
}

restore() {
  header "RESTORE"
  log_info "Running dotnet restore..."
  dotnet restore "$SOLUTION"
  log_success "Restore successful"
}

build() {
  local configuration="${1:-Debug}"
  header "BUILD ($configuration)"
  log_info "Running dotnet build --configuration $configuration..."
  dotnet build "$SOLUTION" --configuration "$configuration"
  log_success "Build successful"
}

test_unit() {
  header "TEST"
  if [[ ! -f "$UNIT_TESTS" ]]; then
    log_warn "Unit test project not found: $UNIT_TESTS"
    return
  fi

  log_info "Running dotnet test..."
  dotnet test "$UNIT_TESTS" --verbosity minimal
  log_success "All unit tests passed"
}

run_api() {
  header "RUN API"
  echo "Swagger: $SWAGGER_URL"
  echo "API URL: $API_URL"
  echo "Health : $HEALTH_URL"
  echo "Press Ctrl+C to stop the API."
  echo ""

  cd "$API_PROJECT"
  dotnet run
}

health() {
  header "HEALTH CHECK"
  if command -v curl >/dev/null 2>&1; then
    curl -s -k "$HEALTH_URL" >/dev/null
    log_success "Health endpoint is reachable: $HEALTH_URL"
  else
    log_error "curl is not installed."
    exit 1
  fi
}

docker_up() {
  header "DOCKER"
  local compose_dir="$SCRIPT_DIR/../Docker"

  if [[ ! -f "$compose_dir/docker-compose.yml" ]]; then
    log_error "docker-compose.yml not found in $compose_dir"
    exit 1
  fi

  cd "$compose_dir"
  if docker compose version >/dev/null 2>&1; then
    docker compose up --build
  elif command -v docker-compose >/dev/null 2>&1; then
    docker-compose up --build
  else
    log_error "Neither docker compose nor docker-compose is available."
    exit 1
  fi
}

case "$COMMAND" in
  help)
    show_help
    ;;
  clean)
    validate
    clean
    ;;
  build-only)
    validate
    restore
    clean
    build "Debug"
    ;;
  test-only)
    validate
    restore
    clean
    build "Debug"
    test_unit
    ;;
  release)
    validate
    restore
    clean
    build "Release"
    ;;
  health)
    health
    ;;
  docker)
    docker_up
    ;;
  run|"")
    validate
    restore
    clean
    build "Debug"
    test_unit
    run_api
    ;;
  *)
    log_error "Unknown command: $COMMAND"
    show_help
    exit 1
    ;;
esac
