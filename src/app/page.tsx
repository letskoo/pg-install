"use client";

import HeroSlider from "@/components/HeroSlider";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSlider />

      <section className="px-4 py-8">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-5">
          <ol className="space-y-5">
            <li>
              <p className="font-bold">가맹비 0원! 24시간 운영 무인카페</p>
              <p className="text-sm text-gray-600">
                초기 비용 최소화 · 자판기 렌탈만으로도 창업 가능!
              </p>
            </li>
            <li>
              <p className="font-bold">렌탈/최장 48개월 분납 지원</p>
              <p className="text-sm text-gray-600">
                일시불 · 분납 · 월 렌탈 선택 가능
              </p>
            </li>
            <li>
              <p className="font-bold">정품 캡슐 사용 / 고수익</p>
              <p className="text-sm text-gray-600">
                브랜드 커피를 24시간 제공
              </p>
            </li>
          </ol>
        </div>
      </section>

      <section id="apply" className="px-4 pb-28">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-5">
          <button className="w-full rounded-2xl bg-orange-500 py-4 text-lg font-extrabold text-white">
            신청하기
          </button>
        </div>
      </section>

    </main>
  );
}
