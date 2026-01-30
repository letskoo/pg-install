"use client";

import React, { useState } from "react";
import styles from "./ConsentSheet.module.css";

interface ConsentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  detailType: "personalDataCollection" | "personalDataThirdParty" | "personalDataCompany" | null;
}

const detailContent = {
  personalDataCollection: {
    title: "개인정보 수집 및 이용 안내",
    subtitle: "개인정보 수집 및 이용 안내 (메타페이)",
    body: `1. 수집 항목
- 이름, 연락처(전화번호), 지역, 문의 내용

2. 수집·이용 목적
- 포토그루브 프로그램 설치 및 렌탈 상담
- 문의 내용 확인 및 상담 안내 연락

3. 보유 및 이용 기간
- 문의 접수일로부터 1년 이내 (목적 달성 시 즉시 파기)

4. 동의 거부 권리 및 불이익
- 동의를 거부할 수 있으나, 거부 시 상담/문의 접수가 제한될 수 있습니다.`,
  },
  personalDataThirdParty: {
    title: "개인정보 제3자 제공 안내",
    subtitle: "개인정보 제3자 제공 안내",
    body: `- 메타페이는 이용자의 개인정보를 제3자에게 제공하지 않습니다.
- 단, 법령에 따라 제출 의무가 발생하는 경우에는 예외적으로 제공될 수 있습니다.`,
  },
  personalDataCompany: {
    title: "개인정보 처리방침 요약",
    subtitle: "개인정보 처리방침 요약",
    body: `- 개인정보는 상담 목적을 위해서만 이용됩니다.
- 보관 기간 경과 또는 목적 달성 시 지체 없이 파기합니다.
- 개인정보 보호 관련 문의: kiwankoo@gmail.com`,
  },
};

export default function ConsentDetailModal({
  isOpen,
  onClose,
  detailType,
}: ConsentDetailModalProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);

  const transitionDuration = 300;

  React.useEffect(() => {
    let rafId1: number | null = null;
    let rafId2: number | null = null;

    if (isOpen) {
      setIsMounted(true);
      rafId1 = requestAnimationFrame(() => {
        rafId2 = requestAnimationFrame(() => setIsVisible(true));
      });
    } else {
      setIsVisible(false);
      const timeout = setTimeout(() => setIsMounted(false), transitionDuration);
      return () => {
        clearTimeout(timeout);
        if (rafId1 !== null) cancelAnimationFrame(rafId1);
        if (rafId2 !== null) cancelAnimationFrame(rafId2);
      };
    }

    return () => {
      if (rafId1 !== null) cancelAnimationFrame(rafId1);
      if (rafId2 !== null) cancelAnimationFrame(rafId2);
    };
  }, [isOpen, transitionDuration]);

  if (!isMounted || !detailType) return null;

  const content = detailContent[detailType];

  return (
    <>
      {/* 반투명 배경 */}
      <div
        className={`${styles.overlay} ${isVisible ? styles.overlayVisible : ""}`}
        onClick={onClose}
      />

      {/* 모달 */}
      <div
        className={`${styles.sheet} ${isVisible ? styles.sheetVisible : ""}`}
      >
        <div className="bg-white rounded-t-2xl shadow-lg h-[80vh] overflow-hidden max-w-[640px] mx-auto flex flex-col">
          {/* 헤더 */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 rounded-t-2xl">
            <div className="max-w-[640px] mx-auto flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="뒤로가기"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-5 h-5 text-gray-900"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-[16px] font-bold text-gray-900 flex-1">
                {content.title}
              </h2>
            </div>
          </div>

          {/* 콘텐츠 */}
          <div className="px-4 py-4 overflow-y-auto flex-1">
            <div className="max-w-[640px] mx-auto space-y-4">
              <h3 className="text-[14px] font-semibold text-gray-900">
                {content.subtitle}
              </h3>
              <div className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                {content.body}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
