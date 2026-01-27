"use client";

import React, { useState, useCallback } from "react";
import LeadFlowContext, { LeadFlowContextType } from "./leadFlowContext";
import LeadFlow from "./LeadFlow";

interface LeadFlowProviderProps {
  children: React.ReactNode;
}

export default function LeadFlowProvider({ children }: LeadFlowProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [statsVersion, setStatsVersion] = useState(0);

  const refreshStats = useCallback(() => {
    console.log("LeadFlowProvider: refreshStats() called");
    setStatsVersion((v) => v + 1);
  }, []);

  const value: LeadFlowContextType = {
    isOpen,
    statsVersion,
    openLeadFlow: () => {
      console.log("LeadFlowProvider: openLeadFlow() called");
      setIsOpen(true);
    },
    closeLeadFlow: () => {
      console.log("LeadFlowProvider: closeLeadFlow() called");
      setIsOpen(false);
    },
    refreshStats,
  };

  return (
    <LeadFlowContext.Provider value={value}>
      {children}
      <LeadFlow isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </LeadFlowContext.Provider>
  );
}
