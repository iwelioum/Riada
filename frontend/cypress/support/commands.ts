// Custom commands for E2E tests

// Command to intercept API calls
Cypress.Commands.add('intercept', (method: string, url: string | RegExp, fixture: any) => {
  cy.intercept(method, url, fixture).as(url.toString());
});

// Command to login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});

// Command to logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/login');
});

// Command to check notification
Cypress.Commands.add('checkNotification', (message: string) => {
  cy.get('[role="alert"]').should('contain', message);
});

// Declare custom commands for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      checkNotification(message: string): Chainable<void>;
    }
  }
}

export {};
