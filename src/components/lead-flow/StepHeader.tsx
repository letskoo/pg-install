"use client";

import React from "react";

interface StepHeaderProps {
  currentStep: 1 | 2;
  onBack: () => void;
}

export default function StepHeader({ currentStep, onBack }: StepHeaderProps) {
  const progress = (currentStep / 2) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-white">
      <div className="px-4 pt-3 pb-3 border-b border-gray-200">
        {/* 뒤로가기 + 진행 상태 (텍스트는 화면에서 숨김 처리) */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="뒤로가기"
          >
            <svg
              className="w-5 h-5 text-gray-900"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <span className="sr-only">
            {currentStep}/2
          </span>
        </div>

        {/* 진행바 (단일 페이지 전환으로 숨김 처리) */}
        <div className="hidden w-full h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#ff7a00] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
