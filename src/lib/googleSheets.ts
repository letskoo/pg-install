import { google } from "googleapis";

interface LeadRow {
  createdAt: string;
  name: string;
  phone: string;
  region?: string;
  memo?: string;
  userAgent?: string;
  referer?: string;
}

/**
 * Google Sheets에 리드 정보를 추가합니다.
 * 
 * ⚠️ 중요: 서비스계정 인증을 위해 다음을 확인하세요:
 * 1) GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID이 .env.local에 설정되어 있는가?
 * 2) "Carrot Leads" 스프레드시트를 GOOGLE_CLIENT_EMAIL 주소로 "편집자(Editor)" 권한으로 공유했는가?
 * 3) 시트 탭명이 "시트1"인가?
 * 
 * 만약 권한/공유가 안 되어 있으면 403, 404 에러가 발생합니다.
 */
export async function appendLeadToSheet(row: LeadRow): Promise<void> {
  // 환경 변수 검증
  if (!process.env.GOOGLE_CLIENT_EMAIL) {
    throw new Error("GOOGLE_CLIENT_EMAIL 환경변수가 설정되지 않았습니다");
  }
  if (!process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error("GOOGLE_PRIVATE_KEY 환경변수가 설정되지 않았습니다");
  }
  if (!process.env.GOOGLE_SHEET_ID) {
    throw new Error("GOOGLE_SHEET_ID 환경변수가 설정되지 않았습니다");
  }

  try {
    const auth = new google.auth.JWT(
      process.env.GOOGLE_CLIENT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      ["https://www.googleapis.com/auth/spreadsheets"]
    );

    const sheets = google.sheets({ version: "v4", auth });

    const values = [
      [
        row.createdAt,
        row.name,
        row.phone,
        row.region || "",
        row.memo || "",
        row.referer || "",
        row.userAgent || "",
      ],
    ];

    console.log(`[googleSheets] Appending to sheet: ${process.env.GOOGLE_SHEET_ID}`);
    console.log(`[googleSheets] Range: 시트1!A:G`);

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "시트1!A:G",
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    });

    console.log(`[googleSheets] Successfully appended. Updates: ${JSON.stringify(response.data.updates)}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[googleSheets] Error: ${errorMessage}`);

    // 권한 관련 에러 구분
    if (errorMessage.includes("401") || errorMessage.includes("403")) {
      throw new Error(
        "Google Sheets 권한 오류: 서비스계정을 스프레드시트에 편집자(Editor)로 공유했는지 확인하세요"
      );
    }
    if (errorMessage.includes("404")) {
      throw new Error("Google Sheets ID가 잘못되었거나 시트탭명이 '시트1'이 아닙니다");
    }

    throw error;
  }
}
