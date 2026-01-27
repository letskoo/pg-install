"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useLeadFlow } from "./leadFlowContext";
import StepHeader from "./StepHeader";
import BottomSheetConsent from "./BottomSheetConsent";
import CompleteScreen from "./CompleteScreen";
import { FormDataType, ConsentCheckboxes } from "./types";

interface LeadFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeadFlow({ isOpen, onClose }: LeadFlowProps) {
  // Context에서 refreshStats 가져오기
  const { refreshStats } = useLeadFlow();

  // ========================================
  // 규칙 A: 모든 hooks를 최상단에 선언 (항상 같은 순서)
  // ========================================

  // 1. useState 그룹
  const [step, setStep] = useState<1 | 2 | "done">(1);
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    phone: "",
    region: "",
    memo: "",
  });
  const [consentCheckboxes, setConsentCheckboxes] = useState<ConsentCheckboxes>({
    personalDataCollection: false,
    personalDataThirdParty: false,
    personalDataCompany: false,
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 2. useEffect 그룹
  useEffect(() => {
    if (isOpen) {
      console.log("LeadFlow render", { isOpen, step, isConsentOpen });
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen]);

  // 3. useCallback 그룹
  const handleBackClick = useCallback(() => {
    if (isConsentOpen) {
      setIsConsentOpen(false);
    } else if (step === 2) {
      setStep(1);
      setErrorMessage("");
    } else if (step === 1) {
      onClose();
      setStep(1);
      setFormData({ name: "", phone: "", region: "", memo: "" });
      setConsentCheckboxes({
        personalDataCollection: false,
        personalDataThirdParty: false,
        personalDataCompany: false,
      });
      setErrorMessage("");
      setIsConsentOpen(false);
    } else if (step === "done") {
      onClose();
      setStep(1);
      setFormData({ name: "", phone: "", region: "", memo: "" });
      setConsentCheckboxes({
        personalDataCollection: false,
        personalDataThirdParty: false,
        personalDataCompany: false,
      });
      setErrorMessage("");
      setIsConsentOpen(false);
    }
  }, [step, isConsentOpen, onClose]);

  const handleFormChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const isStep1Valid = formData.phone.trim() !== "" || formData.region.trim() !== "";
  const isStep2Valid = formData.name.trim() !== "" && formData.phone.trim() !== "";

  const handleNextStep = useCallback(() => {
    if (!isStep1Valid) {
      setErrorMessage("지역 또는 문의 내용을 입력해주세요.");
      return;
    }
    setStep(2);
    setErrorMessage("");
  }, [isStep1Valid]);

  const handleSubmitClick = useCallback(() => {
    if (!isStep2Valid) {
      setErrorMessage("이름과 연락처는 필수 입력입니다.");
      return;
    }
    setIsConsentOpen(true);
  }, [isStep2Valid]);

  const handleConsentCheckboxChange = useCallback(
    (key: keyof ConsentCheckboxes, value: boolean) => {
      setConsentCheckboxes((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleConsentConfirm = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const payload = {
        ...formData,
        message: formData.memo ?? "",
      };

      console.log("Submitting form payload:", payload);

      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Invalid response format:", text);
        setErrorMessage("❌ 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.ok === true) {
        setStep("done");
        setIsConsentOpen(false);
      } else {
        const errorMsg =
          data.message || "요청을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.";
        setErrorMessage(`❌ ${errorMsg}`);
      }
    } catch (error) {
      setErrorMessage("❌ 네트워크 오류가 발생했습니다.");
      console.error("Form submission error:", error);
    } finally {
      setLoading(false);
    }
  }, [formData]);

  const handleCompleteConfirm = useCallback(() => {
    console.log("LeadFlow done -> refreshStats");
    refreshStats();
    onClose();
    setStep(1);
    setFormData({ name: "", phone: "", region: "", memo: "" });
    setConsentCheckboxes({
      personalDataCollection: false,
      personalDataThirdParty: false,
      personalDataCompany: false,
    });
    setErrorMessage("");
    setIsConsentOpen(false);
  }, [onClose, refreshStats]);

  // ========================================
  // 규칙 B: 조기 return은 hooks 선언 "아래"에만 위치
  // ========================================
  if (!isOpen) return null;

  // ========================================
  // 조건부 렌더링
  // ========================================

  // 완료 화면
  if (step === "done") {
    return <CompleteScreen onConfirm={handleCompleteConfirm} />;
  }

  const headerStep: 1 | 2 = step;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
      <StepHeader currentStep={headerStep} onBack={onClose} />

      {/* 메인 콘텐츠 (상단 padding으로 헤더 아래 배치) */}
      <div className="pt-[112px] pb-[100px] px-4">
        {/* [DISABLED_STEP1] 2-step 입력 1페이지(지역/문의내용). 나중에 다시 사용할 수 있음. */}
        {false && (
          <div className="max-w-lg mx-auto">
            <h1 className="text-[28px] font-bold text-gray-900 mb-6">
              창업 희망 지역을 적어주세요
            </h1>

            {/* 지역 입력 */}
            <div className="mb-5">
              <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                지역 <span className="text-[#ff7a00]">*</span>
              </label>
              <input
                type="text"
                name="region"
                placeholder="예: 강남구"
                value={formData.region}
                onChange={handleFormChange}
                className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-[#ff7a00] focus:ring-1 focus:ring-[#ff7a00] transition-colors"
              />
            </div>

            {/* 문의 내용 */}
            <div className="mb-5">
              <label className="block text-[14px] font-semibold text-gray-900 mb-2">
                문의 내용
              </label>
              <textarea
                name="memo"
                placeholder="추가로 전달하고 싶은 내용을 써주세요"
                rows={5}
                value={formData.memo}
                onChange={handleFormChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-[#ff7a00] focus:ring-1 focus:ring-[#ff7a00] resize-none transition-colors"
              />
            </div>

            {/* 에러 메시지 */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 rounded-lg text-[13px] text-red-600 text-center">
                {errorMessage}
              </div>
            )}
          </div>
        )}

        {/* 단일 페이지 입력 (기존 Step2 확장) */}
        <div className="max-w-lg mx-auto">
          <h1 className="text-[28px] font-bold text-gray-900 mb-6">
            신청 정보를 확인해 주세요
          </h1>

          {/* 이름 */}
          <div className="mb-5">
            <label className="block text-[14px] font-semibold text-gray-900 mb-2">
              이름 <span className="text-[#ff7a00]">*</span>
            </label>
            <input
              type="text"
              name="name"
              placeholder="예: 김철수"
              value={formData.name}
              onChange={handleFormChange}
              className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-[#ff7a00] focus:ring-1 focus:ring-[#ff7a00] transition-colors"
            />
          </div>

          {/* 연락처 */}
          <div className="mb-5">
            <label className="block text-[14px] font-semibold text-gray-900 mb-2">
              연락처 <span className="text-[#ff7a00]">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="예: 010-1234-5678"
              value={formData.phone}
              onChange={handleFormChange}
              className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-[#ff7a00] focus:ring-1 focus:ring-[#ff7a00] transition-colors"
            />
          </div>

          {/* 지역 */}
          <div className="mb-5">
            <label className="block text-[14px] font-semibold text-gray-900 mb-2">
              지역
            </label>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleFormChange}
              placeholder="지역 입력"
              className="w-full h-12 px-4 rounded-lg border border-gray-300 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-[#ff7a00] focus:ring-1 focus:ring-[#ff7a00] transition-colors bg-gray-50"
            />
          </div>

          {/* 문의 내용 */}
          <div className="mb-5">
            <label className="block text-[14px] font-semibold text-gray-900 mb-2">
              문의 내용
            </label>
            <textarea
              name="memo"
              placeholder="추가로 전달하고 싶은 내용을 써주세요"
              rows={5}
              value={formData.memo}
              onChange={handleFormChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 text-[15px] placeholder:text-gray-400 focus:outline-none focus:border-[#ff7a00] focus:ring-1 focus:ring-[#ff7a00] resize-none transition-colors"
            />
          </div>

          {/* 에러 메시지 */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg text-[13px] text-red-600 text-center">
              {errorMessage}
            </div>
          )}
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 z-40">
        <button
          onClick={handleSubmitClick}
          disabled={!isStep2Valid}
          className={`w-full h-12 rounded-xl font-bold text-[15px] transition-colors ${
            isStep2Valid
              ? "bg-[#ff7a00] text-white hover:bg-[#ff8c1a] active:scale-[0.98] cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          신청 완료하기
        </button>
      </div>

      {/* 약관 동의 바텀시트 */}
      {isConsentOpen && (
        <BottomSheetConsent
          isOpen={isConsentOpen}
          onClose={() => setIsConsentOpen(false)}
          onConfirm={handleConsentConfirm}
          checkboxes={consentCheckboxes}
          onCheckboxChange={handleConsentCheckboxChange}
          isLoading={loading}
        />
      )}
    </div>
  );
}
