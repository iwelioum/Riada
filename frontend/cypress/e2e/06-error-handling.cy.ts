import { LoginPage } from '../support/pages/login.page';

/**
 * Error Handling E2E Tests
 * Tests for error scenarios, validation, and user-friendly error messages
 */
describe('Error Handling', () => {
  const loginPage = new LoginPage();

  beforeEach(() => {
    cy.clearAllLocalStorage();
  });

  it('should show user-friendly message on API error', () => {
    // Arrange - Intercept API to return error
    cy.intercept('POST', '**/api/Members', {
      statusCode: 500,
      body: { message: 'Internal server error' }
    }).as('memberError');

    // Act - Navigate and trigger API call
    loginPage.visit();
    loginPage.fillLoginForm('test@example.com', 'TestPassword123!');
    cy.wait('@memberError');
    cy.visit('/guests');

    // Create guest to trigger error
    cy.get('[data-testid="add-guest-button"]').click();
    cy.get('input[name="firstName"]').type('Test');
    cy.get('input[name="lastName"]').type('User');
    cy.get('button[type="submit"]').click();

    // Assert - Should show user-friendly error
    cy.get('[role="alert"].error').should('contain', 'Failed to create guest');
  });

  it('should handle network timeout gracefully', () => {
    // Arrange - Set slow network
    cy.intercept('GET', '**/api/Guests', (req) => {
      req.reply((res) => {
        // Simulate timeout
        res.delay(15000);
      });
    }).as('slowRequest');

    // Act
    loginPage.visit();
    loginPage.fillLoginForm('test@example.com', 'TestPassword123!');
    cy.url().should('include', '/dashboard');
    cy.visit('/guests');

    // Assert - Should show timeout message
    cy.get('[role="alert"]', { timeout: 20000 }).should('contain', 'Request timed out');
  });

  it('should display validation errors for form submission', () => {
    // Act
    loginPage.visit();
    loginPage.submit(); // Submit empty form

    // Assert
    cy.get('[data-testid="email-error"]').should('contain', 'Email is required');
    cy.get('[data-testid="password-error"]').should('contain', 'Password is required');
  });

  it('should show error for invalid email format', () => {
    // Act
    loginPage.visit();
    loginPage.enterEmail('invalid-email'); // Invalid format
    loginPage.submit();

    // Assert
    cy.get('[data-testid="email-error"]').should('contain', 'Invalid email format');
  });

  it('should prevent submission of form with validation errors', () => {
    // Act
    loginPage.visit();
    cy.get('input[name="firstName"]').type('Test'); // Only first name, missing last name
    cy.get('button[type="submit"]').click();

    // Assert - Should stay on same page
    cy.url().should('include', '/login');
    cy.get('[data-testid="lastName-error"]').should('contain', 'Last name is required');
  });

  it('should handle 404 errors gracefully', () => {
    // Arrange
    cy.intercept('GET', '**/api/Guests/999999', {
      statusCode: 404,
      body: { message: 'Guest not found' }
    }).as('guestNotFound');

    // Act
    cy.visit('/guests/999999');

    // Assert
    cy.get('[role="alert"]').should('contain', 'Guest not found');
    cy.get('[data-testid="back-button"]').should('be.visible');
  });

  it('should handle 403 forbidden errors', () => {
    // Arrange
    cy.intercept('DELETE', '**/api/Guests/**', {
      statusCode: 403,
      body: { message: 'You do not have permission to delete this guest' }
    }).as('forbidden');

    // Act
    cy.visit('/guests');
    cy.get('[data-testid^="guest-row-"]').first().find('[data-testid="delete-guest-button"]').click();
    cy.get('[data-testid="confirm-delete-button"]').click();

    // Assert
    cy.get('[role="alert"].error').should('contain', 'You do not have permission');
  });

  it('should show error message for duplicate entries', () => {
    // Arrange - Try to create guest that already exists
    cy.intercept('POST', '**/api/Guests', {
      statusCode: 409,
      body: { message: 'A guest with this email already exists' }
    }).as('duplicate');

    // Act
    cy.visit('/guests');
    cy.get('[data-testid="add-guest-button"]').click();
    cy.get('input[name="firstName"]').type('Existing');
    cy.get('input[name="lastName"]').type('Guest');
    cy.get('input[name="email"]').type('existing@example.com');
    cy.get('button[type="submit"]').click();

    // Assert
    cy.get('[role="alert"].error').should('contain', 'already exists');
  });

  it('should retry failed requests on user action', () => {
    // Arrange - First call fails, second succeeds
    let callCount = 0;
    cy.intercept('GET', '**/api/Guests', (req) => {
      callCount++;
      if (callCount === 1) {
        req.reply({ statusCode: 500, body: { message: 'Error' } });
      } else {
        req.reply({ statusCode: 200, body: [] });
      }
    }).as('guestList');

    // Act
    cy.visit('/guests');
    cy.get('[role="alert"]').should('contain', 'Failed to load guests');
    
    // Retry by clicking button
    cy.get('[data-testid="retry-button"]').click();

    // Assert
    cy.get('[role="alert"]').should('contain', 'Guests loaded');
  });
});
