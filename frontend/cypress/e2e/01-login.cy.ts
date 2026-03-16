import { LoginPage } from '../support/pages/login.page';
import { DashboardPage } from '../support/pages/dashboard.page';

/**
 * Login Flow E2E Tests
 * Tests for user authentication and login process
 */
describe('Login Flow', () => {
  const loginPage = new LoginPage();
  const dashboardPage = new DashboardPage();

  beforeEach(() => {
    // Clear authentication before each test
    cy.clearAllLocalStorage();
  });

  it('should successfully login with valid credentials', () => {
    // Arrange
    const validEmail = 'test@example.com';
    const validPassword = 'TestPassword123!';

    // Act
    loginPage.visit();
    loginPage.fillLoginForm(validEmail, validPassword);

    // Assert
    cy.url().should('include', '/dashboard');
    dashboardPage.verifyMetricsLoaded();
  });

  it('should display error message with invalid credentials', () => {
    // Arrange
    const invalidEmail = 'invalid@example.com';
    const invalidPassword = 'WrongPassword123!';

    // Act
    loginPage.visit();
    loginPage.fillLoginForm(invalidEmail, invalidPassword);

    // Assert
    cy.url().should('include', '/login');
    loginPage.isErrorDisplayed('Invalid email or password');
  });

  it('should show validation error for empty email field', () => {
    // Arrange & Act
    loginPage.visit();
    loginPage.enterPassword('TestPassword123!');
    loginPage.submit();

    // Assert
    cy.url().should('include', '/login');
    cy.get('[data-testid="email-error"]').should('contain', 'Email is required');
  });

  it('should show validation error for empty password field', () => {
    // Arrange & Act
    loginPage.visit();
    loginPage.enterEmail('test@example.com');
    loginPage.submit();

    // Assert
    cy.url().should('include', '/login');
    cy.get('[data-testid="password-error"]').should('contain', 'Password is required');
  });

  it('should persist session after login', () => {
    // Arrange
    const validEmail = 'test@example.com';
    const validPassword = 'TestPassword123!';

    // Act - Login
    loginPage.visit();
    loginPage.fillLoginForm(validEmail, validPassword);
    cy.url().should('include', '/dashboard');

    // Act - Navigate away and back
    cy.visit('/guests');
    cy.visit('/dashboard');

    // Assert - Should still be authenticated
    cy.url().should('include', '/dashboard');
    dashboardPage.verifyMetricsLoaded();
  });
});
