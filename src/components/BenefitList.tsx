export default function BenefitList() {
  const benefits = [
    {
      number: 1,
      title: "인테리어 비용 100% 무상 지원",
      description: "역대 창업 비용 그만! 창업비 부담 ZERO",
    },
    {
      number: 2,
      title: "동네 1호점, 10평 인테리어무료",
      description: "단, 1월 30일까지 점포개발의뢰자에 한함",
    },
    {
      number: 3,
      title: "단순 지원이 아닌 창업전문가 매칭",
      description: "창업전문가가 성공적인 창업을 위해 꼼꼼하게 체크 해드려요",
    },
  ];

  return (
    <div className="space-y-5 px-4 py-5 mb-10">
      {benefits.map((benefit) => (
        <div key={benefit.number} className="flex gap-2.5">
          <div className="flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-gray-600 text-[11px] font-semibold mt-0.5">
            {benefit.number}
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold text-gray-900 mb-1 leading-tight">{benefit.title}</h3>
            <p className="text-[13px] text-gray-500 leading-relaxed">{benefit.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
