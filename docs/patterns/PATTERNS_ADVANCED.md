# ⚙️ RIADA Advanced Patterns Guide

## 1. Result<T> Pattern (Railway-Oriented Programming)

### Problem Solved
Traditional try-catch creates nested error handling. Result<T> enables functional error composition.

### Implementation

```csharp
// Domain
public abstract record Result<T>
{
    public sealed record Success(T Value) : Result<T>;
    public sealed record Failure(string Code, string Message) : Result<T>;
}

// Usage
public class CreateMemberUseCase
{
    public async Task<Result<uint>> ExecuteAsync(CreateMemberRequest req)
    {
        return await ValidateRequest(req)
            .Bind(r => CheckEmailUniqueness(r))
            .Bind(r => CreateMember(r))
            .MapAsync(async m => await _repo.AddAsync(m))
            .TapAsync(async _ => await _uow.SaveChangesAsync());
    }

    private Result<CreateMemberRequest> ValidateRequest(CreateMemberRequest req)
    {
        if (string.IsNullOrEmpty(req.FirstName))
            return new Result<CreateMemberRequest>.Failure("VAL_001", "First name required");
        return new Result<CreateMemberRequest>.Success(req);
    }
}

// Caller
var result = await useCase.ExecuteAsync(request);
result.Match(
    onSuccess: id => Ok(new { memberId = id }),
    onFailure: (code, msg) => BadRequest(new { error = code, message = msg })
);
```

**Benefits:**
✅ No try-catch nesting  
✅ Composable error handling  
✅ Type-safe (TValue inferred)  
✅ Testable (no exceptions)

---

## 2. Specification Pattern (Query Composition)

### Problem Solved
Complex WHERE clauses scattered across repository. Specification encapsulates query logic.

### Implementation

```csharp
// Domain
public abstract class Specification<T> where T : class
{
    public Expression<Func<T, bool>>? Criteria { get; protected set; }
    public List<Expression<Func<T, object>>> Includes { get; } = [];
    public Expression<Func<T, object>>? OrderBy { get; protected set; }
    public int Take { get; protected set; }
    public int Skip { get; protected set; }
    public bool IsPagingEnabled { get; protected set; }
}

// Concrete Specification
public class ActiveMembersSpecification : Specification<Member>
{
    public ActiveMembersSpecification(int pageNumber, int pageSize, string? searchTerm = null)
    {
        Criteria = m => m.Status == MemberStatus.Active;

        if (!string.IsNullOrEmpty(searchTerm))
            Criteria = Criteria.AndAlso(m => 
                m.FirstName.Contains(searchTerm) || m.LastName.Contains(searchTerm));

        AddInclude(m => m.Contracts);
        ApplyPaging((pageNumber - 1) * pageSize, pageSize);
        ApplyOrderBy(m => m.RegistrationDate);
    }
}

// Repository Usage
public async Task<IReadOnlyList<Member>> GetAsync(Specification<Member> spec)
{
    var query = _context.Members.AsQueryable();

    query = spec.Criteria != null ? query.Where(spec.Criteria) : query;
    query = spec.Includes.Aggregate(query, (current, include) => current.Include(include));
    query = spec.OrderBy != null ? query.OrderBy(spec.OrderBy) : query;

    if (spec.IsPagingEnabled)
        query = query.Skip(spec.Skip).Take(spec.Take);

    return await query.ToListAsync();
}

// Use Case
var spec = new ActiveMembersSpecification(pageNumber: 1, pageSize: 20, searchTerm: "john");
var members = await _memberRepository.GetAsync(spec);
```

**Benefits:**
✅ Reusable query logic  
✅ Testable (mock-friendly)  
✅ DRY (no duplicate WHERE clauses)  
✅ Type-safe filtering

---

## 3. CQRS (Command Query Responsibility Segregation)

### Problem Solved
Mixing read/write models causes N+1 queries and complex business logic.

### Implementation

