/**
 * Session Booking Page Object Model
 */
export class SessionBookingPage {
  private sessionsList = '[data-testid="sessions-list"]';
  private sessionRow = 'tr[data-testid^="session-row-"]';
  private bookButton = '[data-testid="book-session-button"]';
  private cancelButton = '[data-testid="cancel-session-button"]';
  private confirmBookButton = '[data-testid="confirm-book-button"]';
  private confirmCancelButton = '[data-testid="confirm-cancel-button"]';
  private successMessage = '[role="alert"].success';
  private errorMessage = '[role="alert"].error';
  private therapistCalendar = '[data-testid="therapist-calendar"]';
  private sessionDetails = '[data-testid="session-details"]';

  visit() {
    cy.visit('/sessions');
  }

  getSessionsList() {
    return cy.get(this.sessionsList);
  }

  getSessionRows() {
    return cy.get(this.sessionRow);
  }

  bookSession(sessionId: number) {
    cy.get(`[data-testid="session-row-${sessionId}"]`).find(this.bookButton).click();
    cy.get(this.confirmBookButton).click();
  }

  cancelSession(sessionId: number) {
    cy.get(`[data-testid="session-row-${sessionId}"]`).find(this.cancelButton).click();
    cy.get(this.confirmCancelButton).click();
  }

  verifySessionBooked(sessionId: number) {
    cy.get(`[data-testid="session-row-${sessionId}"]`).should('contain', 'Booked');
  }

  verifySessionCancelled(sessionId: number) {
    cy.get(`[data-testid="session-row-${sessionId}"]`).should('not.exist');
  }

  verifySuccessMessage(message: string) {
    cy.get(this.successMessage).should('contain', message);
  }

  verifyErrorMessage(message: string) {
    cy.get(this.errorMessage).should('contain', message);
  }

  verifySessionAppearsOnTherapistCalendar(therapistId: number, sessionId: number) {
    cy.visit(`/therapist/${therapistId}/calendar`);
    cy.get(this.therapistCalendar).should('contain', `Session ${sessionId}`);
  }

  verifySessionAvailability(sessionId: number) {
    cy.get(`[data-testid="session-row-${sessionId}"]`)
      .find('[data-testid="availability"]')
      .should('contain', 'Available');
  }
}
