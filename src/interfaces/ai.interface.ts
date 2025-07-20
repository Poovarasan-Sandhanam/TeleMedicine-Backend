// src/interfaces/ai.interface.ts

export interface SymptomCheckRequest {
  symptoms: string;
}

export interface SymptomCheckResponse {
  possible_conditions: string[];
  recommended_doctor: string;
}