```csharp
// Command (Write)
public record CreateMemberCommand(string FirstName, string LastName, string Email) : ICommand<uint>;

public class CreateMemberCommandHandler : ICommandHandler<CreateMemberCommand, uint>
{
    public async Task<Result<uint>> HandleAsync(CreateMemberCommand cmd)
    {
        var member = new Member { FirstName = cmd.FirstName, ... };
        await _repo.AddAsync(member);
        await _uow.SaveChangesAsync();
        return Result<uint>.SuccessResult(member.Id);
    }
}

// Query (Read)
public record GetMemberDetailQuery(uint MemberId) : IQuery<MemberDetailDto>;

public class GetMemberDetailQueryHandler : IQueryHandler<GetMemberDetailQuery, MemberDetailDto>
{
    public async Task<MemberDetailDto?> HandleAsync(GetMemberDetailQuery query)
    {
        // Optimized read-only SQL
        return await _dapperConnection.QuerySingleAsync<MemberDetailDto>(
            "SELECT * FROM v_member_details WHERE MemberId = @id",
            new { id = query.MemberId });
    }
}

// Dispatcher
var cmd = new CreateMemberCommand("John", "Doe", "john@test.com");
var result = await _commandDispatcher.DispatchAsync(cmd);

var query = new GetMemberDetailQuery(1);
var member = await _queryDispatcher.DispatchAsync(query);
```

**Benefits:**
✅ Separation of concerns  
✅ Optimized read queries (views, denormalization)  
✅ Scalable (read replicas, caching)  
✅ Clear intent (command vs query)

---

## 4. Chain of Responsibility (Validation Pipeline)

### Problem Solved
Multiple validations scattered; hard to order and debug.

### Implementation

```csharp
public interface IValidationStep<T>
{
    Task<ValidationResult> ValidateAsync(T request, CancellationToken ct = default);
}

public class EmailUniquenessValidator : IValidationStep<CreateMemberRequest>
{
    private readonly IGenericRepository<Member> _repo;

    public async Task<ValidationResult> ValidateAsync(CreateMemberRequest req, CancellationToken ct)
    {
        var existing = await _repo.FindAsync(m => m.Email == req.Email, ct);
        if (existing.Any())
            return ValidationResult.Failure("EMAIL_DUP", "Email already registered");
        return ValidationResult.Success();
    }
}

public class AgeValidator : IValidationStep<CreateMemberRequest>
{
    public Task<ValidationResult> ValidateAsync(CreateMemberRequest req, CancellationToken ct)
    {
        var age = DateTime.Now.Year - req.DateOfBirth.Year;
        if (age < 16)
            return Task.FromResult(ValidationResult.Failure("AGE_INVALID", "Must be 16+"));
        return Task.FromResult(ValidationResult.Success());
    }
}

// Orchestration
public class CreateMemberValidationPipeline
{
    private readonly List<IValidationStep<CreateMemberRequest>> _steps;

    public CreateMemberValidationPipeline()
    {
        _steps = new()
        {
            new EmailUniquenessValidator(...),
            new AgeValidator(),
            new PhoneFormatValidator(),
        };
    }

    public async Task<ValidationResult> ValidateAsync(CreateMemberRequest req)
    {
        foreach (var step in _steps)
        {
            var result = await step.ValidateAsync(req);
            if (!result.IsSuccess)
                return result;
        }
        return ValidationResult.Success();
    }
}

// Use Case
var validation = await _validationPipeline.ValidateAsync(request);
if (!validation.IsSuccess)
    return Result<uint>.FailureResult(validation.Code, validation.Message);
```

**Benefits:**
✅ Order-independent validation  
✅ Easy to test each validator  
✅ Reusable validators  
✅ Clear failure messages

---

## 5. Event-Driven Architecture (Pub/Sub)

### Problem Solved
Tight coupling between UseCases and side effects (email, audit logging, billing).

### Implementation

