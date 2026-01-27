"use client";

import { FormEvent, useMemo, useState } from "react";

type SubmitState = "idle" | "loading" | "success" | "error";

export default function LeadPage() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    region: "",
    memo: "",
    marketing: false,
  });
  const [status, setStatus] = useState<SubmitState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const canSubmit = useMemo(
    () =>
      form.name.trim().length > 0 &&
      form.phone.trim().length > 0 &&
      form.marketing &&
      status !== "loading",
    [form.marketing, form.name, form.phone, status]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      setStatus("error");
      setMessage("필수 항목을 입력해 주세요.");
      return;
    }

    setStatus("loading");
    setMessage(null);

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          region: form.region.trim() || undefined,
          memo: form.memo.trim() || undefined,
          isMarketingAgreed: form.marketing,
          userAgent:
            typeof navigator !== "undefined" ? navigator.userAgent : "",
          referer: typeof document !== "undefined" ? document.referrer : "",
          submittedAt: new Date().toISOString(),
        }),
      });

      const data = (await response.json()) as { ok: boolean; message?: string };

      if (!response.ok || !data.ok) {
        setStatus("error");
        setMessage(data.message || "요청 처리 중 오류가 발생했습니다.");
        return;
      }

      setStatus("success");
      setMessage("문의가 접수되었습니다.");
      setForm({ name: "", phone: "", region: "", memo: "", marketing: false });
    } catch (error) {
      setStatus("error");
      setMessage("요청 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <main className="mx-auto max-w-xl bg-white px-4 pt-8 pb-12">
      <h1 className="text-2xl font-extrabold text-slate-900">창업 문의</h1>
      <p className="mt-2 text-sm text-slate-600">
        간단한 정보를 남겨주시면 전담 매니저가 빠르게 연락드립니다.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-800" htmlFor="name">
            이름 <span className="text-orange-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            required
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            placeholder="이름을 입력해 주세요"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-800" htmlFor="phone">
            연락처 <span className="text-orange-500">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            required
            value={form.phone}
            onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            placeholder="010-0000-0000"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-800" htmlFor="region">
            지역 (선택)
          </label>
          <input
            id="region"
            name="region"
            value={form.region}
            onChange={(e) => setForm((prev) => ({ ...prev, region: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            placeholder="예: 서울 강남"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-800" htmlFor="memo">
            문의 내용 (선택)
          </label>
          <textarea
            id="memo"
            name="memo"
            rows={4}
            value={form.memo}
            onChange={(e) => setForm((prev) => ({ ...prev, memo: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            placeholder="문의하실 내용을 적어 주세요"
          />
        </div>

        <label className="flex items-start gap-3 rounded-xl border border-slate-200 px-4 py-3">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-orange-500"
            checked={form.marketing}
            onChange={(e) => setForm((prev) => ({ ...prev, marketing: e.target.checked }))}
            required
          />
          <span className="text-sm leading-relaxed text-slate-700">
            [필수] 수집된 정보를 마케팅 활용에 동의합니다.
          </span>
        </label>

        {message && (
          <p
            className={
              status === "success"
                ? "text-sm font-semibold text-green-600"
                : "text-sm font-semibold text-red-600"
            }
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="h-12 w-full rounded-xl bg-[#ff7a00] text-base font-bold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? "제출 중..." : "제출하기"}
        </button>
      </form>
    </main>
  );
}
