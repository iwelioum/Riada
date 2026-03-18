export interface CreateContractRequest {
  memberId: number;
  planId: number;
  homeClubId: number;
  contractType: "FixedTerm" | "OpenEnded";
  startDate: string;
  endDate: string | null;
  selectedOptionIds?: number[];
}

export interface FreezeContractRequest {
  durationDays: number;
}

export interface ContractLifecycleResponse {
  success: boolean;
  message: string;
}

export type ContractStatus = "Active" | "Suspended" | "Expired" | "Cancelled";
export type ContractType = "FixedTerm" | "OpenEnded";

export interface ContractOption {
  id: number;
  name: string;
  monthlyPrice: number;
}

export interface ContractResponse {
  id: number;
  memberId: number;
  memberFirstName: string;
  memberLastName: string;
  planId: number;
  planName: string;
  homeClubId: number;
  homeClubName: string;
  contractType: ContractType;
  status: ContractStatus;
  startDate: string;
  endDate: string | null;
  freezeStartDate: string | null;
  freezeEndDate: string | null;
  activeOptions: ContractOption[];
  totalPaid: number;
  nextPaymentDate: string | null;
  alerts: string[];
}
