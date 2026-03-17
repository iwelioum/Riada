export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Members
export interface MemberSummary {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  homeClub?: string | null;
  currentPlan?: string | null;
  lastVisitDate?: string | null;
  totalVisits: number;
  mobilePhone?: string | null;
  primaryGoal?: string | null;
  marketingConsent?: boolean;
}

export interface ContractSummary {
  id: number;
  planName: string;
  homeClub: string;
  startDate: string;
  endDate?: string | null;
  contractType: string;
  status: string;
  freezeStartDate?: string | null;
  freezeEndDate?: string | null;
  options: string[];
}

export interface MemberDetail extends MemberSummary {
  gender: string;
  dateOfBirth: string;
  nationality: string;
  mobilePhone?: string | null;
  primaryGoal?: string | null;
  acquisitionSource?: string | null;
  gdprConsentAt: string;
  marketingConsent: boolean;
  medicalCertificateProvided?: boolean;
  contracts: ContractSummary[];
}

// Backwards-compatible alias used by legacy components
export type Member = MemberSummary;

export interface CreateMemberPayload {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  nationality?: string;
  mobilePhone?: string;
  addressStreet?: string;
  addressCity?: string;
  addressPostalCode?: string;
  referralMemberId?: number;
  primaryGoal?: string;
  acquisitionSource?: string;
  medicalCertificateProvided?: boolean;
  marketingConsent?: boolean;
}

export interface UpdateMemberPayload {
  firstName?: string;
  lastName?: string;
  gender?: string;
  nationality?: string;
  mobilePhone?: string;
  addressStreet?: string;
  addressCity?: string;
  addressPostalCode?: string;
  primaryGoal?: string;
  acquisitionSource?: string;
}

export interface CreateContractPayload {
  memberId: number;
  planId: number;
  homeClubId: number;
  contractType: string;
  startDate: string;
  endDate?: string | null;
}

export interface ContractLifecycleResponse {
  success: boolean;
  message: string;
}

// Courses / Sessions
export interface Session {
  id: number;
  courseId: number;
  courseName: string;
  activityType?: string | null;
  instructorName: string;
  clubName: string;
  startsAt: string;
  durationMinutes: number;
  enrolledCount: number;
  maxCapacity: number;
  occupancyPercent: number;
}

export type ClassSession = Session;

export interface Course {
  id: number;
  courseName: string;
  description?: string | null;
  difficultyLevel: string;
  durationMinutes: number;
  maxCapacity: number;
  estimatedCalories?: number | null;
  activityType?: string | null;
}

// Billing
export interface InvoiceLine {
  description: string;
  lineType: string;
  quantity: number;
  unitPriceExclTax: number;
  lineAmountInclTax: number;
}

export interface InvoicePayment {
  id: number;
  paidAt: string;
  amount: number;
  status: string;
  paymentMethod: string;
  transactionReference?: string | null;
}

export interface InvoiceDetail {
  id: number;
  invoiceNumber: string;
  issuedOn: string;
  dueDate: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  amountExclTax: number;
  vatRate: number;
  vatAmount: number;
  amountInclTax: number;
  amountPaid: number;
  balanceDue: number;
  status: string;
  lines: InvoiceLine[];
  payments: InvoicePayment[];
}

export interface RecordPaymentPayload {
  invoiceId: number;
  amount: number;
  paymentMethod: string;
  transactionReference?: string;
  errorCode?: string;
}

export interface RecordPaymentResponse {
  id: number;
  invoiceId: number;
  amount: number;
  paymentMethod: string;
  transactionReference?: string | null;
  paidAt: string;
  status: string;
}

export interface GenerateInvoicePayload {
  contractId: number;
}

export interface GenerateInvoiceResponse {
  message: string;
  invoiceId?: number | null;
  invoiceNumber?: string | null;
}

// Equipment
export interface EquipmentItem {
  id: number;
  name: string;
  equipmentType: string;
  status: string;
  clubId: number;
  acquisitionYear: number;
}

export type Equipment = EquipmentItem;

export interface CreateMaintenanceTicketPayload {
  equipmentId: number;
  priority: string;
  description: string;
}

export interface UpdateTicketStatusPayload {
  status: string;
  resolvedAt?: string;
}

// Access Control
export interface AccessCheckRequest {
  memberId?: number;
  guestId?: number;
  companionMemberId?: number;
  clubId: number;
}

export interface AccessCheckResponse {
  decision: string;
  denialReason?: string | null;
}

// Analytics
export interface RiskScore {
  memberId: number;
  memberName: string;
  planName: string;
  overdueInvoiceCount: number;
  deniedAccess60d: number;
  riskScore: number;
  score: number;
}

export interface ClubFrequency {
  clubId: number;
  clubName: string;
  visitorCount: number;
  averageVisitsPerMember: number;
}

export interface OptionPopularity {
  optionId: number;
  optionName: string;
  subscriptionCount: number;
  popularityPercentage: number;
}

export interface SystemHealth {
  isHealthy: boolean;
  status: string;
  totalMembers: number;
  activeContracts: number;
  pendingInvoices: number;
}

// Clubs / Plans / Guests
export interface ClubSummary {
  id: number;
  name: string;
  addressCity?: string;
  operationalStatus?: string;
  isOpen247?: boolean;
}

export interface ClubDashboard {
  id: number;
  name: string;
  addressStreet?: string;
  addressCity?: string;
  addressPostalCode?: string;
  operationalStatus?: string;
  employeeCount: number;
  equipmentCount: number;
}

export interface SubscriptionPlan {
  id: number;
  planName: string;
  basePrice: number;
  commitmentMonths: number;
  enrollmentFee: number;
  limitedClubAccess: boolean;
  duoPassAllowed: boolean;
}

export interface SubscriptionPlanOption {
  id: number;
  optionName: string;
  monthlyPrice: number;
}

export interface Guest {
  id: number;
  firstName: string;
  lastName: string;
  status: string;
  email?: string | null;
  dateOfBirth?: string | null;
  sponsorMemberId?: number | null;
  sponsorName?: string | null;
}

// Employees
export interface EmployeeSummary {
  id: number;
  lastName: string;
  firstName: string;
  email: string;
  role: string;
  clubId: number;
  clubName: string;
  hiredOn: string;
}

export interface EmployeeDetail extends EmployeeSummary {
  monthlySalary?: number | null;
  qualifications?: string | null;
  createdAt: string;
}

export interface CreateEmployeePayload {
  lastName: string;
  firstName: string;
  email: string;
  role: string;
  clubId: number;
  monthlySalary?: number | null;
  qualifications?: string | null;
  hiredOn: string;
}

export interface UpdateEmployeePayload {
  lastName?: string;
  firstName?: string;
  email?: string;
  role?: string;
  clubId?: number;
  monthlySalary?: number | null;
  qualifications?: string | null;
}

// Access Log
export interface AccessLogEntry {
  id: number;
  isGuest: boolean;
  personId: number;
  personName: string;
  clubId: number;
  clubName: string;
  accessedAt: string;
  accessStatus: string;
  denialReason?: string | null;
}
