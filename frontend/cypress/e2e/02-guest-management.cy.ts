import { GuestManagementPage } from '../support/pages/guest-management.page';
import { LoginPage } from '../support/pages/login.page';

/**
 * Guest Management E2E Tests
 * Tests for CRUD operations on guests
 */
describe('Guest Management', () => {
  const guestPage = new GuestManagementPage();
  const loginPage = new LoginPage();

  beforeEach(() => {
    // Login before each test
    cy.clearAllLocalStorage();
    loginPage.visit();
    loginPage.fillLoginForm('test@example.com', 'TestPassword123!');
    cy.url().should('include', '/dashboard');
    
    // Navigate to guests page
    guestPage.visit();
  });

  it('should display guest list with pagination', () => {
    // Act & Assert
    guestPage.getGuestList().should('be.visible');
    guestPage.verifyPaginationWorks();
    guestPage.getGuestRows().should('have.length.greaterThan', 0);
  });

  it('should successfully create a new guest', () => {
    // Arrange
    const firstName = 'John';
    const lastName = 'GuestTest';
    const email = 'john.guest@example.com';

    // Act
    guestPage.createGuest(firstName, lastName, email);

    // Assert
    cy.get('[role="alert"]').should('contain', 'Guest added successfully');
    guestPage.verifyGuestInList(firstName, lastName);
  });

  it('should update guest information', () => {
    // Arrange
    const guestId = 1;
    const updatedFirstName = 'UpdatedJohn';
    const updatedLastName = 'UpdatedGuest';

    // Act
    guestPage.editGuest(guestId);
    cy.get('input[name="firstName"]').clear().type(updatedFirstName);
    cy.get('input[name="lastName"]').clear().type(updatedLastName);
    cy.get('button[type="submit"]').click();

    // Assert
    cy.get('[role="alert"]').should('contain', 'Guest updated successfully');
    guestPage.verifyGuestInList(updatedFirstName, updatedLastName);
  });

  it('should delete a guest from the list', () => {
    // Arrange
    const firstName = 'DeleteMe';
    const lastName = 'GuestTest';
    
    // First create a guest
    guestPage.createGuest(firstName, lastName);
    cy.get('[role="alert"]').should('contain', 'Guest added successfully');
    guestPage.verifyGuestInList(firstName, lastName);

    // Get the guest ID (last guest row)
    let guestId = 0;
    cy.get('[data-testid^="guest-row-"]').last().then(($row) => {
      const testId = $row.attr('data-testid');
      guestId = parseInt(testId?.replace('guest-row-', '') || '0', 10);
      
      // Act - Delete the guest
      guestPage.deleteGuest(guestId);

      // Assert
      cy.get('[role="alert"]').should('contain', 'Guest deleted successfully');
      guestPage.verifyGuestNotInList(firstName, lastName);
    });
  });

  it('should navigate through pagination pages', () => {
    // Act & Assert - Check initial page
    guestPage.verifyPaginationWorks();
    const firstPageCount = cy.get('[data-testid^="guest-row-"]').its('length');

    // Act - Navigate to next page
    guestPage.navigateToNextPage();
    cy.url().should('include', 'page=2');

    // Act - Navigate back to first page
    guestPage.navigateToPreviousPage();
    cy.url().should('include', 'page=1');
  });

  it('should display validation errors for required fields', () => {
    // Act - Try to create guest without required fields
    guestPage.clickAddGuest();
    cy.get('button[type="submit"]').click();

    // Assert
    cy.get('[data-testid="firstName-error"]').should('contain', 'First name is required');
    cy.get('[data-testid="lastName-error"]').should('contain', 'Last name is required');
  });
});
