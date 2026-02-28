export interface RiskReason {
  ruleId: string;
  title: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  scoreAdded: number;
}

export interface FrictionConfig {
  type: "NONE" | "TOAST" | "MODAL" | "BLOCK";
  delaySeconds: number;
  canOverride: boolean;
  color: "green" | "yellow" | "red";
}

export interface RiskResult {
  score: number;
  level: "LOW" | "MEDIUM" | "HIGH";
  reasons: RiskReason[];
  recommendedAction: "ALLOW" | "WARN" | "DELAY" | "BLOCK";
  friction: FrictionConfig;
}

export interface Transaction {
  id: string;
  recipientUPI: string;
  recipientName: string;
  amount: number;
  remarks: string;
  timestamp: string;
  status: "completed" | "cancelled" | "blocked";
  riskResult: RiskResult;
}

export interface User {
  id: string;
  name: string;
  upiId: string;
  balance: number;
  trustedContacts: string[];
}
