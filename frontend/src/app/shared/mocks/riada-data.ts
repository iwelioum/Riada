export type MemberStatus = 'Active' | 'Suspended' | 'Anonymized';
export type ContractType = 'OpenEnded' | 'FixedTerm';
export type ContractStatus = 'Active' | 'Suspended' | 'Expired' | 'Cancelled';
export type InvoiceStatus = 'Draft' | 'Issued' | 'Paid' | 'PartiallyPaid' | 'Overdue' | 'Cancelled';

export interface MockMemberSummary {
  id: string;
  firstName: string;
  lastName: string;
  currentPlan: string | null;
  status: MemberStatus;
  homeClub: string | null;
  email: string;
  mobilePhone?: string;
  lastVisitDate: string | null;
  totalVisits: number;
  riskScore: number;
}

export interface MockContractSummary {
  id: number;
  memberName: string;
  memberId: string;
  planName: string;
  status: ContractStatus;
  startDate: string;
  endDate: string | null;
  homeClub: string;
  type: ContractType;
}

export interface MockInvoiceSummary {
  id: number;
  invoiceNumber: string;
  issuedOn: string;
  dueDate: string;
  amountInclTax: number;
  amountPaid: number;
  balanceDue: number;
  status: InvoiceStatus;
  contractId: number;
  memberId: string;
  memberName: string;
}

export const mockMembers: MockMemberSummary[] = [
  { id: 'm-1234', firstName: 'Jean', lastName: 'Dupont', currentPlan: 'Premium', status: 'Active', homeClub: 'Brussels', email: 'jean@example.com', mobilePhone: '+32 471 12 34 56', lastVisitDate: 'Yesterday, 18:30', totalVisits: 142, riskScore: 22 },
  { id: 'm-1235', firstName: 'Marie', lastName: 'Martin', currentPlan: 'VIP', status: 'Active', homeClub: 'Namur', email: 'marie@example.com', mobilePhone: '+32 472 23 45 67', lastVisitDate: 'Today, 09:15', totalVisits: 85, riskScore: 31 },
  { id: 'm-1236', firstName: 'Luc', lastName: 'Petit', currentPlan: 'Premium', status: 'Suspended', homeClub: 'Brussels', email: 'luc@example.com', mobilePhone: '+32 473 34 56 78', lastVisitDate: '3 months ago', totalVisits: 24, riskScore: 79 },
  { id: 'm-1237', firstName: 'Sophie', lastName: 'Dubois', currentPlan: 'VIP', status: 'Active', homeClub: 'Liege', email: 'sophie@example.com', mobilePhone: '+32 474 45 67 89', lastVisitDate: 'Yesterday, 12:00', totalVisits: 231, riskScore: 18 },
  { id: 'm-1238', firstName: 'Pierre', lastName: 'Lefevre', currentPlan: 'Basic', status: 'Active', homeClub: 'Brussels', email: 'pierre@example.com', mobilePhone: '+32 475 56 78 90', lastVisitDate: '2 days ago', totalVisits: 45, riskScore: 34 },
  { id: 'm-1239', firstName: 'Julie', lastName: 'Moreau', currentPlan: 'Premium', status: 'Active', homeClub: 'Namur', email: 'julie@example.com', mobilePhone: '+32 476 67 89 01', lastVisitDate: 'Today, 07:45', totalVisits: 112, riskScore: 27 },
  { id: 'm-1240', firstName: 'Antoine', lastName: 'Laurent', currentPlan: 'Basic', status: 'Suspended', homeClub: 'Liege', email: 'antoine@example.com', mobilePhone: '+32 477 78 90 12', lastVisitDate: '1 month ago', totalVisits: 12, riskScore: 72 },
  { id: 'm-1241', firstName: 'Claire', lastName: 'Simon', currentPlan: 'VIP', status: 'Active', homeClub: 'Brussels', email: 'claire@example.com', mobilePhone: '+32 478 89 01 23', lastVisitDate: 'Yesterday, 19:20', totalVisits: 304, riskScore: 15 },
  { id: 'm-1242', firstName: 'Thomas', lastName: 'Michel', currentPlan: 'Premium', status: 'Active', homeClub: 'Namur', email: 'thomas@example.com', mobilePhone: '+32 479 90 12 34', lastVisitDate: '4 days ago', totalVisits: 67, riskScore: 44 },
  { id: 'm-1243', firstName: 'Celine', lastName: 'Bernard', currentPlan: 'Basic', status: 'Active', homeClub: 'Liege', email: 'celine@example.com', mobilePhone: '+32 480 01 23 45', lastVisitDate: '1 week ago', totalVisits: 38, riskScore: 56 },
  { id: 'm-1244', firstName: 'Marc', lastName: 'Leroy', currentPlan: null, status: 'Anonymized', homeClub: null, email: 'anonymized@example.com', mobilePhone: undefined, lastVisitDate: null, totalVisits: 0, riskScore: 0 },
  { id: 'm-1245', firstName: 'Elodie', lastName: 'Roux', currentPlan: 'VIP', status: 'Suspended', homeClub: 'Namur', email: 'elodie@example.com', mobilePhone: '+32 482 23 45 67', lastVisitDate: '2 months ago', totalVisits: 189, riskScore: 85 },
  { id: 'm-1246', firstName: 'Nicolas', lastName: 'David', currentPlan: 'Basic', status: 'Active', homeClub: 'Liege', email: 'nicolas@example.com', mobilePhone: '+32 483 34 56 78', lastVisitDate: 'Yesterday, 17:00', totalVisits: 54, riskScore: 29 },
];

