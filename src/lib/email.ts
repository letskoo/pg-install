import nodemailer from "nodemailer";

type LeadPayload = {
  submittedAt: string;
  name: string;
  phone: string;
  region?: string;
  memo?: string;
  referer?: string;
  userAgent?: string;
};

export async function sendLeadEmail(payload: LeadPayload) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("Missing SMTP env (SMTP_HOST/SMTP_USER/SMTP_PASS)");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const from = process.env.EMAIL_FROM || user;
  const to = "kiwankoo@gmail.com";

  const subject = `[샘플] 창업 문의 접수 - ${payload.name}`;
  const text = `
[샘플] 문의가 접수되었습니다.

시간: ${payload.submittedAt}
이름: ${payload.name}
연락처: ${payload.phone}
지역: ${payload.region || "-"}
메모: ${payload.memo || "-"}

referer: ${payload.referer || "-"}
userAgent: ${payload.userAgent || "-"}
`.trim();

  await transporter.sendMail({ from, to, subject, text });
}
