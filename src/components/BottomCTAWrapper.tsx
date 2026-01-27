"use client";

import { useState } from "react";
import BottomCTA from "./BottomCTA";
import LeadFlow from "./lead-flow/LeadFlow";

export default function BottomCTAWrapper() {
  const [isLeadFlowOpen, setIsLeadFlowOpen] = useState(false);

  return (
    <>
      <BottomCTA onOpenLeadFlow={() => setIsLeadFlowOpen(true)} />
      <LeadFlow isOpen={isLeadFlowOpen} onClose={() => setIsLeadFlowOpen(false)} />
    </>
  );
}
