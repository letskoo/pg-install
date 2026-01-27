"use client";

export default function BottomCTA() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="px-5 py-2">
        <button
          type="button"
          disabled
          className="w-full h-12 flex items-center justify-center rounded-xl bg-[#ff7a00] text-base font-bold text-white cursor-not-allowed opacity-60"
        >
          신청하기
        </button>
      </div>
    </div>
  );
}
