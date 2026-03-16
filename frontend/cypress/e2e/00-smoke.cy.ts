describe('Smoke', () => {
  it('loads the application shell', () => {
    cy.visit('/');
    cy.get('app-root').should('exist');
    cy.get('body').should('not.be.empty');
  });

  it('resolves a protected route without crashing', () => {
    cy.visit('/dashboard', { failOnStatusCode: false });
    cy.location('pathname').should('match', /\/(dashboard|login)/);
  });
});
