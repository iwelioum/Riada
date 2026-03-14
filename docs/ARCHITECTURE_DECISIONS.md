# Architecture Decisions

## Clean Architecture
**Decision:** Separate Domain, Application, Infrastructure, API.  
**Reason:** Keeps business rules isolated from frameworks; easier testing and future replacements (DB, transport).

## Use Cases (Interactor Pattern)
**Decision:** One class per use case (e.g., `CreateMemberUseCase`).  
**Reason:** Explicit business flows, straightforward testing/mocking, aligns with course requirements.

## Dependency Injection
**Decision:** Constructor injection across layers; centralized registrations in `DependencyInjection.cs`.  
**Reason:** Testability and clear lifetime management.

## Event-Driven Hooks
**Decision:** Introduced `IMemberEventDispatcher` + `MemberLifecycleSubscriber` to react to member creation.  
**Reason:** Demonstrate event programming; enables future actions (welcome email, billing hooks) without tight coupling.

## Validation with FluentValidation
**Decision:** Validators per DTO (e.g., `CreateMemberValidator`).  
**Reason:** Centralize input rules, reusable in controllers and tests.

## Testing Strategy
**Decision:** xUnit + Moq + FluentAssertions for unit tests; health checks + Swagger for runtime validation.  
**Reason:** Lightweight, idiomatic for .NET; fast feedback.

## Configuration
**Decision:** Environment-driven config (appsettings), centralized script config (`scripts/Config/config.json`).  
**Reason:** Clear separation of code vs. environment; simplifies automation.

## Automation
**Decision:** Cross-platform launch scripts (PowerShell/Bash/Batch) plus Docker assets.  
**Reason:** Reduce onboarding friction, consistent local workflows.
