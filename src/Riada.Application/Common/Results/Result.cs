namespace Riada.Application.Common.Results;

/// <summary>
/// Result pattern for consistent error handling across the application.
/// Replaces exceptions with structured Result objects.
/// </summary>
public interface IResult
{
    bool IsSuccess { get; }
    bool IsFailure { get; }
    string Error { get; }
    int? ErrorCode { get; }
}

/// <summary>
/// Generic Result pattern implementation
/// </summary>
public class Result<T> : IResult
{
    private readonly T? _value;
    private readonly string _error;
    private readonly int? _errorCode;
    private readonly Exception? _exception;

    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public string Error => _error ?? string.Empty;
    public int? ErrorCode => _errorCode;

    public T Value => IsSuccess ? _value! : throw new InvalidOperationException($"Cannot access Value of failed result: {Error}");

    private Result(T value)
    {
        IsSuccess = true;
        _value = value;
        _error = string.Empty;
    }

    private Result(string error, int? errorCode = null, Exception? exception = null)
    {
        IsSuccess = false;
        _value = default;
        _error = error;
        _errorCode = errorCode;
        _exception = exception;
    }

    public static Result<T> Success(T value) => new(value);

    public static Result<T> Failure(string error, int? errorCode = null, Exception? exception = null)
        => new(error, errorCode, exception);

    public static Result<T> Failure(Exception exception)
        => new(exception.Message, null, exception);

    public TResult Match<TResult>(
        Func<T, TResult> onSuccess,
        Func<string, int?, TResult> onFailure)
    {
        return IsSuccess
            ? onSuccess(_value!)
            : onFailure(_error, _errorCode);
    }

    public void Match(
        Action<T> onSuccess,
        Action<string, int?> onFailure)
    {
        if (IsSuccess)
            onSuccess(_value!);
        else
            onFailure(_error, _errorCode);
    }

    public Result<TNext> Bind<TNext>(Func<T, Result<TNext>> f)
        => IsSuccess ? f(_value!) : Result<TNext>.Failure(_error, _errorCode);

    public Result<TNext> Select<TNext>(Func<T, TNext> f)
        => IsSuccess ? Result<TNext>.Success(f(_value!)) : Result<TNext>.Failure(_error, _errorCode);

    public override string ToString()
        => IsSuccess ? $"Success: {_value}" : $"Failure: {_error} (Code: {_errorCode})";
}

/// <summary>
/// Non-generic Result for void operations
/// </summary>
public class Result : IResult
{
    private readonly string _error;
    private readonly int? _errorCode;
    private readonly Exception? _exception;

    public bool IsSuccess { get; }
    public bool IsFailure => !IsSuccess;
    public string Error => _error ?? string.Empty;
    public int? ErrorCode => _errorCode;

    private Result()
    {
        IsSuccess = true;
        _error = string.Empty;
    }

    private Result(string error, int? errorCode = null, Exception? exception = null)
    {
        IsSuccess = false;
        _error = error;
        _errorCode = errorCode;
        _exception = exception;
    }

    public static Result Success() => new();

    public static Result Failure(string error, int? errorCode = null, Exception? exception = null)
        => new(error, errorCode, exception);

    public static Result Failure(Exception exception)
        => new(exception.Message, null, exception);

    public void Match(
        Action onSuccess,
        Action<string, int?> onFailure)
    {
        if (IsSuccess)
            onSuccess();
        else
            onFailure(_error, _errorCode);
    }

    public TResult Match<TResult>(
        Func<TResult> onSuccess,
        Func<string, int?, TResult> onFailure)
    {
        return IsSuccess
            ? onSuccess()
            : onFailure(_error, _errorCode);
    }
}
