import { NextResponse } from "next/server";
import { google } from "googleapis";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

type LeadBody = {
  name?: string;
  phone?: string;
  region?: string;
  memo?: string;
  source?: string;
};

function getEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LeadBody;

    const name = (body.name ?? "").trim();
    const phone = (body.phone ?? "").trim();
    const region = (body.region ?? "").trim();
    const memo = (body.memo ?? "").trim();
    const source = (body.source ?? "").trim();

    if (!name || !phone) {
      return NextResponse.json(
        { ok: false, error: "name and phone are required" },
        { status: 400 }
      );
    }

    // ✅ Sheets 저장
    const SHEET_ID = getEnv("GOOGLE_SHEET_ID");

    // GOOGLE_APPLICATION_CREDENTIALS 환경변수에 있는 json 파일을 자동으로 읽음
    const auth = new google.auth.GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const timestamp = new Date().toISOString();

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "시트1!A:F",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[timestamp, name, phone, region, memo, source]],
      },
    });

    // ✅ 이메일 발송
    const GMAIL_USER = getEnv("GMAIL_USER");
    const GMAIL_APP_PASSWORD = getEnv("GMAIL_APP_PASSWORD");
    const NOTIFY_TO = getEnv("NOTIFY_TO");

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    });

    const subject = `[리드 접수] ${name} / ${phone}`;
    const text = [
      `시간: ${timestamp}`,
      `이름: ${name}`,
      `연락처: ${phone}`,
      `지역: ${region || "-"}`,
      `메모: ${memo || "-"}`,
      `출처: ${source || "-"}`,
      ``,
      `시트: https://docs.google.com/spreadsheets/d/${SHEET_ID}`,
    ].join("\n");

    await transporter.sendMail({
      from: `Carrot Leads <${GMAIL_USER}>`,
      to: NOTIFY_TO,
      subject,
      text,
      textEncoding: "utf-8",
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("API /lead error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "unknown error" },
      { status: 500 }
    );
  }
}
