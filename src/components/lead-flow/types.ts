export type LeadFlowStep = 1 | 2;

export interface FormDataType {
  name: string;
  phone: string;
  region: string;
  memo: string;
}

export interface ConsentCheckboxes {
  personalDataCollection: boolean;
  personalDataThirdParty: boolean;
  personalDataCompany: boolean;
}

export type LeadFlowState = "idle" | "step1" | "step2" | "consent" | "loading" | "complete" | "error";