export const mockContracts: MockContractSummary[] = [
  { id: 1, memberName: 'Jean Dupont', memberId: 'm-1234', planName: 'Premium', status: 'Active', startDate: '2025-01-01', endDate: null, homeClub: 'Brussels', type: 'OpenEnded' },
  { id: 2, memberName: 'Jean Dupont', memberId: 'm-1234', planName: 'Basic', status: 'Expired', startDate: '2024-01-01', endDate: '2024-12-31', homeClub: 'Brussels', type: 'FixedTerm' },
  { id: 3, memberName: 'Luc Petit', memberId: 'm-1236', planName: 'Premium', status: 'Suspended', startDate: '2025-03-01', endDate: null, homeClub: 'Brussels', type: 'OpenEnded' },
  { id: 4, memberName: 'Marie Martin', memberId: 'm-1235', planName: 'VIP', status: 'Active', startDate: '2025-02-15', endDate: '2026-02-14', homeClub: 'Namur', type: 'FixedTerm' },
  { id: 5, memberName: 'Sophie Dubois', memberId: 'm-1237', planName: 'VIP', status: 'Active', startDate: '2025-01-10', endDate: null, homeClub: 'Liege', type: 'OpenEnded' },
  { id: 6, memberName: 'Antoine Laurent', memberId: 'm-1240', planName: 'Basic', status: 'Cancelled', startDate: '2024-06-01', endDate: '2024-10-15', homeClub: 'Liege', type: 'FixedTerm' },
  { id: 7, memberName: 'Pierre Lefevre', memberId: 'm-1238', planName: 'Basic', status: 'Active', startDate: '2025-01-20', endDate: null, homeClub: 'Brussels', type: 'OpenEnded' },
  { id: 8, memberName: 'Julie Moreau', memberId: 'm-1239', planName: 'Premium', status: 'Active', startDate: '2024-11-05', endDate: null, homeClub: 'Namur', type: 'OpenEnded' },
  { id: 9, memberName: 'Claire Simon', memberId: 'm-1241', planName: 'VIP', status: 'Active', startDate: '2024-08-12', endDate: null, homeClub: 'Brussels', type: 'OpenEnded' },
  { id: 10, memberName: 'Thomas Michel', memberId: 'm-1242', planName: 'Premium', status: 'Active', startDate: '2025-02-01', endDate: null, homeClub: 'Namur', type: 'OpenEnded' },
  { id: 11, memberName: 'Celine Bernard', memberId: 'm-1243', planName: 'Basic', status: 'Active', startDate: '2025-03-01', endDate: null, homeClub: 'Liege', type: 'OpenEnded' },
  { id: 12, memberName: 'Elodie Roux', memberId: 'm-1245', planName: 'VIP', status: 'Suspended', startDate: '2024-10-10', endDate: null, homeClub: 'Namur', type: 'OpenEnded' },
  { id: 13, memberName: 'Nicolas David', memberId: 'm-1246', planName: 'Basic', status: 'Active', startDate: '2025-01-18', endDate: null, homeClub: 'Liege', type: 'OpenEnded' },
];

