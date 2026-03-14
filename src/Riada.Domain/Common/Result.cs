namespace Riada.Domain.Common;

/// <summary>
/// Encapsulates operation result with success/failure status and optional value
/// Pattern-based error handling for all UseCases
/// </summary>
public abstract record Result
{
    public sealed record Success(object? Value = null) : Result;
    public sealed record Failure(string Code, string Message, Exception? Exception = null) : Result;

    public TResult Match<TResult>(
        Func<object?, TResult> onSuccess,
        Func<string, string, TResult> onFailure) =>
        this switch
        {
            Success s => onSuccess(s.Value),
            Failure f => onFailure(f.Code, f.Message),
            _ => throw new InvalidOperationException("Unknown result type")
        };

    public async Task<TResult> MatchAsync<TResult>(
        Func<object?, Task<TResult>> onSuccess,
        Func<string, string, Task<TResult>> onFailure) =>
        this switch
        {
            Success s => await onSuccess(s.Value),
            Failure f => await onFailure(f.Code, f.Message),
            _ => throw new InvalidOperationException("Unknown result type")
        };

    public static Result SuccessResult(object? value = null) => new Success(value);
    public static Result FailureResult(string code, string message, Exception? ex = null) =>
        new Failure(code, message, ex);
}

/// <summary>
/// Generic Result<T> for type-safe operation outcomes
/// </summary>
public abstract record Result<T>
{
    public sealed record Success(T Value) : Result<T>;
    public sealed record Failure(string Code, string Message, Exception? Exception = null) : Result<T>;

    public TResult Match<TResult>(
        Func<T, TResult> onSuccess,
        Func<string, string, TResult> onFailure) =>
        this switch
        {
            Success s => onSuccess(s.Value),
            Failure f => onFailure(f.Code, f.Message),
            _ => throw new InvalidOperationException("Unknown result type")
        };

    public async Task<TResult> MatchAsync<TResult>(
        Func<T, Task<TResult>> onSuccess,
        Func<string, string, Task<TResult>> onFailure) =>
        this switch
        {
            Success s => await onSuccess(s.Value),
            Failure f => await onFailure(f.Code, f.Message),
            _ => throw new InvalidOperationException("Unknown result type")
        };

    public static Result<T> SuccessResult(T value) => new Success(value);
    public static Result<T> FailureResult(string code, string message, Exception? ex = null) =>
        new Failure(code, message, ex);
}
