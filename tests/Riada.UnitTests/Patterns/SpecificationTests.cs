using FluentAssertions;
using Xunit;

namespace Riada.UnitTests.Patterns;

public class SpecificationTests
{
    private class SampleEntity
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Age { get; set; }
        public bool IsActive { get; set; }
    }

    private delegate bool SpecificationCriteria<T>(T entity);

    [Fact]
    public void Specification_WithValidCriteria_ShouldEvaluateCorrectly()
    {
        // Arrange
        SpecificationCriteria<SampleEntity> spec = e => e.Name.StartsWith("A");
        var entity = new SampleEntity { Id = 1, Name = "Alice", Age = 30, IsActive = true };

        // Act
        var result = spec(entity);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void Specification_WithNonMatchingCriteria_ShouldReturnFalse()
    {
        // Arrange
        SpecificationCriteria<SampleEntity> spec = e => e.Name.StartsWith("B");
        var entity = new SampleEntity { Id = 1, Name = "Alice", Age = 30, IsActive = true };

        // Act
        var result = spec(entity);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void Specification_WithAndOperator_ShouldCombineCriteria()
    {
        // Arrange
        SpecificationCriteria<SampleEntity> spec1 = e => e.Name.StartsWith("A");
        SpecificationCriteria<SampleEntity> spec2 = e => e.Age > 25;
        SpecificationCriteria<SampleEntity> combined = e => spec1(e) && spec2(e);

        var entity = new SampleEntity { Id = 1, Name = "Alice", Age = 30, IsActive = true };

        // Act
        var result = combined(entity);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void Specification_WithOrOperator_ShouldCombineWithOr()
    {
        // Arrange
        SpecificationCriteria<SampleEntity> spec1 = e => e.Name.StartsWith("B");
        SpecificationCriteria<SampleEntity> spec2 = e => e.Age > 25;
        SpecificationCriteria<SampleEntity> combined = e => spec1(e) || spec2(e);

        var entity = new SampleEntity { Id = 1, Name = "Alice", Age = 30, IsActive = true };

        // Act
        var result = combined(entity);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void Specification_WithNotOperator_ShouldNegateCriteria()
    {
        // Arrange
        SpecificationCriteria<SampleEntity> spec = e => e.Name.StartsWith("B");
        SpecificationCriteria<SampleEntity> notSpec = e => !spec(e);

        var entity = new SampleEntity { Id = 1, Name = "Alice", Age = 30, IsActive = true };

        // Act
        var result = notSpec(entity);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void Specification_WithComplexCombination_ShouldEvaluateCorrectly()
    {
        // Arrange
        SpecificationCriteria<SampleEntity> spec1 = e => e.Name.StartsWith("A");
        SpecificationCriteria<SampleEntity> spec2 = e => e.Age > 25;
        SpecificationCriteria<SampleEntity> spec3 = e => e.Age > 50;
        SpecificationCriteria<SampleEntity> combined = e => (spec1(e) && spec2(e)) || spec3(e);

        var entityBoth = new SampleEntity { Id = 1, Name = "Alice", Age = 30, IsActive = true };
        var entityOldWithoutName = new SampleEntity { Id = 2, Name = "Bob", Age = 55, IsActive = true };
        var entityNeither = new SampleEntity { Id = 3, Name = "Charlie", Age = 20, IsActive = true };

        // Act
        var result1 = combined(entityBoth);
        var result2 = combined(entityOldWithoutName);
        var result3 = combined(entityNeither);

        // Assert
        result1.Should().BeTrue();
        result2.Should().BeTrue();
        result3.Should().BeFalse();
    }

    [Fact]
    public void Specification_WithNullEntity_ShouldThrowException()
    {
        // Arrange
        SpecificationCriteria<SampleEntity> spec = e => e.Name.StartsWith("A");

        // Act & Assert
        Assert.Throws<NullReferenceException>(() => spec(null!));
    }
}

