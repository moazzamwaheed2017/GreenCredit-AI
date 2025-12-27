
import { GoogleGenAI, Type } from "@google/genai";
import { 
  BorrowerInput, 
  NormalizedData, 
  FinancialRiskResponse, 
  SustainabilityRiskResponse, 
  DecisionResponse, 
  UpliftPlan, 
  ClimateScenario, 
  ReviewSummary 
} from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelName = 'gemini-3-flash-preview';

export const normalizeData = async (input: BorrowerInput): Promise<NormalizedData> => {
  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Normalize the following borrower input into a numerical feature set (0-100 scale). 
    Input features like revenue (${input.revenue}), debt ratio (${input.debtToIncomeRatio}%), 
    carbon intensity (${input.carbonIntensity}/100), and labor compliance (${input.laborCompliance}/100) 
    should be mapped to standard risk weights. Full Input: ${JSON.stringify(input)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          financial: {
            type: Type.OBJECT,
            properties: {
              revenueScore: { type: Type.NUMBER },
              cashFlowStability: { type: Type.NUMBER },
              debtRatio: { type: Type.NUMBER },
              creditScore: { type: Type.NUMBER },
            },
            required: ["revenueScore", "cashFlowStability", "debtRatio", "creditScore"]
          },
          sustainability: {
            type: Type.OBJECT,
            properties: {
              energyCleanliness: { type: Type.NUMBER },
              carbonEfficiency: { type: Type.NUMBER },
              laborEthics: { type: Type.NUMBER },
              regulatoryRisk: { type: Type.NUMBER },
            },
            required: ["energyCleanliness", "carbonEfficiency", "laborEthics", "regulatoryRisk"]
          }
        },
        required: ["financial", "sustainability"]
      }
    }
  });
  return JSON.parse(response.text);
};

export const assessFinancialRisk = async (data: NormalizedData): Promise<FinancialRiskResponse> => {
  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Assess financial risk for the following features: ${JSON.stringify(data.financial)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          band: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
          breakdown: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                value: { type: Type.NUMBER }
              }
            }
          },
          summary: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(response.text);
};

export const assessSustainabilityRisk = async (data: NormalizedData): Promise<SustainabilityRiskResponse> => {
  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Assess sustainability risk and SDG contribution (1-17) for the following: ${JSON.stringify(data.sustainability)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          sdgs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING, description: "SDG Title or Indicator" },
                A: { type: Type.NUMBER, description: "Score 0-100" },
                fullMark: { type: Type.NUMBER }
              }
            }
          },
          impactDescription: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(response.text);
};

export const getDecision = async (financial: FinancialRiskResponse, sustainability: SustainabilityRiskResponse): Promise<DecisionResponse> => {
  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Make a GreenCredit loan decision. Financial Score: ${financial.score}, Sustainability Score: ${sustainability.score}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          greenCreditScore: { type: Type.NUMBER },
          status: { type: Type.STRING, enum: ["Green Approved", "Conditional", "Rejected"] },
          justification: { type: Type.STRING },
          aprAdjustment: { type: Type.STRING }
        }
      }
    }
  });
  return JSON.parse(response.text);
};

export const planUplift = async (current: SustainabilityRiskResponse): Promise<UpliftPlan> => {
  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Suggest sustainability improvements. Current Score: ${current.score}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          currentScore: { type: Type.NUMBER },
          projectedScore: { type: Type.NUMBER },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                action: { type: Type.STRING },
                impact: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text);
};

export const simulateClimate = async (financial: FinancialRiskResponse, sustainability: SustainabilityRiskResponse): Promise<ClimateScenario[]> => {
  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Simulate 4 climate scenarios (Net Zero 2050, Stalled Transition, Hot House World, Policy Shift) for this borrower. Base scores: Fin=${financial.score}, Sust=${sustainability.score}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            scenario: { type: Type.STRING },
            financialImpact: { type: Type.NUMBER },
            sustainabilityImpact: { type: Type.NUMBER },
            totalScore: { type: Type.NUMBER }
          }
        }
      }
    }
  });
  return JSON.parse(response.text);
};

export const getReview = async (history: any): Promise<ReviewSummary> => {
  const response = await ai.models.generateContent({
    model: modelName,
    contents: `Provide a human review summary for a loan officer based on the full credit report history: ${JSON.stringify(history)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          keyDrivers: { type: Type.ARRAY, items: { type: Type.STRING } },
          ethicalConsiderations: { type: Type.STRING },
          suggestedNextSteps: { type: Type.STRING },
          riskHighlights: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ["Warning", "Info", "Success"] },
                message: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(response.text);
};
