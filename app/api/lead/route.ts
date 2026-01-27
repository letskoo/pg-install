import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { sendLeadEmail } from "@/lib/email";

export const runtime = "nodejs";

interface LeadPayload {
  name?: string;
  phone?: string;
  region?: string;
  memo?: string;
  isMarketingAgreed?: boolean;
  submittedAt?: string;
  userAgent?: string;
  referer?: string;
}

function getGoogleAuth() {
  const email = process.env.GOOGLE_CLIENT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !key) {
    throw new Error("Missing GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY");
  }

  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return auth;
}

async function appendToSheet(payload: LeadPayload): Promise<{ ok: boolean; message: string }> {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      throw new Error("Missing GOOGLE_SHEET_ID");
    }

    // 입력 검증
    if (!payload.name?.trim()) {
      throw new Error("이름은 필수입니다");
    }
    if (!payload.phone?.trim()) {
      throw new Error("연락처는 필수입니다");
    }
    if (payload.isMarketingAgreed !== true) {
      throw new Error("마케팅 동의는 필수입니다");
    }

    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: "v4", auth });

    // 시간 (KST)
    const now = new Date();
    const kstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const timeStr = kstTime.toISOString().replace("T", " ").substring(0, 19);

    // 행 데이터: [시간, 이름, 연락처, 지역, 메모]
    const values = [
      [
        timeStr,
        payload.name.trim(),
        payload.phone.trim(),
        payload.region?.trim() || "",
        payload.memo?.trim() || "",
      ],
    ];

    const appendResponse = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "시트1!A:E",
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values,
      },
    });

    if (appendResponse.status === 200) {
      console.log("[Lead] Sheet append ok");
      return { ok: true, message: "신청이 저장되었습니다" };
    } else {
      throw new Error(`Append failed with status ${appendResponse.status}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Lead] Sheet append error: ${errorMessage}`);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  let sheetSaved = false;
  let mailSent = false;
  let errorMessage = "";

  try {
    const payload = (await request.json()) as LeadPayload;

    // 1. 시트 저장 (필수)
    try {
      await appendToSheet(payload);
      sheetSaved = true;
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "시트 저장 실패";
      console.error(`[Lead] Sheet error: ${errorMessage}`);
      return NextResponse.json(
        { ok: false, sheetSaved: false, mailSent: false, error: errorMessage },
        { status: 400 }
      );
    }

    // 2. 이메일 발송 (선택, 실패해도 OK)
    try {
      await sendLeadEmail({
        submittedAt: payload.submittedAt,
        name: payload.name!,
        phone: payload.phone!,
        region: payload.region,
        memo: payload.memo,
        referer: payload.referer,
        userAgent: payload.userAgent,
      });
      mailSent = true;
      console.log("[Lead] Email sent ok");
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "이메일 발송 실패";
      console.error(`[Lead Email] ${errorMessage}`);
      // 이메일 실패해도 시트 성공이면 ok:true
    }

    // 3. 응답
    if (sheetSaved && mailSent) {
      return NextResponse.json(
        { ok: true, sheetSaved: true, mailSent: true },
        { status: 200 }
      );
    } else if (sheetSaved && !mailSent) {
      return NextResponse.json(
        { ok: true, sheetSaved: true, mailSent: false, error: errorMessage },
        { status: 200 }
      );
    } else {
      // 여기는 도달하지 않아야 함 (시트 실패는 위에서 처리)
      return NextResponse.json(
        { ok: false, sheetSaved: false, mailSent: false, error: errorMessage },
        { status: 400 }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "요청 처리 중 오류가 발생했습니다";
    console.error(`[Lead] POST error: ${message}`);
    return NextResponse.json(
      { ok: false, sheetSaved: false, mailSent: false, error: message },
      { status: 400 }
    );
  }
}
