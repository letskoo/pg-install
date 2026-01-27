import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    console.log("[API/stats] Statistics request received");

    // Get Google Apps Script URL from environment
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

    if (!scriptUrl) {
      console.error("[API/stats] ❌ Missing Google Apps Script URL");
      return NextResponse.json(
        { ok: false, message: "Server misconfigured: Missing Google Apps Script URL" },
        { status: 500 }
      );
    }

    const sheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = process.env.GOOGLE_SHEET_TAB || "carrot";

    if (!sheetId) {
      console.error("[API/stats] ❌ Missing GOOGLE_SHEET_ID");
      return NextResponse.json(
        { ok: false, message: "Server misconfigured: Missing spreadsheet ID" },
        { status: 500 }
      );
    }

    console.log("[API/stats] Fetching stats from Apps Script...");
    console.log("[API/stats] Sheet:", { sheetIdLength: sheetId.length, sheetName });

    // Call Apps Script with GET request and query params
    const url = new URL(scriptUrl);
    url.searchParams.set("action", "getStats");
    url.searchParams.set("sheetId", sheetId);
    url.searchParams.set("sheetName", sheetName);

    const res = await fetch(url.toString(), {
      method: "GET",
      cache: "no-store",
    });

    console.log("[API/stats] Apps Script response status:", res.status);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[API/stats] ❌ Apps Script error:", res.status);
      console.error("[API/stats] Response:", text.substring(0, 300));
      
      return NextResponse.json(
        { ok: false, message: `Apps Script error (${res.status})`, detail: text.substring(0, 500) },
        { status: 502 }
      );
    }

    // Check content-type
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const text = await res.text().catch(() => "");
      console.error("[API/stats] ❌ Non-JSON response:", contentType);
      console.error("[API/stats] Response body:", text.substring(0, 300));
      
      return NextResponse.json(
        { ok: false, message: "Apps Script returned invalid format", detail: contentType },
        { status: 502 }
      );
    }

    // Parse JSON
    let data: any;
    try {
      data = await res.json();
    } catch (parseErr) {
      console.error("[API/stats] ❌ JSON parse error");
      return NextResponse.json(
        { ok: false, message: "Invalid JSON from Apps Script" },
        { status: 502 }
      );
    }

    console.log("[API/stats] Parsed data:", data);

    // Validate response
    if (data?.ok !== true) {
      console.error("[API/stats] ❌ Apps Script returned error:", data?.message);
      return NextResponse.json(
        { ok: false, message: data?.message || "Apps Script error" },
        { status: 502 }
      );
    }

    console.log("[API/stats] ✅ SUCCESS:", {
      totalCount: data.totalCount,
      last30DaysCount: data.last30DaysCount,
    });

    return NextResponse.json({
      ok: true,
      totalCount: data.totalCount || 0,
      last30DaysCount: data.last30DaysCount || 0,
    });

  } catch (e: any) {
    console.error("[API/stats] ❌ EXCEPTION:", e?.message || String(e));
    console.error("[API/stats] Stack:", e?.stack);
    
    return NextResponse.json(
      { ok: false, message: "Server error", detail: String(e?.message || e) },
      { status: 500 }
    );
  }
}
