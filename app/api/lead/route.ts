import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;

  if (!scriptUrl) {
    console.error("[lead api] GOOGLE_SCRIPT_URL not set");
    return NextResponse.json(
      { ok: false, message: "Google Script URL이 설정되지 않았습니다" },
      { status: 500 }
    );
  }

  try {
    const payload = await request.json();

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      body: JSON.stringify(payload),
    });

    let text = "";
    let data: any = null;
    try {
      text = await response.text();
      data = text ? JSON.parse(text) : null;
    } catch (err) {
      // non-JSON response is fine
    }

    const ok = data?.ok ?? response.ok;
    const message = data?.message || text || "요청 처리 중 오류가 발생했습니다";

    if (!ok) {
      console.error(
        `[lead api] Apps Script error: status=${response.status}, body=${text}`
      );
      return NextResponse.json(
        { ok: false, message },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({ ok: true, message: message || "ok" });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[lead api] unexpected error: ${message}`);
    return NextResponse.json(
      { ok: false, message: message || "요청 처리 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
