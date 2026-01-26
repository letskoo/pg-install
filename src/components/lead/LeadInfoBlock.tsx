"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function LeadInfoBlock() {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const response = await fetch("/api/lead/count");
        const data = (await response.json()) as { ok: boolean; count?: number };

        if (data.ok && typeof data.count === "number") {
          setCount(data.count);
        } else {
          setCount(0);
        }
      } catch (error) {
        setCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCount();

    const interval = setInterval(fetchCount, 10000);

    return () => clearInterval(interval);
  }, []);

  const displayText = isLoading
    ? "불러오는 중..."
    : `${count}명이 신청 완료했어요`;

  return (
    <div className="px-4 pt-4 pb-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="relative w-6 h-6 rounded-full overflow-hidden">
          <Image
            src="/images/icons/logo.jpg"
            alt="위너더블유"
            fill
            className="object-cover"
          />
        </div>
        <span className="text-[15px] font-bold text-[#111111]">위너더블유</span>
      </div>

      <h1 className="text-[22px] font-semibold text-[#111111] mt-5 mb-4 leading-tight">
        가맹비·교육비 0원 커피창업
      </h1>

      <p className="text-[14px] text-[#6b7280] mb-1">
        본사지원+높은 객단가로 안정매출
      </p>

      <div className="flex items-center gap-1 text-[#ff7a00] text-[13px]">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
        </svg>
        <span className="font-semibold">{displayText}</span>
      </div>
    </div>
  );
}
