/**
 * 이메일 발송 로직 (텍스트 포맷 단일 소스)
 * - 제목/본문/링크를 이 파일에서만 생성하여 일관성 유지
 */

import { Resend } from "resend";

type LeadEmailPayload = {
  name: string;
  phone: string;
  region?: string;
  message?: string;
  createdAt?: string | Date;
};

function formatKSTDateTime(date: Date): string {
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "narrow",
    timeZone: "Asia/Seoul",
  });

  const parts = formatter.formatToParts(date);
  const result: Record<string, string> = {};
  parts.forEach(({ type, value }) => {
    result[type] = value;
  });

  // 형식: YYYY-MM-DD (수) HH:mm
  return `${result.year}-${result.month}-${result.day} (${result.weekday}) ${result.hour}:${result.minute}`;
}

function buildSubject(): string {
  const companyName = process.env.EMAIL_FROM_NAME || process.env.NEXT_PUBLIC_COMPANY_NAME || process.env.COMPANY_NAME || "메타페이";
  return `[${companyName}] 새 문의가 도착했어요`;
}

function buildTextBody(payload: LeadEmailPayload): string {
  const createdDate = payload.createdAt ? new Date(payload.createdAt) : new Date();
  const formattedTime = formatKSTDateTime(createdDate);
  const companyName = process.env.EMAIL_FROM_NAME || process.env.NEXT_PUBLIC_COMPANY_NAME || process.env.COMPANY_NAME || "메타페이";
  const kakaoLink = process.env.KAKAO_CHAT_URL || "http://pf.kakao.com/_zRMZj/chat";
  const sheetId = process.env.GOOGLE_SHEET_ID || process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || "";

  const sheetViewUrl = sheetId ? `https://docs.google.com/spreadsheets/d/${sheetId}/edit` : "";
  const sheetCsvUrl = sheetId ? `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv` : "";

  // 본문 구성
  let text = "";
  
  // 1. 헤더 구분선
  text += `-----------------------------------------\n`;
  text += `접수 일시: ${formattedTime}\n`;
  text += `-----------------------------------------\n`;
  text += "\n";

  // 2. 문의 정보 블록
  text += `▶ 이름: ${payload.name || "-"}\n`;
  text += "\n";

  text += `▶ 연락처: ${payload.phone || "-"}\n`;
  text += "\n";

  text += `▶ 지역: ${payload.region || "-"}\n`;
  text += "\n";

  text += `▶ 문의 내용:\n`;
  text += `${payload.message || "-"}\n`;
  text += "\n";

  // 3. 구분선
  text += `-----------------------------------------\n`;

  // 4. 바로 처리하기 섹션
  text += `📌 바로 처리하기\n`;

  // 5. 구분선
  text += `-----------------------------------------\n`;
  text += "\n";

  // 6. 링크 섹션
  if (kakaoLink) {
    text += `▶ 카카오톡 상담하기\n`;
    text += `${kakaoLink}\n`;
    text += "\n";
  }

  if (sheetViewUrl) {
    text += `▶ 구글시트 바로가기\n`;
    text += `보기: ${sheetViewUrl}\n`;
    text += "\n";
  }

  if (sheetCsvUrl) {
    text += `▶ 구글시트 다운로드 (CSV)\n`;
    text += `${sheetCsvUrl}\n`;
    text += "\n";
    text += `-----------------------------------------\n`;

  }

  return text;
}

export async function sendLeadNotificationEmail(payload: LeadEmailPayload): Promise<{ success: boolean; error?: string }> {
  const startTime = Date.now();
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("[Email] RESEND_API_KEY not set, skipping email");
      return { success: false, error: "RESEND_API_KEY not configured" };
    }

    // 수신자 이메일 설정 (회사 수신 이메일)
    const recipientEmail = process.env.COMPANY_RECEIVER_EMAIL;

    if (!recipientEmail) {
      console.error("[Email] No recipient email configured in COMPANY_RECEIVER_EMAIL");
      return { success: false, error: "COMPANY_RECEIVER_EMAIL not configured" };
    }
    
    const emailFrom = process.env.EMAIL_FROM || "noreply@resend.dev";
    const fromName = process.env.EMAIL_FROM_NAME || process.env.NEXT_PUBLIC_COMPANY_NAME || process.env.COMPANY_NAME || "메타페이";

    const subject = buildSubject();
    const text = buildTextBody(payload);

    console.log(`[Email] Sending to: ${recipientEmail} at ${new Date().toISOString()}`);

    const resend = new Resend(apiKey);

    const result = await resend.emails.send({
      from: `${fromName} <${emailFrom}>`,
      to: [recipientEmail],
      subject,
      text,
    });

    const endTime = Date.now();
    console.log(`[Email] Subject: ${subject}`);
    console.log(`[Email] Preview (200 chars): ${text.slice(0, 200)}`);
    console.log(`[Email] Sent successfully in ${endTime - startTime}ms`);
    console.log(`[Email] Resend response:`, result);
    return { success: true };
  } catch (error) {
    const endTime = Date.now();
    console.error(`[Email] Failed after ${endTime - startTime}ms:`, error);
    return { success: false, error: String(error) };
  }
}