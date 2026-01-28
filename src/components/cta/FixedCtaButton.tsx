"use client";

import { useLeadFlow } from "@/components/lead-flow/leadFlowContext";

export default function FixedCtaButton() {
  const { openLeadFlow } = useLeadFlow();

  const handleClick = () => {
    console.log("CTA click - opening lead flow");
    openLeadFlow();
  };

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-black/10"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="px-4 py-3">
        <div className="max-w-[640px] mx-auto">
          <button
            type="button"
            onClick={handleClick}
            className="w-full h-14 flex items-center justify-center rounded-[12px] bg-[#ff7a00] text-base font-bold text-white hover:bg-[#ff8c1a] transition-colors active:scale-[0.98]"
          >
            신청하기
          </button>
        </div>
      </div>
    </div>
  );
}
