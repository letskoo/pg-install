"use client";

import { useLeadFlow } from "@/components/lead-flow/leadFlowContext";

export default function FixedCtaButton() {
  const { openLeadFlow } = useLeadFlow();

  const handleClick = () => {
    console.log("CTA click - opening lead flow");
    openLeadFlow();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-[88px] bg-white border-t border-black/10 pointer-events-auto">
      <div className="flex h-full items-center">
        <button
          type="button"
          onClick={handleClick}
          className="mx-4 flex h-14 w-full items-center justify-center rounded-[12px] bg-[#ff7a00] text-base font-bold text-white hover:bg-[#ff8c1a] transition-colors cursor-pointer active:scale-[0.98]"
          style={{ pointerEvents: "auto" }}
        >
          창업 문의하기
        </button>
      </div>
    </div>
  );
}
