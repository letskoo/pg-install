"use client";

export default function FixedCtaButton() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-[88px] bg-white border-t border-black/10">
      <div className="flex h-full items-center">
        <button
          type="button"
          disabled
          className="mx-4 flex h-14 w-full items-center justify-center rounded-[12px] bg-[#ff7a00] text-base font-bold text-white cursor-not-allowed opacity-60"
        >
          창업 문의하기
        </button>
      </div>
    </div>
  );
}
