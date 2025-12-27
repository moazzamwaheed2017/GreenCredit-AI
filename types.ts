
export interface BorrowerInput {
  businessType: string;
  industry: string;
  revenue: number; // Numeric for slider
  cashFlowStability: number; // Numeric for slider (0-100)
  debtToIncomeRatio: number; // Numeric for slider (0-100)
  creditHistory: string;
  energySource: string;
  carbonIntensity: number; // Numeric for slider (0-100)
  laborCompliance: number; // Numeric for slider (0-100)
  regulatoryIssues: string;
}

export interface NormalizedData {
  financial: {
    revenueScore: number;
    cashFlowStability: number;
    debtRatio: number;
    creditScore: number;
  };
  sustainability: {
    energyCleanliness: number;
    carbonEfficiency: number;
    laborEthics: number;
    regulatoryRisk: number;
  };
}

export interface FinancialRiskResponse {
  score: number;
  band: 'Low' | 'Medium' | 'High';
  breakdown: { name: string; value: number }[];
  summary: string;
}

export interface SustainabilityRiskResponse {
  score: number;
  sdgs: { subject: string; A: number; fullMark: number }[];
  impactDescription: string;
}

export interface DecisionResponse {
  greenCreditScore: number;
  status: 'Green Approved' | 'Conditional' | 'Rejected';
  justification: string;
  aprAdjustment: string;
}

export interface UpliftPlan {
  currentScore: number;
  projectedScore: number;
  recommendations: {
    title: string;
    action: string;
    impact: string;
  }[];
}

export interface ClimateScenario {
  scenario: string;
  financialImpact: number;
  sustainabilityImpact: number;
  totalScore: number;
}

export interface ReviewSummary {
  keyDrivers: string[];
  ethicalConsiderations: string;
  suggestedNextSteps: string;
  riskHighlights: { type: 'Warning' | 'Info' | 'Success'; message: string }[];
}

export enum AppStep {
  Input = 1,
  Normalization = 2,
  FinancialRisk = 3,
  SustainabilityRisk = 4,
  Decision = 5,
  Uplift = 6,
  Simulation = 7,
  Review = 8
}
