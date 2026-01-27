"use client";

import React from "react";

interface CompleteScreenProps {
  onConfirm: () => void;
}

export default function CompleteScreen({ onConfirm }: CompleteScreenProps) {
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center px-4 animate-in fade-in duration-300">
      {/* 성공 아이콘 */}
      <div className="mb-6 relative">
        <div className="w-24 h-24 rounded-full bg-[#ff7a00] flex items-center justify-center animate-in scale-in duration-500">
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      </div>

      {/* 텍스트 */}
      <h1 className="text-[28px] font-bold text-gray-900 text-center mb-2">
        신청이 완료 되었어요
      </h1>
      <p className="text-[15px] text-gray-500 text-center mb-12">
        빠른 시간 내에 연락을 드리겠습니다
      </p>

      {/* 확인 버튼 */}
      <button
        onClick={onConfirm}
        className="w-full h-12 rounded-xl bg-[#ff7a00] text-white font-bold text-[15px] hover:bg-[#ff8c1a] transition-colors active:scale-[0.98]"
      >
        확인
      </button>
    </div>
  );
}
