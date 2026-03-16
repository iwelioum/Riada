/**
 * Dashboard Page Object Model
 * Encapsulates dashboard page interactions and selectors
 */
export class DashboardPage {
  private metricsContainer = '[data-testid="metrics-section"]';
  private chartsContainer = '[data-testid="charts-section"]';
  private guestList = '[data-testid="guest-list"]';
  private sessionsList = '[data-testid="sessions-list"]';
  private logoutButton = '[data-testid="logout-button"]';
  private guestCountCard = '[data-testid="guest-count-card"]';
  private sessionsCountCard = '[data-testid="sessions-count-card"]';

  visit() {
    cy.visit('/dashboard');
  }

  getMetricsSection() {
    return cy.get(this.metricsContainer);
  }

  getChartsSection() {
    return cy.get(this.chartsContainer);
  }

  getGuestList() {
    return cy.get(this.guestList);
  }

  getSessionsList() {
    return cy.get(this.sessionsList);
  }

  verifyMetricsLoaded() {
    this.getMetricsSection().should('be.visible');
  }

  verifyChartsRendered() {
    this.getChartsSection().find('canvas').should('have.length.greaterThan', 0);
  }

  getGuestCountValue() {
    return cy.get(this.guestCountCard).should('be.visible');
  }

  getSessionsCountValue() {
    return cy.get(this.sessionsCountCard).should('be.visible');
  }

  clickLogout() {
    cy.get(this.logoutButton).click();
  }

  verifyMetricUpdated(oldValue: string, newValue: string) {
    cy.get(this.guestCountCard).should('contain', newValue);
  }
}
