#!/usr/bin/env bash
# ============================================================================
# Riada - Launch Script (Bash)
# ============================================================================
# Description: Main automation entry point for Linux/macOS.
# Usage: ./launch.sh [run|build-only|test-only|release|clean|health|docker|frontend|frontend-build|fullstack|help]
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
API_CSPROJ="$API_PROJECT/Riada.API.csproj"
FRONTEND_PROJECT="$PROJECT_ROOT/frontend"
SOLUTION="$PROJECT_ROOT/Riada.sln"
ALTERNATE_SOLUTION="$PROJECT_ROOT/src/Riada.sln"
UNIT_TESTS="$PROJECT_ROOT/tests/Riada.UnitTests/Riada.UnitTests.csproj"
HEALTH_URL="https://localhost:5275/health"
SWAGGER_URL="https://localhost:5275/swagger"
API_URL="https://localhost:5275"
FRONTEND_URL="http://localhost:5173"
RESTORE_TARGET=""

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
  run          Restore, build API, and launch the API (default)
  build-only   Restore and build API only
  test-only    Restore, build, and run unit tests
  release      Restore and build API in Release mode
  frontend     Install deps if needed and launch frontend dev server
  frontend-build Install deps if needed and build frontend
  fullstack    Build backend API, then launch backend + frontend
  clean        Remove bin/ and obj/ folders
  health       Check API health endpoint
  docker       Start services with Docker Compose
  help         Show this help
EOF
}

resolve_restore_target() {
  local candidates=("$SOLUTION" "$ALTERNATE_SOLUTION")
  local candidate

  for candidate in "${candidates[@]}"; do
    if [[ -f "$candidate" ]]; then
      echo "$candidate"
      return 0
    fi
  done

  if [[ -f "$API_CSPROJ" ]]; then
    echo "$API_CSPROJ"
    return 0
  fi

  return 1
}

validate_backend() {
  header "VALIDATION"
  if ! command -v dotnet >/dev/null 2>&1; then
    log_error "dotnet is not installed or not available in PATH."
    exit 1
  fi
  log_success "dotnet found: $(dotnet --version)"

  RESTORE_TARGET="$(resolve_restore_target || true)"
  if [[ -z "$RESTORE_TARGET" ]]; then
    log_error "No restore target found. Checked: $SOLUTION, $ALTERNATE_SOLUTION, $API_CSPROJ"
    exit 1
  fi
  if [[ "$RESTORE_TARGET" == *.sln ]]; then
    log_success "Restore target found (solution): $RESTORE_TARGET"
  else
    log_warn "Solution file not found. Falling back to project restore: $RESTORE_TARGET"
  fi

  if [[ ! -d "$API_PROJECT" ]]; then
    log_error "API project directory not found: $API_PROJECT"
    exit 1
  fi
  log_success "API project directory found"

  if [[ ! -f "$API_CSPROJ" ]]; then
    log_error "API project file not found: $API_CSPROJ"
    exit 1
  fi
  log_success "API project file found"
}

validate_frontend() {
  header "FRONTEND VALIDATION"
  if [[ ! -d "$FRONTEND_PROJECT" ]]; then
    log_error "Frontend directory not found: $FRONTEND_PROJECT"
    exit 1
  fi
  if [[ ! -f "$FRONTEND_PROJECT/package.json" ]]; then
    log_error "Frontend package.json not found: $FRONTEND_PROJECT/package.json"
    exit 1
  fi
  if ! command -v npm >/dev/null 2>&1; then
    log_error "npm is not installed or not available in PATH."
    exit 1
  fi

  log_success "Frontend project found"
  log_success "npm found: $(npm --version)"
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
  if [[ -z "$RESTORE_TARGET" ]]; then
    RESTORE_TARGET="$(resolve_restore_target || true)"
  fi
  if [[ -z "$RESTORE_TARGET" ]]; then
    log_error "No restore target found. Checked: $SOLUTION, $ALTERNATE_SOLUTION, $API_CSPROJ"
    exit 1
  fi

  log_info "Running dotnet restore $RESTORE_TARGET..."
  dotnet restore "$RESTORE_TARGET"
  log_success "Restore successful"
}

build() {
  local configuration="${1:-Debug}"
  header "BUILD ($configuration)"
  log_info "Running dotnet build $API_CSPROJ --configuration $configuration..."
  dotnet build "$API_CSPROJ" --configuration "$configuration"
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

frontend_install_if_needed() {
  if [[ -d "$FRONTEND_PROJECT/node_modules" ]]; then
    return
  fi

  header "FRONTEND INSTALL"
  log_info "node_modules not found. Running npm install..."
  (
    cd "$FRONTEND_PROJECT"
    npm install
  )
  log_success "Frontend dependencies installed"
}

run_frontend_dev() {
  validate_frontend
  frontend_install_if_needed
  header "RUN FRONTEND"
  echo "Frontend URL: $FRONTEND_URL"
  echo "Press Ctrl+C to stop the frontend server."
  echo ""
  cd "$FRONTEND_PROJECT"
  npm run dev
}

build_frontend() {
  validate_frontend
  frontend_install_if_needed
  header "FRONTEND BUILD"
  (
    cd "$FRONTEND_PROJECT"
    npm run build
  )
  log_success "Frontend build successful"
}

run_fullstack() {
  validate_backend
  validate_frontend
  restore
  clean
  build "Debug"
  frontend_install_if_needed

  header "FULLSTACK"
  log_info "Starting frontend in background..."
  (
    cd "$FRONTEND_PROJECT"
    npm run dev
  ) &
  FRONTEND_PID=$!
  log_success "Frontend started (PID: $FRONTEND_PID) at $FRONTEND_URL"
  log_info "Starting API in foreground..."

  cleanup() {
    if kill -0 "$FRONTEND_PID" >/dev/null 2>&1; then
      log_info "Stopping frontend process $FRONTEND_PID..."
      kill "$FRONTEND_PID" >/dev/null 2>&1 || true
    fi
  }

  trap cleanup EXIT INT TERM
  run_api
  cleanup
  trap - EXIT INT TERM
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
  local env_file="$SCRIPT_DIR/../../.env"

  if [[ ! -f "$compose_dir/docker-compose.yml" ]]; then
    log_error "docker-compose.yml not found in $compose_dir"
    exit 1
  fi

  if [[ ! -f "$env_file" ]]; then
    log_error ".env file not found: $env_file"
    exit 1
  fi

  cd "$compose_dir"
  if docker compose version >/dev/null 2>&1; then
    docker compose --env-file "$env_file" --profile docker up --build
  elif command -v docker-compose >/dev/null 2>&1; then
    docker-compose --env-file "$env_file" --profile docker up --build
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
    validate_backend
    clean
    ;;
  build-only)
    validate_backend
    restore
    clean
    build "Debug"
    ;;
  test-only)
    validate_backend
    restore
    clean
    build "Debug"
    test_unit
    ;;
  release)
    validate_backend
    restore
    clean
    build "Release"
    ;;
  frontend)
    run_frontend_dev
    ;;
  frontend-build)
    build_frontend
    ;;
  fullstack)
    run_fullstack
    ;;
  health)
    health
    ;;
  docker)
    docker_up
    ;;
  run|"")
    validate_backend
    restore
    clean
    build "Debug"
    run_api
    ;;
  *)
    log_error "Unknown command: $COMMAND"
    show_help
    exit 1
    ;;
esac