const memberById = new Map(mockMembers.map((member) => [member.id, member]));
const contractById = new Map(mockContracts.map((contract) => [contract.id, contract]));

export const mockInvoices: MockInvoiceSummary[] = [
  { id: 1, invoiceNumber: 'INV-2026-001', issuedOn: '2026-03-01', dueDate: '2026-03-15', amountInclTax: 49.99, amountPaid: 49.99, balanceDue: 0, status: 'Paid', contractId: 1, memberId: 'm-1234', memberName: 'Jean Dupont' },
  { id: 2, invoiceNumber: 'INV-2026-002', issuedOn: '2026-03-01', dueDate: '2026-03-15', amountInclTax: 89.99, amountPaid: 0, balanceDue: 89.99, status: 'Overdue', contractId: 3, memberId: 'm-1236', memberName: 'Luc Petit' },
  { id: 3, invoiceNumber: 'INV-2026-003', issuedOn: '2026-03-10', dueDate: '2026-04-01', amountInclTax: 79.00, amountPaid: 0, balanceDue: 79.00, status: 'Issued', contractId: 4, memberId: 'm-1235', memberName: 'Marie Martin' },
  { id: 4, invoiceNumber: 'INV-2026-004', issuedOn: '2026-02-01', dueDate: '2026-02-15', amountInclTax: 49.99, amountPaid: 49.99, balanceDue: 0, status: 'Paid', contractId: 1, memberId: 'm-1234', memberName: 'Jean Dupont' },
  { id: 5, invoiceNumber: 'INV-2026-005', issuedOn: '2026-03-12', dueDate: '2026-04-01', amountInclTax: 59.99, amountPaid: 25.00, balanceDue: 34.99, status: 'PartiallyPaid', contractId: 5, memberId: 'm-1237', memberName: 'Sophie Dubois' },
  { id: 6, invoiceNumber: 'INV-2026-006', issuedOn: '2026-03-15', dueDate: '2026-04-15', amountInclTax: 29.99, amountPaid: 0, balanceDue: 29.99, status: 'Draft', contractId: 6, memberId: 'm-1240', memberName: 'Antoine Laurent' },
];

export const mockMemberIds = mockMembers.map((member) => member.id);

export function getMockMemberById(memberId: string): MockMemberSummary | undefined {
  return memberById.get(memberId);
}

export function getMockContractsByMemberId(memberId: string): MockContractSummary[] {
  return mockContracts.filter((contract) => contract.memberId === memberId);
}

export function getMockContractById(contractId: number): MockContractSummary | undefined {
  return contractById.get(contractId);
}

export function getMockInvoiceById(invoiceId: number): MockInvoiceSummary | undefined {
  return mockInvoices.find((invoice) => invoice.id === invoiceId);
}

export function getMockMemberNameByContractId(contractId: number): string {
  return getMockContractById(contractId)?.memberName ?? '—';
}

export function getMockMemberIdByContractId(contractId: number): string {
  return getMockContractById(contractId)?.memberId ?? '';
}