```csharp
// Domain Events
public abstract record DomainEvent
{
    public DateTime OccurredAt { get; } = DateTime.UtcNow;
    public Guid EventId { get; } = Guid.NewGuid();
}

public record MemberCreatedEvent(uint MemberId, string Email, DateTime CreatedAt) : DomainEvent;

public record PaymentReceivedEvent(uint InvoiceId, decimal Amount, DateTime PaidAt) : DomainEvent;

// Publisher (UseCase)
public class CreateMemberUseCase
{
    private readonly IEventBus _eventBus;

    public async Task<Result<uint>> ExecuteAsync(CreateMemberRequest req)
    {
        var member = new Member { /* ... */ };
        await _memberRepo.AddAsync(member);
        await _uow.SaveChangesAsync();

        // Publish event - others will handle it
        await _eventBus.PublishAsync(new MemberCreatedEvent(member.Id, member.Email, DateTime.UtcNow));

        return Result<uint>.SuccessResult(member.Id);
    }
}

// Subscribers (Handlers)
public class SendWelcomeEmailOnMemberCreated
{
    private readonly IEmailService _email;

    [EventHandler]
    public async Task HandleAsync(MemberCreatedEvent evt)
    {
        await _email.SendAsync(evt.Email, "Welcome to Riada!", "...");
    }
}

public class CreateWelcomeContractOnMemberCreated
{
    private readonly IContractService _contracts;

    [EventHandler]
    public async Task HandleAsync(MemberCreatedEvent evt)
    {
        await _contracts.CreateTrialAsync(evt.MemberId);
    }
}

public class AuditLogOnPaymentReceived
{
    private readonly IAuditLogger _audit;

    [EventHandler]
    public async Task HandleAsync(PaymentReceivedEvent evt)
    {
        await _audit.LogAsync($"Payment received: €{evt.Amount} for invoice {evt.InvoiceId}");
    }
}

// Event Bus (In-Memory or RabbitMQ)
public interface IEventBus
{
    Task PublishAsync<T>(T @event) where T : DomainEvent;
    Task SubscribeAsync<T>(Func<T, Task> handler) where T : DomainEvent;
}
```

**Benefits:**
✅ Decoupled UseCases from side effects  
✅ Multiple subscribers (email, audit, notifications)  
✅ Testable (mock event bus)  
✅ Scalable (async handlers)

---

## 6. Repository + Unit of Work Pattern

### Problem Solved
Scattered data access; transaction management scattered across UseCases.

### Implementation

```csharp
// Repository Interface
public interface IGenericRepository<T> where T : class
{
    Task<T?> GetByIdAsync(uint id, CancellationToken ct = default);
    Task<T> AddAsync(T entity, CancellationToken ct = default);
    void Update(T entity);
    void Remove(T entity);
    Task<IReadOnlyList<T>> FindAsync(Expression<Func<T, bool>> predicate, CancellationToken ct = default);
}

// Unit of Work (Transaction Manager)
public interface IUnitOfWork : IDisposable
{
    IGenericRepository<Member> Members { get; }
    IGenericRepository<Contract> Contracts { get; }
    IGenericRepository<Invoice> Invoices { get; }

    Task<int> SaveChangesAsync(CancellationToken ct = default);
    Task BeginTransactionAsync(CancellationToken ct = default);
    Task CommitTransactionAsync(CancellationToken ct = default);
    Task RollbackTransactionAsync(CancellationToken ct = default);
}

// Use Case (Clean)
public class CreateMemberWithContractUseCase
{
    private readonly IUnitOfWork _uow;

    public async Task<Result<uint>> ExecuteAsync(CreateMemberRequest req)
    {
        await _uow.BeginTransactionAsync();
        try
        {
            var member = new Member { /* ... */ };
            await _uow.Members.AddAsync(member);

            var contract = new Contract { MemberId = member.Id, /* ... */ };
            await _uow.Contracts.AddAsync(contract);

            await _uow.SaveChangesAsync();
            await _uow.CommitTransactionAsync();

            return Result<uint>.SuccessResult(member.Id);
        }
        catch (Exception ex)
        {
            await _uow.RollbackTransactionAsync();
            return Result<uint>.FailureResult("TX_ERROR", "Transaction failed", ex);
        }
    }
}
```

**Benefits:**
✅ Automatic transaction management  
✅ Atomic multi-aggregate operations  
✅ Testable (mock repositories)  
✅ Database-agnostic

---

## 7. Caching Strategy (Multi-Layer)

### Problem Solved
N+1 database queries; slow dashboard; expensive API calls.

### Implementation

