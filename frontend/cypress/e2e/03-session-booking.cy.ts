import { SessionBookingPage } from '../support/pages/session-booking.page';
import { LoginPage } from '../support/pages/login.page';

/**
 * Session Booking E2E Tests
 * Tests for booking and cancelling therapy sessions
 */
describe('Session Booking', () => {
  const sessionPage = new SessionBookingPage();
  const loginPage = new LoginPage();

  beforeEach(() => {
    // Login before each test
    cy.clearAllLocalStorage();
    loginPage.visit();
    loginPage.fillLoginForm('test@example.com', 'TestPassword123!');
    cy.url().should('include', '/dashboard');

    // Navigate to sessions page
    sessionPage.visit();
  });

  it('should book available session successfully', () => {
    // Arrange - Get first available session
    let sessionId = 0;
    cy.get('[data-testid^="session-row-"]').first().then(($row) => {
      const testId = $row.attr('data-testid');
      sessionId = parseInt(testId?.replace('session-row-', '') || '0', 10);

      // Verify availability
      sessionPage.verifySessionAvailability(sessionId);

      // Act - Book the session
      sessionPage.bookSession(sessionId);

      // Assert
      sessionPage.verifySuccessMessage('Session booked successfully');
      sessionPage.verifySessionBooked(sessionId);
    });
  });

  it('should confirm session availability before booking', () => {
    // Arrange
    let sessionId = 0;
    cy.get('[data-testid^="session-row-"]').first().then(($row) => {
      const testId = $row.attr('data-testid');
      sessionId = parseInt(testId?.replace('session-row-', '') || '0', 10);

      // Act & Assert - Verify availability is displayed
      sessionPage.verifySessionAvailability(sessionId);
      cy.get(`[data-testid="session-row-${sessionId}"]`)
        .find('[data-testid="capacity-info"]')
        .should('be.visible');
    });
  });

  it('should display booked session on therapist calendar', () => {
    // Arrange
    const therapistId = 1;
    let sessionId = 0;

    // Act - Book a session
    cy.get('[data-testid^="session-row-"]').first().then(($row) => {
      const testId = $row.attr('data-testid');
      sessionId = parseInt(testId?.replace('session-row-', '') || '0', 10);

      sessionPage.bookSession(sessionId);

      // Assert - Verify on therapist calendar
      sessionPage.verifySessionAppearsOnTherapistCalendar(therapistId, sessionId);
    });
  });

  it('should cancel booked session successfully', () => {
    // Arrange - First book a session
    let sessionId = 0;
    cy.get('[data-testid^="session-row-"]').first().then(($row) => {
      const testId = $row.attr('data-testid');
      sessionId = parseInt(testId?.replace('session-row-', '') || '0', 10);

      sessionPage.bookSession(sessionId);
      sessionPage.verifySessionBooked(sessionId);

      // Act - Cancel the session
      sessionPage.cancelSession(sessionId);

      // Assert
      sessionPage.verifySuccessMessage('Session cancelled successfully');
      sessionPage.verifySessionCancelled(sessionId);
    });
  });

  it('should show error when booking fully booked session', () => {
    // This test assumes we have a fully booked session
    // Arrange - Find a fully booked session
    cy.get('[data-testid^="session-row-"]').each(($row) => {
      const capacity = $row.find('[data-testid="capacity-info"]').text();
      if (capacity.includes('Full')) {
        // Act - Try to book
        $row.find('[data-testid="book-session-button"]').click();
        cy.get('[data-testid="confirm-book-button"]').click();

        // Assert
        sessionPage.verifyErrorMessage('Session is fully booked');
      }
    });
  });

  it('should display session details correctly', () => {
    // Act & Assert
    cy.get('[data-testid^="session-row-"]').first().should((session) => {
      expect(session.find('[data-testid="course-name"]')).to.exist;
      expect(session.find('[data-testid="instructor-name"]')).to.exist;
      expect(session.find('[data-testid="session-date"]')).to.exist;
      expect(session.find('[data-testid="session-time"]')).to.exist;
    });
  });
});
