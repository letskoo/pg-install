"use client";

import React, { useEffect, useState } from "react";
import styles from "./ConsentSheet.module.css";
import { FormDataType, ConsentCheckboxes } from "./types";

interface BottomSheetConsentProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  checkboxes: ConsentCheckboxes;
  onCheckboxChange: (key: keyof ConsentCheckboxes, value: boolean) => void;
  isLoading: boolean;
}

export default function BottomSheetConsent({
  isOpen,
  onClose,
  onConfirm,
  checkboxes,
  onCheckboxChange,
  isLoading,
}: BottomSheetConsentProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // 애니메이션 시간(ms)
  const transitionDuration = 280;

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      // 다음 렌더 사이클에서 보이게 설정해 슬라이드 업
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
      const timeout = setTimeout(() => setIsMounted(false), transitionDuration);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, transitionDuration]);

  if (!isMounted) return null;

  const allChecked =
    checkboxes.personalDataCollection &&
    checkboxes.personalDataThirdParty &&
    checkboxes.personalDataCompany;

  const handleCheckAll = () => {
    const newValue = !allChecked;
    onCheckboxChange("personalDataCollection", newValue);
    onCheckboxChange("personalDataThirdParty", newValue);
    onCheckboxChange("personalDataCompany", newValue);
  };

  const handleCheckboxChange = (key: keyof ConsentCheckboxes) => {
    onCheckboxChange(key, !checkboxes[key]);
  };

  return (
    <>
      {/* 반투명 배경 */}
      <div
        className={`${styles.overlay} ${isVisible ? styles.visible : ""}`}
        onClick={onClose}
      />

      {/* 바텀시트 */}
      <div
        className={`${styles.sheet} ${isVisible ? styles.visible : ""}`}
      >
        <div className="bg-white rounded-t-2xl shadow-lg max-h-[80vh] overflow-y-auto">
          {/* 헤더 */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 rounded-t-2xl">
            <h2 className="text-[18px] font-bold text-gray-900">
              신청을 위해 정보 동의를 해주세요
            </h2>
          </div>

          {/* 콘텐츠 */}
          <div className="px-4 py-4 space-y-4">
            {/* 모두 동의 */}
            <div className="border-b border-gray-200 pb-4">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={handleCheckAll}
                  className="sr-only"
                />
                <span
                  className={`${styles.checkboxBox} ${allChecked ? styles.checkboxChecked : ""}`}
                  aria-hidden
                >
                  <svg
                    className={`${styles.checkIcon} ${allChecked ? "opacity-100" : "opacity-0"}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-[15px] font-semibold text-gray-900">
                  모두 동의
                </span>
              </label>
            </div>

            {/* 개별 동의 항목들 */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checkboxes.personalDataCollection}
                  onChange={() =>
                    handleCheckboxChange("personalDataCollection")
                  }
                  className="sr-only"
                />
                <span
                  className={`${styles.checkboxBox} ${checkboxes.personalDataCollection ? styles.checkboxChecked : ""}`}
                  aria-hidden
                >
                  <svg
                    className={`${styles.checkIcon} ${checkboxes.personalDataCollection ? "opacity-100" : "opacity-0"}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-[14px] text-gray-700 leading-relaxed">
                  <span className="font-semibold">(필수)</span> 개인정보 수집 및
                  이용 동의
                  <br />
                  <span className="text-[12px] text-gray-500">(당근마켓)</span>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checkboxes.personalDataThirdParty}
                  onChange={() =>
                    handleCheckboxChange("personalDataThirdParty")
                  }
                  className="sr-only"
                />
                <span
                  className={`${styles.checkboxBox} ${checkboxes.personalDataThirdParty ? styles.checkboxChecked : ""}`}
                  aria-hidden
                >
                  <svg
                    className={`${styles.checkIcon} ${checkboxes.personalDataThirdParty ? "opacity-100" : "opacity-0"}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-[14px] text-gray-700 leading-relaxed">
                  <span className="font-semibold">(필수)</span> 개인정보 제3자
                  제공 동의
                  <br />
                  <span className="text-[12px] text-gray-500">
                    (당근마켓 → 주식회사 큰집컴퍼니)
                  </span>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={checkboxes.personalDataCompany}
                  onChange={() => handleCheckboxChange("personalDataCompany")}
                  className="sr-only"
                />
                <span
                  className={`${styles.checkboxBox} ${checkboxes.personalDataCompany ? styles.checkboxChecked : ""}`}
                  aria-hidden
                >
                  <svg
                    className={`${styles.checkIcon} ${checkboxes.personalDataCompany ? "opacity-100" : "opacity-0"}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-[14px] text-gray-700 leading-relaxed">
                  <span className="font-semibold">(필수)</span> 개인정보 수집 및
                  이용 동의
                  <br />
                  <span className="text-[12px] text-gray-500">
                    (주식회사 큰집컴퍼니)
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <button
              onClick={onConfirm}
              disabled={!allChecked || isLoading}
              className={`w-full h-12 rounded-xl font-bold text-[15px] transition-colors ${
                allChecked && !isLoading
                  ? "bg-[#ff7a00] text-white hover:bg-[#ff8c1a] active:scale-[0.98]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isLoading ? "처리 중…" : "동의하고 신청 완료하기"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
