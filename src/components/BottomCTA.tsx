"use client";

import { useCallback } from "react";

export default function BottomCTA() {
  const handleClick = useCallback(() => {
    window.open("/lead", "_blank", "noopener,noreferrer");
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="px-5 py-3">
        <button
          type="button"
          onClick={handleClick}
          className="w-full h-14 flex items-center justify-center rounded-xl bg-[#ff7a00] text-base font-bold text-white"
        >
          신청하기
        </button>
      </div>
    </div>
  );
}
