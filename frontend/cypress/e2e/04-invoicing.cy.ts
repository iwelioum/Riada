import { InvoicingPage } from '../support/pages/invoicing.page';
import { LoginPage } from '../support/pages/login.page';

/**
 * Invoicing E2E Tests
 * Tests for invoice generation, calculations, and downloads
 */
describe('Invoicing', () => {
  const invoicingPage = new InvoicingPage();
  const loginPage = new LoginPage();

  beforeEach(() => {
    // Login before each test
    cy.clearAllLocalStorage();
    loginPage.visit();
    loginPage.fillLoginForm('test@example.com', 'TestPassword123!');
    cy.url().should('include', '/dashboard');

    // Navigate to invoicing page
    invoicingPage.visit();
  });

  it('should generate monthly invoice successfully', () => {
    // Arrange
    const currentDate = new Date();
    const expectedMonth = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Act
    invoicingPage.generateMonthlyInvoice();

    // Assert
    cy.get('[role="alert"]').should('contain', 'Invoice generated');
    invoicingPage.getInvoicesList().should('be.visible');
    invoicingPage.getInvoiceRows().should('have.length.greaterThan', 0);
  });

  it('should save generated invoice to system', () => {
    // Arrange
    const currentDate = new Date();
    const expectedInvoiceNumber = `INV-${currentDate.getFullYear()}${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    // Act
    invoicingPage.generateMonthlyInvoice();

    // Assert
    invoicingPage.verifyInvoiceSaved(expectedInvoiceNumber);
  });

  it('should display correct invoice total', () => {
    // Arrange
    const invoiceId = 1;
    const expectedTotal = 1500.00; // Example total

    // Act & Assert
    invoicingPage.verifyInvoiceTotalCorrect(invoiceId, expectedTotal);
  });

  it('should download invoice as PDF', () => {
    // Arrange
    const invoiceId = 1;

    // Act
    invoicingPage.downloadInvoice(invoiceId);

    // Assert
    invoicingPage.verifyInvoiceDownloaded(invoiceId);
    // Verify download by checking for PDF in downloads folder
    cy.readFile(`${Cypress.config('downloadsFolder')}/invoice-${invoiceId}.pdf`).should('exist');
  });

  it('should calculate invoice correctly with multiple line items', () => {
    // Arrange - Create invoice with known items
    const invoiceId = 1;
    const expectedSubtotal = 1000.00;
    const expectedTax = 200.00;
    const expectedTotal = 1200.00;

    // Act
    invoicingPage.visit();

    // Assert
    cy.get(`[data-testid="invoice-row-${invoiceId}"]`).within(() => {
      cy.get('[data-testid="subtotal"]').should('contain', expectedSubtotal);
      cy.get('[data-testid="tax-amount"]').should('contain', expectedTax);
      cy.get('[data-testid="invoice-total"]').should('contain', expectedTotal);
    });
  });

  it('should show invoice status as Draft initially', () => {
    // Arrange
    const invoiceId = 1;

    // Act & Assert
    invoicingPage.verifyInvoiceStatus(invoiceId, 'Draft');
  });

  it('should finalize invoice and change status to Issued', () => {
    // Arrange
    const invoiceId = 1;

    // Act - Finalize invoice
    cy.get(`[data-testid="invoice-row-${invoiceId}"]`)
      .find('[data-testid="finalize-invoice-button"]')
      .click();
    cy.get('[data-testid="confirm-finalize-button"]').click();

    // Assert
    cy.get('[role="alert"]').should('contain', 'Invoice finalized');
    invoicingPage.verifyInvoiceStatus(invoiceId, 'Issued');
  });

  it('should record payment against invoice', () => {
    // Arrange
    const invoiceId = 1;
    const paymentAmount = 500.00;

    // Act
    cy.get(`[data-testid="invoice-row-${invoiceId}"]`)
      .find('[data-testid="record-payment-button"]')
      .click();
    cy.get('input[name="amount"]').type(paymentAmount.toString());
    cy.get('button[type="submit"]').click();

    // Assert
    cy.get('[role="alert"]').should('contain', 'Payment recorded');
    cy.get(`[data-testid="invoice-row-${invoiceId}"]`)
      .find('[data-testid="balance-due"]')
      .should('contain', (1200 - paymentAmount).toString());
  });

  it('should list all invoices with pagination', () => {
    // Act & Assert
    invoicingPage.getInvoicesList().should('be.visible');
    invoicingPage.getInvoiceRows().should('have.length.greaterThan', 0);

    // Verify pagination controls
    cy.get('[data-testid="pagination"]').should('be.visible');
  });
});
