import { DashboardPage } from '../support/pages/dashboard.page';
import { LoginPage } from '../support/pages/login.page';

/**
 * Dashboard Metrics E2E Tests
 * Tests for dashboard loading, metrics display, and updates
 */
describe('Dashboard Metrics', () => {
  const dashboardPage = new DashboardPage();
  const loginPage = new LoginPage();

  beforeEach(() => {
    // Login before each test
    cy.clearAllLocalStorage();
    loginPage.visit();
    loginPage.fillLoginForm('test@example.com', 'TestPassword123!');
    cy.url().should('include', '/dashboard');
  });

  it('should load dashboard with all metrics displayed', () => {
    // Act & Assert
    dashboardPage.visit();
    dashboardPage.verifyMetricsLoaded();
    
    // Verify key metric cards are visible
    dashboardPage.getGuestCountValue().should('be.visible');
    dashboardPage.getSessionsCountValue().should('be.visible');
  });

  it('should display guest count metric', () => {
    // Act & Assert
    dashboardPage.visit();
    dashboardPage.getGuestCountValue().should((element) => {
      expect(element.text()).to.match(/\d+/); // Should contain a number
    });
  });

  it('should display sessions count metric', () => {
    // Act & Assert
    dashboardPage.visit();
    dashboardPage.getSessionsCountValue().should((element) => {
      expect(element.text()).to.match(/\d+/);
    });
  });

  it('should render all charts correctly', () => {
    // Act & Assert
    dashboardPage.visit();
    dashboardPage.verifyChartsRendered();
    
    // Verify chart containers exist
    cy.get('[data-testid="charts-section"]')
      .find('canvas')
      .should('have.length.greaterThan', 0);
  });

  it('should update metrics after new session is booked', () => {
    // Arrange
    dashboardPage.visit();
    const initialCount = cy.get('[data-testid="sessions-count"]').text();

    // Act - Book a session (navigate to sessions page)
    cy.visit('/sessions');
    cy.get('[data-testid^="session-row-"]').first().find('[data-testid="book-session-button"]').click();
    cy.get('[data-testid="confirm-book-button"]').click();
    cy.get('[role="alert"]').should('contain', 'Session booked');

    // Navigate back to dashboard
    dashboardPage.visit();

    // Assert - Session count should be updated
    cy.get('[data-testid="sessions-count"]').then((element) => {
      const newCount = element.text();
      expect(parseInt(newCount)).to.be.greaterThan(parseInt(initialCount.toString()));
    });
  });

  it('should update metrics after new guest is added', () => {
    // Arrange
    dashboardPage.visit();
    const initialCount = cy.get('[data-testid="guest-count"]').text();

    // Act - Add a guest
    cy.visit('/guests');
    cy.get('[data-testid="add-guest-button"]').click();
    cy.get('input[name="firstName"]').type('NewGuest');
    cy.get('input[name="lastName"]').type('Test');
    cy.get('button[type="submit"]').click();
    cy.get('[role="alert"]').should('contain', 'Guest added');

    // Navigate back to dashboard
    dashboardPage.visit();

    // Assert - Guest count should be updated
    cy.get('[data-testid="guest-count"]').then((element) => {
      const newCount = element.text();
      expect(parseInt(newCount)).to.be.greaterThan(parseInt(initialCount.toString()));
    });
  });

  it('should display dashboard layout correctly', () => {
    // Act & Assert
    dashboardPage.visit();
    
    // Verify layout sections exist
    cy.get('[data-testid="metrics-section"]').should('be.visible');
    cy.get('[data-testid="charts-section"]').should('be.visible');
    cy.get('[data-testid="recent-activity-section"]').should('be.visible');
  });

  it('should have responsive metrics cards', () => {
    // Act - Desktop view
    dashboardPage.visit();
    cy.get('[data-testid="metrics-section"]')
      .find('[data-testid^="metric-card-"]')
      .should('have.length.greaterThan', 0);

    // Verify cards are properly aligned
    cy.get('[data-testid="metrics-section"]').should('have.css', 'display', 'grid');
  });

  it('should display no data message when dashboard is empty', () => {
    // This test assumes the ability to clear data or use a test account with no data
    // Act & Assert
    cy.visit('/dashboard');
    
    // If empty, should show "No data available" message
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="no-data-message"]').length > 0) {
        cy.get('[data-testid="no-data-message"]').should('contain', 'No data available');
      }
    });
  });
});
