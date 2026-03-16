/**
 * Login Page Object Model
 * Encapsulates login page interactions and selectors
 */
export class LoginPage {
  private emailInput = 'input[type="email"]';
  private passwordInput = 'input[type="password"]';
  private submitButton = 'button[type="submit"]';
  private errorMessage = '[role="alert"]';

  visit() {
    cy.visit('/login');
  }

  enterEmail(email: string) {
    cy.get(this.emailInput).type(email);
  }

  enterPassword(password: string) {
    cy.get(this.passwordInput).type(password);
  }

  submit() {
    cy.get(this.submitButton).click();
  }

  fillLoginForm(email: string, password: string) {
    this.enterEmail(email);
    this.enterPassword(password);
    this.submit();
  }

  getErrorMessage() {
    return cy.get(this.errorMessage);
  }

  isErrorDisplayed(expectedMessage: string) {
    this.getErrorMessage().should('contain', expectedMessage);
  }
}
