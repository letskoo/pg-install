import { NextResponse } from "next/server";
import { google } from "googleapis";

interface CountResponse {
  ok: boolean;
  count?: number;
  error?: string;
}

function getGoogleAuth() {
  const auth = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    undefined,
    (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    ["https://www.googleapis.com/auth/spreadsheets.readonly"]
  );
  return auth;
}

export async function GET(): Promise<NextResponse<CountResponse>> {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!spreadsheetId) {
      return NextResponse.json({ ok: false, count: 0 }, { status: 200 });
    }

    const auth = getGoogleAuth();
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "시트1!B2:B",
    });

    const rows = response.data.values || [];
    const count = rows.filter((row) => row[0] && row[0].toString().trim() !== "").length;

    return NextResponse.json({ ok: true, count });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Lead Count] Error: ${errorMessage}`);
    return NextResponse.json({ ok: false, count: 0 }, { status: 200 });
  }
}

export const runtime = "nodejs";
