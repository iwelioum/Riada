namespace Riada.Domain.Common;

/// <summary>
/// Base specification for implementing query filters using expression trees
/// Enables composable, testable query logic separate from repositories
/// </summary>
public abstract class Specification<T> where T : class
{
    public System.Linq.Expressions.Expression<Func<T, bool>>? Criteria { get; protected set; }
    public List<string> IncludeStrings { get; } = [];
    public List<System.Linq.Expressions.Expression<Func<T, object>>> Includes { get; } = [];
    public System.Linq.Expressions.Expression<Func<T, object>>? OrderBy { get; protected set; }
    public System.Linq.Expressions.Expression<Func<T, object>>? OrderByDescending { get; protected set; }
    public int Take { get; protected set; }
    public int Skip { get; protected set; }
    public bool IsPagingEnabled { get; protected set; }

    protected virtual void AddInclude(System.Linq.Expressions.Expression<Func<T, object>> includeExpression) =>
        Includes.Add(includeExpression);

    protected virtual void AddInclude(string includeString) =>
        IncludeStrings.Add(includeString);

    protected virtual void ApplyPaging(int skip, int take)
    {
        Skip = skip;
        Take = take;
        IsPagingEnabled = true;
    }

    protected virtual void ApplyOrderBy(System.Linq.Expressions.Expression<Func<T, object>> orderByExpression) =>
        OrderBy = orderByExpression;

    protected virtual void ApplyOrderByDescending(System.Linq.Expressions.Expression<Func<T, object>> orderByDescendingExpression) =>
        OrderByDescending = orderByDescendingExpression;
}