```csharp
// Decorator Pattern: Cached Repository
public class CachedMemberRepository : IGenericRepository<Member>
{
    private readonly IGenericRepository<Member> _inner;
    private readonly ICacheService _cache;
    private const string CacheKeyPrefix = "members:";
    private const int CacheTTL = 300; // 5 min

    public async Task<Member?> GetByIdAsync(uint id, CancellationToken ct)
    {
        var cacheKey = $"{CacheKeyPrefix}{id}";

        // Check cache first
        var cached = await _cache.GetAsync<Member>(cacheKey, ct);
        if (cached != null)
            return cached;

        // Cache miss → query DB
        var member = await _inner.GetByIdAsync(id, ct);
        if (member != null)
            await _cache.SetAsync(cacheKey, member, TimeSpan.FromSeconds(CacheTTL), ct);

        return member;
    }

    public async Task<Member> AddAsync(Member entity, CancellationToken ct)
    {
        var result = await _inner.AddAsync(entity, ct);
        // Invalidate related caches
        await _cache.RemoveByPatternAsync("members:list:*", ct);
        return result;
    }
}

// Dependency Injection
services.AddScoped<IGenericRepository<Member>>(sp =>
{
    var dbRepo = new EFRepository<Member>(sp.GetRequiredService<RiadaDbContext>());
    var cache = sp.GetRequiredService<ICacheService>();
    return new CachedMemberRepository(dbRepo, cache);
});
```

**Cache Layers:**
1. **In-Memory Cache** (L1) - Fast, local instance
2. **Distributed Cache (Redis)** (L2) - Shared across servers
3. **Database** (L3) - Source of truth

**Invalidation Strategies:**
- TTL-based (5-10 min for member detail)
- Event-based (on update, invalidate immediately)
- Pattern-based (member:123:* removes all related)

---

## 8. Input Validation & Sanitization

### Problem Solved
SQL injection, XSS, buffer overflows, malicious input.

### Implementation

```csharp
// Sanitizer
public static class InputSanitizer
{
    public static string SanitizeString(string? input, int maxLength = 10000)
    {
        if (string.IsNullOrEmpty(input))
            return string.Empty;

        var trimmed = input.Trim();

        // Length check
        if (trimmed.Length > maxLength)
            throw new ArgumentException($"Exceeds max length {maxLength}");

        // SQL injection patterns
        if (Regex.IsMatch(trimmed, @"(--|\*|;DROP|UNION)"))
            throw new ArgumentException("Contains invalid characters");

        // XSS patterns
        if (Regex.IsMatch(trimmed, @"(<script|onclick|onerror)"))
            throw new ArgumentException("Contains invalid HTML");

        return trimmed;
    }
}

// Validation Pipeline (with sanitization)
public class CreateMemberRequestValidator : AbstractValidator<CreateMemberRequest>
{
    public CreateMemberRequestValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty()
            .MaximumLength(100)
            .Must(n => !ContainsMaliciousChars(n))
            .WithMessage("Invalid characters");

        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .Custom((email, ctx) =>
            {
                var sanitized = InputSanitizer.SanitizeString(email);
                if (sanitized != email)
                    ctx.AddFailure("Email contains invalid characters");
            });
    }
}
```

---

## Summary: Pattern Hierarchy

```
┌─────────────────────────────────────┐
│         Use Case (Entry Point)      │
├─────────────────────────────────────┤
│  Command/Query (CQRS)               │
│  ↓                                  │
│  Validation Pipeline (Chain)        │
│  ↓                                  │
│  Business Logic                     │
│  ↓                                  │
│  Specification + Repository         │
│  ↓                                  │
│  Cached Repository (Decorator)      │
│  ↓                                  │
│  Database (EF Core / Dapper)        │
│  ↓                                  │
│  Event Bus (Pub/Sub)                │
│  ├─ Email Service                   │
│  ├─ Audit Logger                    │
│  └─ Notification Service            │
│  ↓                                  │
│  Result<T> (Railway Oriented)       │
└─────────────────────────────────────┘
```

---

**Adopted Patterns:** Result, Specification, CQRS, Chain of Responsibility, Events, Repository, Caching  
**Not Adopted (Yet):** Event Sourcing, SAGA, Outbox Pattern (future enhancements)
