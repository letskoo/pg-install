"use client";

import { useState, useEffect } from "react";

export default function InfoCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  return (
    <>
      <div className="mx-4 mb-0.5 p-4 bg-gray-50 rounded-xl">
        <div className="grid gap-y-2.5 gap-x-3" style={{ gridTemplateColumns: '70px 1fr' }}>
          {/* Row 1: 신청항목 */}
          <span className="text-[12px] text-gray-500">신청항목</span>
          <span className="text-[13px] font-semibold text-gray-900">바나타이거 창업상담</span>

          {/* Row 2: 상호명 */}
          <span className="text-[12px] text-gray-500">상호명</span>
          <span className="text-[13px] font-semibold text-gray-900">주식회사맥스원이링크</span>

          {/* Row 3: 사업자등록증 보기 (라벨 컬럼 비움, 간격 50% 축소) */}
          <span className="-mt-1.5"></span>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-[13px] text-gray-500 underline text-left -mt-1.5"
          >
            사업자등록증 보기
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center overflow-hidden"
          onClick={() => setIsModalOpen(false)}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(false);
            }}
            className="absolute top-4 right-4 z-[10000] flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
            aria-label="닫기"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div 
            className="w-full h-full flex items-center justify-center" 
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src="/images/form/tex.png"
              alt="사업자등록증"
              className="max-w-full max-h-full w-auto h-auto object-contain"
              style={{ maxWidth: '100vw', maxHeight: '100vh' }}
            />
          </div>
        </div>
      )}
    </>
  );
}
