"use client";

import { useCallback } from "react";

export default function FixedCtaButton() {
  const handleClick = useCallback(() => {
    window.open("/lead", "_blank", "noopener,noreferrer");
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-[88px] bg-white border-t border-black/10">
      <div className="flex h-full items-center">
        <button
          type="button"
          onClick={handleClick}
          className="mx-4 flex h-14 w-full items-center justify-center rounded-[12px] bg-[#ff7a00] text-base font-bold text-white"
        >
          창업 문의하기
        </button>
      </div>
    </div>
  );
}
