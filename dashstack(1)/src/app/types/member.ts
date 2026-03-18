export interface MemberSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: "Active" | "Suspended" | "Anonymized";
  currentPlan: string | null;
  homeClub: string | null;
  lastVisitDate: string | null;
  totalVisits: number;
  riskScore: number;
  mobilePhone?: string;
}

export interface ContractDetail {
  id: number;
  planName: string;
  homeClub: string;
  startDate: string;
  endDate: string | null;
  contractType: "FixedTerm" | "OpenEnded";
  status: "Active" | "Suspended" | "Expired" | "Cancelled";
  freezeStartDate: string | null;
  freezeEndDate: string | null;
  activeOptions: string[];
}

export interface MemberNote {
  author: string;
  date: string;
  text: string;
}

export interface TimelineEvent {
  id: number;
  date: string;
  time: string;
  type: string;
  title: string;
  desc?: string;
  icon: any;
  color: string;
  bg: string;
}

export interface MemberDetailType {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobilePhone: string | null;
  status: "Active" | "Suspended" | "Anonymized";
  gender: "Male" | "Female" | "Unspecified";
  dateOfBirth: string;
  nationality: string;
  addressStreet: string | null;
  addressCity: string | null;
  addressPostalCode: string | null;
  primaryGoal: "WeightLoss" | "MuscleGain" | "Fitness" | "Maintenance" | "Other" | null;
  acquisitionSource: "WebAdvertising" | "SocialMedia" | "WordOfMouth" | "Other" | null;
  medicalCertificateProvided: boolean;
  gdprConsentAt: string;
  marketingConsent: boolean;
  referralMemberName: string | null;
  totalVisits: number;
  lastVisitDate: string | null;
  riskScore: number;
  weeklyFrequency: string;
  engagementLevel: string;
  createdAt: string;
  contracts: ContractDetail[];
  alerts: string[];
  notes: MemberNote[];
  timeline: TimelineEvent[];
  recentVisits: { day: string; visits: number }[];
  pendingInvoicesCount: number;
  totalPaid: number;
  sponsoredMembersCount: number;
}
