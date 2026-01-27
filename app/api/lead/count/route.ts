import { NextResponse } from "next/server";
import { google } from "googleapis";

interface CountResponse {
  ok: boolean;
  count?: number;
  error?: string;
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
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
  return auth;
}

export async function GET(): Promise<NextResponse<CountResponse>> {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  
  try {
    if (!spreadsheetId) {
      console.error("[Lead Count] Missing GOOGLE_SHEET_ID");
      return NextResponse.json(
        { ok: false, count: 0, error: "Missing GOOGLE_SHEET_ID" },
        { status: 200, headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    if (!clientEmail || !process.env.GOOGLE_PRIVATE_KEY) {
      console.error("[Lead Count] Missing credentials (GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY)");
      return NextResponse.json(
        { ok: false, count: 0, error: "Missing credentials" },
        { status: 200, headers: { "Cache-Control": "no-store, max-age=0" } }
      );
    }

    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: "v4", auth });

    console.log(`[Lead Count] Reading from spreadsheet: ${spreadsheetId.substring(0, 10)}...`);
    console.log(`[Lead Count] Service account: ${clientEmail?.substring(0, 20)}...`);
    console.log(`[Lead Count] Range A: 시트1!A2:A`);

    // A열 읽기
    const responseA = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "시트1!A2:A",
    });

    const rowsA = responseA.data.values || [];
    const countA = rowsA.filter((r) => r?.[0]?.toString().trim() !== "").length;

    console.log(`[Lead Count] A열 count: ${countA}`);

    // A열이 비어있으면 B열도 확인 (fallback)
    let countB = 0;
    if (countA === 0) {
      console.log(`[Lead Count] A열이 비어있어 B열 확인 중...`);
      console.log(`[Lead Count] Range B: 시트1!B2:B`);
      
      const responseB = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: "시트1!B2:B",
      });

      const rowsB = responseB.data.values || [];
      countB = rowsB.filter((r) => r?.[0]?.toString().trim() !== "").length;
      console.log(`[Lead Count] B열 count: ${countB}`);
    }

    const count = Math.max(countA, countB);
    console.log(`[Lead Count] Final count: ${count}`);

    return NextResponse.json(
      { ok: true, count },
      { status: 200, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Lead Count] Error: ${errorMessage}`);
    console.error(`[Lead Count] SpreadsheetId: ${spreadsheetId?.substring(0, 10)}...`);
    console.error(`[Lead Count] ClientEmail: ${clientEmail?.substring(0, 20)}...`);
    return NextResponse.json(
      { ok: false, count: 0, error: errorMessage },
      { status: 200, headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  }
}

export const runtime = "nodejs";
export const revalidate = 0;
