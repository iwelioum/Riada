// Support file for E2E tests
// Reference: https://on.cypress.io/support-file-configuration

// Commands
import './commands';

// Disable error logging for expected network errors
Cypress.on('uncaught:exception', (err) => {
  // Ignore ResizeObserver loop errors
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  return true;
});
