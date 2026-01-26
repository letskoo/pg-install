import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailPayload {
  name: string;
  phone: string;
  region?: string;
  memo?: string;
  referer?: string;
  submittedAt?: string;
  userAgent?: string;
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export async function sendLeadNotificationEmail(
  payload: EmailPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    const toEmail = process.env.NOTIFICATION_EMAIL;

    if (!fromEmail) {
      const error = "RESEND_FROM_EMAIL 환경변수가 설정되지 않았습니다";
      console.error(`[mailer] ${error}`);
      return { success: false, error };
    }

    if (!toEmail) {
      const error = "NOTIFICATION_EMAIL 환경변수가 설정되지 않았습니다";
      console.error(`[mailer] ${error}`);
      return { success: false, error };
    }

    const subject = `[바나타이거] 새로운 창업 상담 신청: ${escapeHtml(payload.name)}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ff7a00; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .row { margin-bottom: 15px; }
          .label { font-weight: bold; color: #666; display: inline-block; min-width: 80px; }
          .value { color: #333; }
          .footer { margin-top: 20px; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">새로운 창업 상담 신청</h2>
          </div>
          <div class="content">
            <div class="row">
              <span class="label">이름:</span>
              <span class="value">${escapeHtml(payload.name)}</span>
            </div>
            <div class="row">
              <span class="label">연락처:</span>
              <span class="value">${escapeHtml(payload.phone)}</span>
            </div>
            ${payload.region ? `<div class="row"><span class="label">지역:</span><span class="value">${escapeHtml(payload.region)}</span></div>` : ""}
            ${payload.memo ? `<div class="row"><span class="label">메모:</span><span class="value">${escapeHtml(payload.memo)}</span></div>` : ""}
            ${payload.referer ? `<div class="row"><span class="label">Referer:</span><span class="value">${escapeHtml(payload.referer)}</span></div>` : ""}
            ${payload.userAgent ? `<div class="row"><span class="label">UserAgent:</span><span class="value">${escapeHtml(payload.userAgent)}</span></div>` : ""}
            <div class="footer">
              <p>제출 시간: ${escapeHtml(payload.submittedAt || new Date().toISOString())}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log(`[mailer] Sending email to ${toEmail} from ${fromEmail}`);

    const response = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject,
      html,
    });

    if (response.error) {
      const error = `Resend API 오류: ${response.error.message}`;
      console.error(`[mailer] ${error}`);
      return { success: false, error };
    }

    console.log(`[mailer] Email sent successfully. ID: ${response.data?.id}`);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[mailer] Unexpected error: ${errorMessage}`);
    return { success: false, error: errorMessage };
  }
}
