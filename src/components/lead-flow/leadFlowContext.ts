import React, { createContext, useContext, useState } from "react";

export interface LeadFlowContextType {
  isOpen: boolean;
  openLeadFlow: () => void;
  closeLeadFlow: () => void;
  statsVersion: number;
  refreshStats: () => void;
}

const LeadFlowContext = createContext<LeadFlowContextType | undefined>(
  undefined
);

export function useLeadFlow() {
  const context = useContext(LeadFlowContext);
  if (!context) {
    throw new Error(
      "useLeadFlow must be used within LeadFlowProvider. Make sure LeadFlowProvider wraps your component tree in app/layout.tsx"
    );
  }
  return context;
}

export default LeadFlowContext;
