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

let sheetsClient: ReturnType<typeof google.sheets> | null = null;

function getGoogleAuth() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!privateKey || !process.env.GOOGLE_CLIENT_EMAIL) {
    throw new Error(
      "Missing GOOGLE_PRIVATE_KEY or GOOGLE_CLIENT_EMAIL in environment"
    );
  }

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_CLIENT_EMAIL,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return auth;
}

function getSheetsClient() {
  if (!sheetsClient) {
    const auth = getGoogleAuth();
    sheetsClient = google.sheets({ version: "v4", auth });
  }
  return sheetsClient;
}

export async function appendLeadToSheet(
  lead: LeadRow
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log("[googleSheets] appendLeadToSheet called with:", {
      name: lead.name,
      phone: lead.phone,
    });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = process.env.GOOGLE_SHEET_NAME || "pg-install";
    const range = `${sheetName}!A:G`;

    if (!spreadsheetId) {
      const err = "Missing GOOGLE_SHEET_ID environment variable";
      console.error("[googleSheets]", err);
      return { success: false, error: err };
    }

    console.log("[googleSheets] Using spreadsheetId:", spreadsheetId);
    console.log("[googleSheets] Using range:", range);

    const sheets = getSheetsClient();

    const values = [
      [
        lead.createdAt,
        lead.name,
        lead.phone,
        lead.region || "",
        lead.memo || "",
        lead.userAgent || "",
        lead.referer || "",
      ],
    ];

    console.log("[googleSheets] Appending row:", values[0]);

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });

    console.log("[googleSheets] append response.status:", response.status);
    console.log(
      "[googleSheets] append response.data?.updates:",
      response.data?.updates
    );

    const updatedRows = response.data?.updates?.updatedRows || 0;
    const updatedColumns = response.data?.updates?.updatedColumns || 0;

    if (response.status === 200 && updatedRows > 0) {
      console.log(
        `[googleSheets] Success! Added ${updatedRows} row(s), ${updatedColumns} column(s)`
      );
      return { success: true };
    }

    const err = `Google Sheets API returned status ${response.status}, updatedRows=${updatedRows}`;
    console.error("[googleSheets]", err);
    return { success: false, error: err };
  } catch (error: any) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    const apiError = error?.response?.data?.error?.message;
    const fullErrorMsg = apiError
      ? `${errorMessage} (API: ${apiError})`
      : errorMessage;

    console.error("[googleSheets] Exception caught:", fullErrorMsg);
    if (error instanceof Error && error.stack) {
      console.error("[googleSheets] Stack trace:", error.stack);
    }

    return {
      success: false,
      error: fullErrorMsg,
    };
  }
}
