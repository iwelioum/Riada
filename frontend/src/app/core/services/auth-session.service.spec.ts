import { TestBed } from '@angular/core/testing';
import { AuthSessionService } from './auth-session.service';

/**
 * Unit Tests for AuthSessionService
 * Tests for session storage, token management, and lifecycle
 */
describe('AuthSessionService', () => {
  let service: AuthSessionService;
  let store: { [key: string]: string } = {};

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthSessionService);

    // Mock localStorage
    const mockLocalStorage = {
      getItem: (key: string): string | null => {
        return key in store ? store[key] : null;
      },
      setItem: (key: string, value: string) => {
        store[key] = value + '';
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      }
    };

    spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
    spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
    spyOn(localStorage, 'removeItem').and.callFake(mockLocalStorage.removeItem);
  });

  afterEach(() => {
    store = {};
  });

  describe('getAccessToken', () => {
    it('should return null when no token is stored', () => {
      // Act
      const token = service.getAccessToken();

      // Assert
      expect(token).toBeNull();
    });

    it('should return stored access token', () => {
      // Arrange
      const testToken = 'test-access-token-123';
      localStorage.setItem('riada.auth.accessToken', testToken);

      // Act
      const token = service.getAccessToken();

      // Assert
      expect(token).toBe(testToken);
    });

    it('should retrieve token without modifying localStorage', () => {
      // Arrange
      const testToken = 'test-access-token-123';
      localStorage.setItem('riada.auth.accessToken', testToken);

      // Act
      const token = service.getAccessToken();
      const tokenAgain = service.getAccessToken();

      // Assert
      expect(token).toBe(testToken);
      expect(tokenAgain).toBe(testToken);
      expect(localStorage.getItem).toHaveBeenCalledTimes(2);
    });
  });

  describe('setAccessToken', () => {
    it('should store access token in localStorage', () => {
      // Arrange
      const testToken = 'new-access-token-456';

      // Act
      service.setAccessToken(testToken);

      // Assert
      expect(localStorage.setItem).toHaveBeenCalledWith('riada.auth.accessToken', testToken);
      expect(service.getAccessToken()).toBe(testToken);
    });

    it('should overwrite existing token', () => {
      // Arrange
      const oldToken = 'old-token';
      const newToken = 'new-token';
      service.setAccessToken(oldToken);

      // Act
      service.setAccessToken(newToken);

      // Assert
      expect(service.getAccessToken()).toBe(newToken);
    });

    it('should handle empty string token', () => {
      // Arrange
      const emptyToken = '';

      // Act
      service.setAccessToken(emptyToken);

      // Assert
      expect(service.getAccessToken()).toBe(emptyToken);
    });

    it('should handle token with special characters', () => {
      // Arrange
      const complexToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';

      // Act
      service.setAccessToken(complexToken);

      // Assert
      expect(service.getAccessToken()).toBe(complexToken);
    });
  });

  describe('clearAccessToken', () => {
    it('should remove access token from localStorage', () => {
      // Arrange
      const testToken = 'test-token';
      service.setAccessToken(testToken);

      // Act
      service.clearAccessToken();

      // Assert
      expect(localStorage.removeItem).toHaveBeenCalledWith('riada.auth.accessToken');
      expect(service.getAccessToken()).toBeNull();
    });

    it('should clear token even if none is set', () => {
      // Act & Assert - Should not throw error
      expect(() => service.clearAccessToken()).not.toThrow();
      expect(service.getAccessToken()).toBeNull();
    });

    it('should be callable multiple times', () => {
      // Arrange
      service.setAccessToken('token');

      // Act & Assert
      service.clearAccessToken();
      expect(service.getAccessToken()).toBeNull();
      
      service.clearAccessToken();
      expect(service.getAccessToken()).toBeNull();
    });
  });

  describe('Session lifecycle', () => {
    it('should handle complete session lifecycle', () => {
      // Arrange
      const testToken = 'lifecycle-token';

      // Act & Assert - Step 1: No token initially
      expect(service.getAccessToken()).toBeNull();

      // Act & Assert - Step 2: Set token
      service.setAccessToken(testToken);
      expect(service.getAccessToken()).toBe(testToken);

      // Act & Assert - Step 3: Verify token persists
      const token = service.getAccessToken();
      expect(token).toBe(testToken);

      // Act & Assert - Step 4: Clear token
      service.clearAccessToken();
      expect(service.getAccessToken()).toBeNull();
    });

    it('should update token multiple times during session', () => {
      // Arrange
      const tokens = ['token-1', 'token-2', 'token-3'];

      // Act & Assert
      tokens.forEach((token, index) => {
        service.setAccessToken(token);
        expect(service.getAccessToken()).toBe(token);
      });

      // Final token should be last one
      expect(service.getAccessToken()).toBe(tokens[tokens.length - 1]);
    });
  });

  describe('Error handling', () => {
    it('should handle null token gracefully', () => {
      // Act & Assert
      expect(service.getAccessToken()).toBeNull();
    });

    it('should handle undefined token after clear', () => {
      // Arrange
      service.setAccessToken('token');

      // Act
      service.clearAccessToken();

      // Assert
      const token = service.getAccessToken();
      expect(token).toBeNull();
      expect(token).not.toBeUndefined();
    });
  });
});
