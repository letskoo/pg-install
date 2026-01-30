"use client";

import React, { useEffect, useState } from "react";
import styles from "./ConsentSheet.module.css";
import { FormDataType, ConsentCheckboxes } from "./types";
import ConsentDetailModal from "./ConsentDetailModal";

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
  const [detailModal, setDetailModal] = useState<"personalDataCollection" | "personalDataThirdParty" | "personalDataCompany" | null>(null);

  // 애니메이션 시간(ms)
  const transitionDuration = 300;

  useEffect(() => {
    let rafId1: number | null = null;
    let rafId2: number | null = null;

    if (isOpen) {
      setIsMounted(true);
      // 두 프레임에 걸쳐 마운트 후 가시화하여 첫 translateY(100%) 페인트를 보장
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
        className={`${styles.overlay} ${isVisible ? styles.overlayVisible : ""}`}
        onClick={onClose}
      />

      {/* 바텀시트 */}
      <div
        className={`${styles.sheet} ${isVisible ? styles.sheetVisible : ""}`}
      >
        <div className="bg-white rounded-t-2xl shadow-lg max-h-[80vh] overflow-y-auto max-w-[640px] mx-auto">
          {/* 헤더 */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-4 rounded-t-2xl">
            <div className="max-w-[640px] mx-auto">
              <h2 className="text-[18px] font-bold text-gray-900 text-center">
                신청을 위해 정보 동의를 해주세요
              </h2>
            </div>
          </div>

          {/* 콘텐츠 */}
          <div className="py-4 space-y-4">
            <div className="max-w-[640px] mx-auto">
            {/* 모두 동의 */}
            <div className="pb-4 px-4 border-b border-gray-200">
              <label className="flex items-center gap-3 cursor-pointer select-none pl-6">
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
            <div className="space-y-3 px-4">
              <label className="flex items-center gap-3 cursor-pointer select-none min-h-[60px] pt-2 pl-6">
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
                <button
                  type="button"
                  onClick={() => setDetailModal("personalDataCollection")}
                  className="text-left flex-1 hover:opacity-70 transition-opacity"
                >
                  <span className="text-[14px] text-gray-700 leading-relaxed block">
                    <span className="font-semibold">(필수)</span> 개인정보 수집 및
                    이용 동의
                    <br />
                    <span className="text-[12px] text-gray-500">(상담 안내를 위해 사용됩니다. 마케팅에 사용되지 않습니다)</span>
                  </span>
                </button>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none min-h-[60px] pt-2 pl-6">
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
                <button
                  type="button"
                  onClick={() => setDetailModal("personalDataThirdParty")}
                  className="text-left flex-1 hover:opacity-70 transition-opacity"
                >
                  <span className="text-[14px] text-gray-700 leading-relaxed block">
                    <span className="font-semibold">(필수)</span> 개인정보 제3자 제공 없음 확인
                    <br />
                    <span className="text-[12px] text-gray-500">
                      (수집된 개인정보는 제3자에게 제공하지 않습니다)
                    </span>
                  </span>
                </button>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none min-h-[60px] pt-2 pl-6">
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
                <button
                  type="button"
                  onClick={() => setDetailModal("personalDataCompany")}
                  className="text-left flex-1 hover:opacity-70 transition-opacity"
                >
                  <span className="text-[14px] text-gray-700 leading-relaxed block">
                    <span className="font-semibold">(필수)</span> 개인정보 처리방침 확인
                    <br />
                    <span className="text-[12px] text-gray-500">
                      (개인정보 처리방침을 확인하였습니다)
                    </span>
                  </span>
                </button>
              </label>
            </div>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="sticky bottom-0 bg-white border-t border-black/10" 
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          >
            <div className="px-4 py-3">
              <div className="max-w-[640px] mx-auto">
                <button
                  onClick={onConfirm}
                  disabled={!allChecked || isLoading}
                  className={`w-full h-14 flex items-center justify-center rounded-[12px] font-bold text-base transition-colors ${
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
        </div>
      </div>

      {/* 상세 화면 모달 */}
      <ConsentDetailModal
        key={detailModal}
        isOpen={detailModal !== null}
        onClose={() => setDetailModal(null)}
        detailType={detailModal}
      />
    </>
  );
}
