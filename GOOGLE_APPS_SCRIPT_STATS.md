# Google Apps Script - Add doGet Handler for Statistics

Add this `doGet` handler to your existing Google Apps Script web app to enable statistics endpoint.

## Apps Script Code

Add this function to your Code.gs file (alongside your existing `doPost` function):

```javascript
function doGet(e) {
  try {
    const params = e.parameter || {};
    const action = params.action;

    // Handle stats request
    if (action === "getStats") {
      const sheetId = params.sheetId;
      const sheetName = params.sheetName || "carrot";

      if (!sheetId) {
        return ContentService.createTextOutput(
          JSON.stringify({ ok: false, message: "Missing sheetId parameter" })
        ).setMimeType(ContentService.MimeType.JSON);
      }

      Logger.log("Getting stats for sheet:", sheetName);

      // Open spreadsheet
      const ss = SpreadsheetApp.openById(sheetId);
      let sheet = ss.getSheetByName(sheetName);
      
      if (!sheet) {
        return ContentService.createTextOutput(
          JSON.stringify({ ok: false, message: `Sheet "${sheetName}" not found` })
        ).setMimeType(ContentService.MimeType.JSON);
      }

      // Get all data (excluding header row)
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      
      // Remove header row
      const dataRows = values.slice(1);
      
      // Filter out empty rows (where column A is empty)
      const nonEmptyRows = dataRows.filter(row => row[0] && row[0] !== "");
      
      // Total count
      const totalCount = nonEmptyRows.length;
      
      // Calculate last 30 days count
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      let last30DaysCount = 0;
      
      for (let i = 0; i < nonEmptyRows.length; i++) {
        const timestamp = nonEmptyRows[i][0]; // Column A
        
        if (timestamp) {
          let dateObj;
          
          // Handle different date formats
          if (timestamp instanceof Date) {
            dateObj = timestamp;
          } else if (typeof timestamp === "string") {
            dateObj = new Date(timestamp);
          } else {
            continue; // Skip invalid dates
          }
          
          // Check if date is within last 30 days
          if (dateObj >= thirtyDaysAgo && dateObj <= today) {
            last30DaysCount++;
          }
        }
      }
      
      Logger.log("Stats calculated:", { totalCount, last30DaysCount });
      
      return ContentService.createTextOutput(
        JSON.stringify({
          ok: true,
          totalCount: totalCount,
          last30DaysCount: last30DaysCount,
          sheetName: sheetName,
        })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Default response for unknown actions
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, message: "Unknown action" })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("Error in doGet:", err);
    return ContentService.createTextOutput(
      JSON.stringify({
        ok: false,
        message: String(err.message || err),
        stack: err.stack,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Deployment Steps

1. **Open your Google Apps Script project**
   - Go to: https://script.google.com
   - Open your existing project (the one with the `doPost` function)

2. **Add the `doGet` function**
   - Copy the code above
   - Paste it into your Code.gs file (below or above your existing `doPost` function)
   - Save (Ctrl+S or Cmd+S)

3. **Deploy as Web App**
   - Click "Deploy" → "Test deployments" or "Manage deployments"
   - If already deployed, click "Edit" on your existing deployment
   - Ensure "Execute as" is set to "Me"
   - Ensure "Who has access" is set to "Anyone" (or your preference)
   - Click "Deploy" or "Update"
   - Copy the Web App URL (should be the same as before)

4. **Test the endpoint**
   - Open in browser (replace with your actual values):
   ```
   https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=getStats&sheetId=YOUR_SHEET_ID&sheetName=carrot
   ```
   - Should return JSON like:
   ```json
   {
     "ok": true,
     "totalCount": 42,
     "last30DaysCount": 15,
     "sheetName": "carrot"
   }
   ```

## Notes

- The `doGet` handler processes GET requests
- The `doPost` handler (existing) processes POST requests (form submissions)
- Both handlers can coexist in the same script
- The script URL remains the same for both endpoints
- Column A must contain timestamps for date filtering to work
- Empty rows (where column A is empty) are excluded from counts

## Testing

After deployment, test the endpoint from your Next.js app:

```bash
# Visit in browser
http://localhost:3000/api/stats
```

Expected response:
```json
{
  "ok": true,
  "totalCount": 42,
  "last30DaysCount": 15
}
```

## Troubleshooting

**Problem: Returns HTML instead of JSON**
- Solution: Make sure you deployed as "Web App" not "API Executable"
- Ensure "Who has access" is set correctly

**Problem: "Sheet not found" error**
- Solution: Verify `GOOGLE_SHEET_TAB` env var matches the actual tab name
- Check that the tab exists in the spreadsheet

**Problem: Counts are 0 but data exists**
- Solution: Check that column A contains valid dates
- Verify the sheet has a header row (row 1 is skipped)

**Problem: "Missing sheetId" error**
- Solution: Ensure `GOOGLE_SHEET_ID` is set in `.env.local`
- Restart your Next.js dev server after adding env vars
