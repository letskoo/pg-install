"use client";

import { useLeadFlow } from "@/components/lead-flow/leadFlowContext";

export default function BottomCTA() {
  const { openLeadFlow } = useLeadFlow();

  const handleClick = () => {
    console.log("CTA click - opening lead flow");
    openLeadFlow();
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pointer-events-auto"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="px-5 py-2">
        <button
          type="button"
          onClick={handleClick}
          className="w-full h-12 flex items-center justify-center rounded-xl bg-[#ff7a00] text-base font-bold text-white hover:bg-[#ff8c1a] transition-colors cursor-pointer active:scale-[0.98] border-0"
          style={{ pointerEvents: "auto" }}
        >
          창업 문의하기
        </button>
      </div>
    </div>
  );
}
