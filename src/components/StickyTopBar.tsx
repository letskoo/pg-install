"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface StickyTopBarProps {
  maxWidthClass?: string;
}

export default function StickyTopBar({ maxWidthClass = "lg:max-w-[1100px]" }: StickyTopBarProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      setIsVisible(y > 0);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 transition-all duration-200 lg:flex lg:justify-center lg:border-gray-100 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
      }`}
      style={{
        paddingTop: "env(safe-area-inset-top)",
        height: "calc(56px + env(safe-area-inset-top))",
      }}
    >
      <div className={`flex items-center h-14 w-full ${maxWidthClass}`}>
        <div className="px-4 w-full">
          <div className="max-w-[640px] mx-auto">
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-8 h-8"
              aria-label="뒤로가기"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
