# ============================================================================
# RIADA CODEBASE - USECASE PATTERN ANALYSIS & REPLICATION GUIDE
# ============================================================================

## QUICK SUMMARY OF THE EXACT PATTERN

The Riada codebase uses a **Clean Architecture with UseCase pattern**, where:
- **UseCases** are plain classes that contain business logic
- **DTOs** are C# records (immutable, concise)
- **Repositories** use Generic Repository + Specific Repository pattern
- **Validators** use FluentValidation
- **DI Container** uses Microsoft.Extensions.DependencyInjection
- **Exception Handling** uses custom domain exceptions with error codes

---

## 1. USECASE IMPLEMENTATION PATTERN

### Structure:
- Simple class in Application/UseCases/{Domain}/{NameUseCase.cs}
- Constructor injection of dependencies
- Single public method: ExecuteAsync(Request, CancellationToken)
- Returns DTO response

### Key Conventions:
- No async suffixes on methods (just ExecuteAsync)
- Always accepts CancellationToken ct = default
- Thin presentation layer (repository calls + mapping)
- NO validation in UseCase (FluentValidation handles it)

---

