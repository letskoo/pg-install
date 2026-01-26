import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailPayload {
  name: string;
  phone: string;
  region?: string;
  memo?: string;
}

export async function sendLeadNotificationEmail(
  payload: EmailPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    const toEmail = process.env.NOTIFICATION_EMAIL;

    if (!fromEmail || !toEmail) {
      return {
        success: false,
        error: "Missing email configuration",
      };
    }

    const subject = `새로운 리드: ${payload.name}`;
    const html = `
      <h2>새로운 리드 알림</h2>
      <p><strong>이름:</strong> ${escapeHtml(payload.name)}</p>
      <p><strong>전화:</strong> ${escapeHtml(payload.phone)}</p>
      ${payload.region ? `<p><strong>지역:</strong> ${escapeHtml(payload.region)}</p>` : ""}
      ${payload.memo ? `<p><strong>메모:</strong> ${escapeHtml(payload.memo)}</p>` : ""}
      <p><em>제출 시간: ${new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</em></p>
    `;

    const response = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      subject,
      html,
    });

    if (response.error) {
      return {
        success: false,
        error: response.error.message,
      };
    }

    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
