export type ServiceType =
  | "Sunday First Service"
  | "Sunday Second Service"
  | "Midweek Service"
  | "Special Programme"
  | "Prayer Meeting";

export type IncomeType = "Offering" | "Tithe" | "Fundraising" | "BENMP" | "Other";

export interface Member {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  dateJoined: string;
  active: boolean;
  notes: string;
}

export interface Service {
  id: string;
  date: string;
  type: ServiceType;
  title: string;
  preacher: string;
  attendance: number;
  notes: string;
}

export interface MemberContribution {
  memberName: string;
  memberId?: string;
  amount: number;
  note?: string;
}

export interface IncomeRecord {
  id: string;
  date: string;
  type: IncomeType;
  amount: number;
  serviceId?: string;
  recordedBy: string;
  notes: string;
  memberContributions?: MemberContribution[];
}

export const SERVICE_TYPES: ServiceType[] = [
  "Sunday First Service",
  "Sunday Second Service",
  "Midweek Service",
  "Special Programme",
  "Prayer Meeting",
];

export const INCOME_TYPES: IncomeType[] = ["Offering", "Tithe", "Fundraising", "BENMP", "Other"];

export const INCOME_TYPE_COLORS: Record<IncomeType, string> = {
  Offering: "bg-yellow-500/20 text-yellow-700 border-yellow-300",
  Tithe: "bg-green-500/20 text-green-700 border-green-300",
  Fundraising: "bg-blue-500/20 text-blue-700 border-blue-300",
  BENMP: "bg-orange-500/20 text-orange-700 border-orange-300",
  Other: "bg-gray-500/20 text-gray-700 border-gray-300",
};

export const INCOME_TYPE_CHART_COLORS: Record<IncomeType, string> = {
  Offering: "#EAB308",
  Tithe: "#22C55E",
  Fundraising: "#3B82F6",
  BENMP: "#F97316",
  Other: "#6B7280",
};
