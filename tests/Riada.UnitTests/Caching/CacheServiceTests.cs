using FluentAssertions;
using Moq;
using Xunit;
using Riada.Application.Caching;
using Riada.Domain.Entities.Membership;
using Microsoft.Extensions.Caching.Distributed;
using System.Text;
using System.Text.Json;

namespace Riada.UnitTests.Caching;

public class CacheServiceTests
{
    private readonly Mock<IDistributedCache> _cacheMock;
    private readonly DistributedCacheService _cacheService;

    public CacheServiceTests()
    {
        _cacheMock = new Mock<IDistributedCache>();
        _cacheService = new DistributedCacheService(_cacheMock.Object);
    }

    [Fact]
    public async Task GetAsync_WithExistingKey_ShouldReturnCachedValue()
    {
        // Arrange
        var key = "member:1";
        var member = new Member { Id = 1, FirstName = "John", LastName = "Doe" };
        var serializedData = JsonSerializer.Serialize(member);

        _cacheMock
            .Setup(c => c.GetAsync(key, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Encoding.UTF8.GetBytes(serializedData));

        // Act
        var result = await _cacheService.GetAsync<Member>(key);

        // Assert
        result.Should().NotBeNull();
        result!.FirstName.Should().Be("John");
        _cacheMock.Verify(c => c.GetAsync(key, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GetAsync_WithMissingKey_ShouldReturnNull()
    {
        // Arrange
        var key = "member:999";

        _cacheMock
            .Setup(c => c.GetAsync(key, It.IsAny<CancellationToken>()))
            .ReturnsAsync((byte[]?)null);

        // Act
        var result = await _cacheService.GetAsync<Member>(key);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task SetAsync_WithValidData_ShouldCacheSuccessfully()
    {
        // Arrange
        var key = "member:2";
        var member = new Member { Id = 2, FirstName = "Jane", LastName = "Smith" };
        var expiration = TimeSpan.FromHours(1);

        _cacheMock
            .Setup(c => c.SetAsync(key, It.IsAny<byte[]>(), It.IsAny<DistributedCacheEntryOptions>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await _cacheService.SetAsync(key, member, expiration);

        // Assert
        _cacheMock.Verify(
            c => c.SetAsync(key, It.IsAny<byte[]>(), It.IsAny<DistributedCacheEntryOptions>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task RemoveAsync_WithExistingKey_ShouldDeleteFromCache()
    {
        // Arrange
        var key = "member:3";

        _cacheMock
            .Setup(c => c.RemoveAsync(key, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        // Act
        await _cacheService.RemoveAsync(key);

        // Assert
        _cacheMock.Verify(c => c.RemoveAsync(key, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task SetAsync_WithCacheException_ShouldPropagateException()
    {
        // Arrange
        var key = "member:4";
        var member = new Member { Id = 4, FirstName = "Bob", LastName = "Johnson" };

        _cacheMock
            .Setup(c => c.SetAsync(key, It.IsAny<byte[]>(), It.IsAny<DistributedCacheEntryOptions>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Cache service unavailable"));

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            _cacheService.SetAsync(key, member));
    }

    [Fact]
    public async Task GetAsync_WithInvalidSerializedData_ShouldReturnNull()
    {
        // Arrange
        var key = "member:5";
        var invalidData = "not valid json";

        _cacheMock
            .Setup(c => c.GetAsync(key, It.IsAny<CancellationToken>()))
            .ReturnsAsync(Encoding.UTF8.GetBytes(invalidData));

        // Act
        var result = await _cacheService.GetAsync<Member>(key);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task CacheLookupPattern_WithPopulateOnMiss_ShouldFillCache()
    {
        // Arrange
        var key = "member:6";
        var member = new Member { Id = 6, FirstName = "Carol", LastName = "White" };

        _cacheMock
            .Setup(c => c.GetAsync(key, It.IsAny<CancellationToken>()))
            .ReturnsAsync((byte[]?)null)
            .Verifiable();

        _cacheMock
            .Setup(c => c.SetAsync(key, It.IsAny<byte[]>(), It.IsAny<DistributedCacheEntryOptions>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask)
            .Verifiable();

        // Act
        var cached = await _cacheService.GetAsync<Member>(key);
        if (cached == null)
        {
            await _cacheService.SetAsync(key, member);
        }

        // Assert
        _cacheMock.Verify(c => c.GetAsync(key, It.IsAny<CancellationToken>()), Times.Once);
        _cacheMock.Verify(
            c => c.SetAsync(key, It.IsAny<byte[]>(), It.IsAny<DistributedCacheEntryOptions>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }
}
