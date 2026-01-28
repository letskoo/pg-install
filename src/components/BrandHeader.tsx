"use client";

import Image from "next/image";

export default function BrandHeader() {
  return (
    <div className="pt-5 pb-3">
      <div className="flex items-center gap-2">
      <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0 lg:w-8 lg:h-8">
        <Image
          src="/images/icons/logo.jpg"
          alt="바나타이거 로고"
          fill
          className="object-cover"
        />
      </div>
      <span className="text-[13px] font-medium text-gray-900 lg:text-base">주식회사맥스원이링크</span>
      </div>
    </div>
  );
}
