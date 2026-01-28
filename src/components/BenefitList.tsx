export default function BenefitList() {
  const benefits = [
    {
      number: 1,
      title: "네컷사진 프로그램",
      description: "새 제품 / 중고 제품, 지역 관계없이 설치 가능",
    },
    {
      number: 2,
      title: "사진 프레임",
      description: "내가 생각한 나만의 프레임으로 구성 가능",
    },
    {
      number: 3,
      title: "브랜드 창업",
      description: "개인 브랜드, 가맹사업, 렌탈사업 창업 가능",
    },
    {
      number: 4,
      title: "샵인샵 프로모션",
      description: "좋은 자리, 놀리기 아쉬운 매장 있으신 분과 협업 가능",
    },
  ];

  return (
    <div className="space-y-5 py-5 mb-12">
      <div className="space-y-5">
      {benefits.map((benefit) => (
        <div key={benefit.number} className="flex gap-2.5">
          <div className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-[11px] font-semibold mt-0.5 md:w-5 md:h-5 md:text-[11px]">
            {benefit.number}
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold text-gray-900 mb-1 leading-tight md:text-base md:mb-1">{benefit.title}</h3>
            <p className="text-[13px] text-gray-500 leading-relaxed md:text-[13px]">{benefit.description}</p>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}
