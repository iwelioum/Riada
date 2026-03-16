/**
 * Guest Management Page Object Model
 * Encapsulates guest management page interactions
 */
export class GuestManagementPage {
  private guestList = '[data-testid="guest-list"]';
  private guestRow = 'tr[data-testid^="guest-row-"]';
  private addGuestButton = '[data-testid="add-guest-button"]';
  private editButton = '[data-testid="edit-guest-button"]';
  private deleteButton = '[data-testid="delete-guest-button"]';
  private confirmDeleteButton = '[data-testid="confirm-delete-button"]';
  private firstNameInput = 'input[name="firstName"]';
  private lastNameInput = 'input[name="lastName"]';
  private emailInput = 'input[name="email"]';
  private submitButton = 'button[type="submit"]';
  private pagination = '[data-testid="pagination"]';
  private nextPageButton = '[data-testid="next-page-button"]';
  private prevPageButton = '[data-testid="prev-page-button"]';

  visit() {
    cy.visit('/guests');
  }

  getGuestList() {
    return cy.get(this.guestList);
  }

  getGuestRows() {
    return cy.get(this.guestRow);
  }

  clickAddGuest() {
    cy.get(this.addGuestButton).click();
  }

  fillGuestForm(firstName: string, lastName: string, email?: string) {
    cy.get(this.firstNameInput).type(firstName);
    cy.get(this.lastNameInput).type(lastName);
    if (email) {
      cy.get(this.emailInput).type(email);
    }
  }

  submitGuestForm() {
    cy.get(this.submitButton).click();
  }

  createGuest(firstName: string, lastName: string, email?: string) {
    this.clickAddGuest();
    this.fillGuestForm(firstName, lastName, email);
    this.submitGuestForm();
  }

  editGuest(guestId: number) {
    cy.get(`[data-testid="guest-row-${guestId}"]`).find(this.editButton).click();
  }

  deleteGuest(guestId: number) {
    cy.get(`[data-testid="guest-row-${guestId}"]`).find(this.deleteButton).click();
    cy.get(this.confirmDeleteButton).click();
  }

  verifyGuestInList(firstName: string, lastName: string) {
    this.getGuestList().should('contain', firstName).and('contain', lastName);
  }

  verifyGuestNotInList(firstName: string, lastName: string) {
    this.getGuestList().should('not.contain', firstName);
  }

  verifyPaginationWorks() {
    cy.get(this.pagination).should('be.visible');
    cy.get(this.nextPageButton).should('be.enabled');
  }

  navigateToNextPage() {
    cy.get(this.nextPageButton).click();
  }

  navigateToPreviousPage() {
    cy.get(this.prevPageButton).click();
  }
}
