import { NextResponse } from "next/server";
import { sendLeadNotificationEmail } from "@/lib/sendEmail";

// 선택적 기능 플래그 (환경변수 기반)
const ENABLE_LOCAL_RECORDS = false; // 로컬 저장 비활성화 (우선순위 낮음)
const ENABLE_EMAIL_NOTIFICATIONS = process.env.ENABLE_EMAIL_NOTIFICATIONS !== "false"; // 이메일 발송 활성화 (기본: true, 환경변수로 제어)

// Helper to safely log environment variable status
function logEnvStatus(varName: string) {
  const value = process.env[varName];
  if (!value) {
    console.log(`[API]  ${varName}: NOT SET`);
    return false;
  }
  // Log that it exists, but not the full URL for security
  console.log(`[API]  ${varName}: SET (length: ${value.length})`);
  return true;
}

export async function GET(req: Request) {
  // Health check endpoint - verify config without processing data
  const scriptUrlExists = !!process.env.GOOGLE_SCRIPT_URL || !!process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
  
  console.log("[API/GET] Health check requested");
  console.log("[API/GET] GOOGLE_SCRIPT_URL:", process.env.GOOGLE_SCRIPT_URL ? "SET" : "NOT SET");
  console.log("[API/GET] NEXT_PUBLIC_GOOGLE_SCRIPT_URL:", process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL ? "SET" : "NOT SET");
  
  return NextResponse.json(
    {
      ok: true,
      message: "Health check OK",
      envConfigured: scriptUrlExists,
      availableEnvVars: {
        GOOGLE_SCRIPT_URL: !!process.env.GOOGLE_SCRIPT_URL,
        NEXT_PUBLIC_GOOGLE_SCRIPT_URL: !!process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL,
      },
    },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  try {
    console.log("[API/POST] Form submission received");
    
    const body = await req.json();
    const { name, phone, region, memo, message } = body || {};

    console.log("[API/POST] Incoming form data:", body);
    console.log("[API/POST] Request payload keys:", Object.keys(body || {}));

    //  Validate required fields
    if (!name || !phone) {
      console.warn("[API/POST]  Validation failed: missing name or phone");
      return NextResponse.json(
        { ok: false, message: "name and phone are required" },
        { status: 400 }
      );
    }

    console.log("[API/POST]  Validation passed: name and phone present");

    //  Get Google Apps Script URL from environment
    // Prefer GOOGLE_SCRIPT_URL (server-only), fallback to NEXT_PUBLIC_GOOGLE_SCRIPT_URL
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

    if (!scriptUrl) {
      console.error("[API/POST]  CRITICAL: Neither GOOGLE_SCRIPT_URL nor NEXT_PUBLIC_GOOGLE_SCRIPT_URL is set");
      return NextResponse.json(
        { ok: false, message: "Server misconfigured: Missing Google Apps Script URL" },
        { status: 500 }
      );
    }

    console.log("[API/POST]  Script URL configured (length: " + scriptUrl.length + ")");

    //  Prepare payload for Google Sheets
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = process.env.GOOGLE_SHEET_TAB || "carrot";

    const payload = {
      name,
      phone,
      region: region || "",
      message: message || memo || "",
      createdAt: new Date().toISOString(),
      userAgent: req.headers.get("user-agent") || "",
      sheetId,
      sheetName,
    };

    if (!sheetId) {
      console.error("[API/POST]  Missing GOOGLE_SHEET_ID env var");
      return NextResponse.json(
        { ok: false, message: "GOOGLE_SHEET_ID not configured" },
        { status: 500 }
      );
    }

    console.log(
      "[API/POST] Target sheet:",
      { sheetIdLength: sheetId.length, sheetName }
    );

    console.log("[API/POST] Sending to Apps Script:", payload);
    console.log("[API/POST] Payload keys:", Object.keys(payload));

    //  Send to Google Apps Script
    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    console.log("[API/POST] Google Apps Script response status:", res.status);
    
    //  Check HTTP status code
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[API/POST]  Google Apps Script returned error status:", res.status);
      console.error("[API/POST] Response body (first 300 chars):", text.substring(0, 300));
      
      return NextResponse.json(
        { ok: false, message: `Google Apps Script error (${res.status})`, detail: text.substring(0, 500) },
        { status: 502 }
      );
    }

    //  Check content-type
    const contentType = res.headers.get("content-type") || "";
    console.log("[API/POST] Response content-type:", contentType);
    
    if (!contentType.includes("application/json")) {
      const text = await res.text().catch(() => "");
      console.error("[API/POST]  Google Apps Script returned non-JSON:", contentType);
      console.error("[API/POST] Response body (first 300 chars):", text.substring(0, 300));
      
      return NextResponse.json(
        { ok: false, message: "Google Apps Script returned invalid response format", detail: contentType },
        { status: 502 }
      );
    }

    //  Parse JSON response
    let data: any;
    try {
      data = await res.json();
    } catch (parseErr) {
      console.error("[API/POST]  Failed to parse Google Apps Script JSON response");
      const text = await res.text().catch(() => "");
      console.error("[API/POST] Raw body:", text.substring(0, 300));
      
      return NextResponse.json(
        { ok: false, message: "Google Apps Script returned invalid JSON", detail: text.substring(0, 500) },
        { status: 502 }
      );
    }

    console.log("[API/POST] Parsed response data keys:", Object.keys(data || {}));

    //  Validate success flag in response
    const isSuccess = data?.ok === true || data?.success === true;
    
    if (!isSuccess) {
      console.error("[API/POST]  Google Apps Script did not return success flag");
      console.error("[API/POST] Response was:", JSON.stringify(data).substring(0, 300));
      
      const errorMsg = data?.message || data?.error || "Unknown error from Google Apps Script";
      return NextResponse.json(
        { ok: false, message: `Google Apps Script error: ${errorMsg}`, detail: data },
        { status: 502 }
      );
    }

    console.log("[API/POST]  SUCCESS: Data saved to Google Sheets");

    // ============================================
    // 선택적 기능 (우선순위 낮음)
    // ============================================

    // 1. 로컬 레코드 저장 (선택사항)
    if (ENABLE_LOCAL_RECORDS) {
      try {
        console.info("[API/POST] Saving local record...");
        // 나중에 구현: const record = await saveRecord({...})
        console.info("[API/POST]  Local record saved");
      } catch (err) {
        console.error("[API/POST]  Failed to save local record:", err);
        // 계속 진행 (Google Sheets는 저장됨)
      }
    }

    // 2. 관리자 이메일 발송 (선택사항)
    if (ENABLE_EMAIL_NOTIFICATIONS) {
      try {
        console.info("[API/POST] Sending admin email...");

        const emailResult = await sendLeadNotificationEmail({
          name,
          phone,
          region: region || "",
          message: message || memo || "",
          createdAt: new Date(),
        });

        if (emailResult.success) {
          console.info("[API/POST] ✅ Admin email sent");
        } else {
          console.warn("[API/POST] ⚠️ Email send failed:", emailResult.error);
        }
      } catch (err) {
        console.error("[API/POST] ❌ Failed to send admin email:", err);
        // 계속 진행 (Google Sheets는 저장됨)
      }
    }

    return NextResponse.json({ ok: true, data }, { status: 200 });

  } catch (e: any) {
    console.error("[API/POST]  EXCEPTION:", e?.message || String(e));
    console.error("[API/POST] Stack:", e?.stack);
    
    return NextResponse.json(
      { ok: false, message: "Server error", detail: String(e?.message || e) },
      { status: 500 }
    );
  }
}
