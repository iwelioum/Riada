/**
 * Invoicing Page Object Model
 */
export class InvoicingPage {
  private invoicesList = '[data-testid="invoices-list"]';
  private invoiceRow = 'tr[data-testid^="invoice-row-"]';
  private generateButton = '[data-testid="generate-invoice-button"]';
  private downloadButton = '[data-testid="download-invoice-button"]';
  private confirmGenerateButton = '[data-testid="confirm-generate-button"]';
  private invoiceTotal = '[data-testid="invoice-total"]';
  private invoiceNumber = '[data-testid="invoice-number"]';
  private invoiceStatus = '[data-testid="invoice-status"]';
  private successMessage = '[role="alert"].success';

  visit() {
    cy.visit('/billing/invoices');
  }

  getInvoicesList() {
    return cy.get(this.invoicesList);
  }

  getInvoiceRows() {
    return cy.get(this.invoiceRow);
  }

  clickGenerateInvoice() {
    cy.get(this.generateButton).click();
  }

  confirmGenerateInvoice() {
    cy.get(this.confirmGenerateButton).click();
  }

  generateMonthlyInvoice() {
    this.clickGenerateInvoice();
    this.confirmGenerateInvoice();
  }

  verifyInvoiceGenerated(invoiceNumber: string) {
    cy.get(this.invoicesList).should('contain', invoiceNumber);
  }

  verifyInvoiceSaved(invoiceNumber: string) {
    cy.get(this.successMessage).should('contain', 'Invoice saved');
    this.verifyInvoiceGenerated(invoiceNumber);
  }

  downloadInvoice(invoiceId: number) {
    cy.get(`[data-testid="invoice-row-${invoiceId}"]`).find(this.downloadButton).click();
  }

  verifyInvoiceDownloaded(invoiceId: number) {
    // Verify PDF download initiated by checking for download attribute
    cy.get(`[data-testid="invoice-row-${invoiceId}"]`)
      .find(this.downloadButton)
      .should('have.attr', 'href')
      .and('include', '.pdf');
  }

  verifyInvoiceTotalCorrect(invoiceId: number, expectedTotal: number) {
    cy.get(`[data-testid="invoice-row-${invoiceId}"]`)
      .find(this.invoiceTotal)
      .should('contain', expectedTotal.toString());
  }

  verifyInvoiceStatus(invoiceId: number, expectedStatus: string) {
    cy.get(`[data-testid="invoice-row-${invoiceId}"]`)
      .find(this.invoiceStatus)
      .should('contain', expectedStatus);
  }
}
