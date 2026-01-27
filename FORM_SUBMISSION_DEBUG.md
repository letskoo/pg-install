# Form Submission Fix - Testing & Debugging Guide

## What Changed

### 1. API Route: `/api/lead` - STRICT VALIDATION

**File:** `app/api/lead/route.ts`

#### Added Features:
- ✅ **GET endpoint** for health check (verify config without processing)
- ✅ **Comprehensive logging** at every step
- ✅ **Strict response validation** from Google Apps Script
  - Checks HTTP status (must be 2xx)
  - Validates content-type (must be `application/json`)
  - Parses JSON response
  - Validates success flag (`ok: true` or `success: true`)
- ✅ **Environment variable strategy**
  - Prefers `GOOGLE_SCRIPT_URL` (server-only, more secure)
  - Falls back to `NEXT_PUBLIC_GOOGLE_SCRIPT_URL` (less ideal but works)
  - Logs which one is in use

#### Response Format

**On Success (200):**
```json
{
  "ok": true,
  "data": {
    // whatever Google Apps Script returns
  }
}
```

**On Error (400/500/502):**
```json
{
  "ok": false,
  "message": "Human-readable error message",
  "detail": "Optional technical details"
}
```

---

### 2. Client Form: `ConversionForm.tsx` - STRICT SUCCESS CHECK

**File:** `src/components/form/src/components/forms/ConversionForm.tsx`

**Key change:**
```typescript
// OLD (WRONG): if (data.ok) - could be undefined/falsy
// NEW (CORRECT): if (data.ok === true) - strictly true
```

This ensures the success message only displays when the server explicitly confirms the write succeeded.

---

## How to Test Locally

### Test 1: Verify Environment Setup

```bash
# In browser, open Developer Tools (F12)
# Go to Network tab
# Call the health endpoint:
```

Navigate to: `http://localhost:3000/api/lead` (GET)

**Expected response:**
```json
{
  "ok": true,
  "message": "Health check OK",
  "envConfigured": true,
  "availableEnvVars": {
    "GOOGLE_SCRIPT_URL": false,
    "NEXT_PUBLIC_GOOGLE_SCRIPT_URL": true
  }
}
```

If `envConfigured` is `false`, the form submission will fail because no Google Apps Script URL is configured.

---

### Test 2: Submit Form and Check Logs

1. **Open the form page:** http://localhost:3000/form (in new tab, or click CTA)
2. **Fill in fields:**
   - Name: "Test User"
   - Phone: "01012345678"
   - Region: "Seoul" (optional)
   - Memo: "Test submission" (optional)
3. **Click submit button**
4. **Check browser console (F12 → Console tab):**
   - Should see client-side logs from ConversionForm
5. **Check server console (terminal running `pnpm dev`):**
   - Should see detailed logs like:
     ```
     [API/POST] Form submission received
     [API/POST] Request payload keys: [ 'name', 'phone', 'region', 'memo' ]
     [API/POST] ✅ Validation passed: name and phone present
     [API/POST] ✅ Script URL configured (length: 87)
     [API/POST] Sending payload to Google Apps Script...
     [API/POST] Google Apps Script response status: 200
     [API/POST] ✅ SUCCESS: Data saved to Google Sheets
     ```

---

### Test 3: Verify Google Sheets

1. **Open your Google Sheet** (the one linked in the Apps Script)
2. **Check for new row** with:
   - Name, Phone, Region, Memo
   - createdAt timestamp
   - userAgent
3. **If row is NOT there:**
   - Check server logs - was Google Apps Script called?
   - Check Google Apps Script URL in `.env.local` - is it correct?
   - Check Google Apps Script itself - is it deployed and accepting requests?

---

## Debugging Checklist

### ❌ Problem: "Server error" message shows
**Likely cause:** `GOOGLE_SCRIPT_URL` or `NEXT_PUBLIC_GOOGLE_SCRIPT_URL` not set

**Check:**
- Open DevTools → Network → click the POST request
- Response body should show which env var is missing
- Server console should log: `[API/POST] ❌ CRITICAL: Neither GOOGLE_SCRIPT_URL nor...`

**Fix:**
- Ensure `.env.local` has `NEXT_PUBLIC_GOOGLE_SCRIPT_URL=https://script.google.com/...`
- Restart `pnpm dev`
- Try health check again: http://localhost:3000/api/lead (GET)

---

### ❌ Problem: "Google Apps Script error" message shows
**Likely cause:** Google Apps Script is not accessible or not returning proper response

**Check:**
1. Server console log:
   ```
   [API/POST] Google Apps Script response status: 500 (or other error code)
   [API/POST] Response body (first 300 chars): ...
   ```
2. Test Google Apps Script directly:
   - Open the URL from `.env.local` in browser
   - Should return JSON response, not HTML

**Fix:**
- Verify Apps Script URL is correct and deployed
- Check Apps Script logs for errors
- Ensure Apps Script handles POST requests properly

---

### ❌ Problem: Form shows "✅ Success" but Google Sheets is empty
**This should NOT happen anymore** because:
- Server now validates Google Apps Script response
- Server only returns `ok: true` if Google Apps Script response contains success flag
- Client only shows success message if `data.ok === true` (strictly)

**If it still happens:**
- Check server console for: `[API/POST] ❌ Google Apps Script did not return success flag`
- The response details will show what Google Apps Script actually returned
- Google Apps Script is probably returning something other than `{ok: true}`

---

## Environment Variables

### Recommended Setup in `.env.local`

```
# Option 1 (RECOMMENDED): Use server-only env var
GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec

# Option 2 (ALSO OK): Use public env var (exposed to client, but that's OK for this URL)
# Remove this if using Option 1
NEXT_PUBLIC_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

The route will:
1. Try to use `GOOGLE_SCRIPT_URL` first
2. Fall back to `NEXT_PUBLIC_GOOGLE_SCRIPT_URL` if first not found

---

## Server Logs Explained

| Log | Meaning |
|-----|---------|
| `[API/POST] Form submission received` | Request started |
| `[API/POST] ✅ Validation passed` | name + phone valid |
| `[API/POST] ✅ Script URL configured` | Env var is set |
| `[API/POST] Sending payload to Google Apps Script...` | About to call Apps Script |
| `[API/POST] Google Apps Script response status: 200` | Apps Script responded with HTTP 200 |
| `[API/POST] ✅ SUCCESS: Data saved to Google Sheets` | ✅ Everything good! |
| `[API/POST] ❌ Google Apps Script returned error status: 500` | ❌ Apps Script had an error |
| `[API/POST] ❌ Google Apps Script returned non-JSON` | ❌ Apps Script returned HTML (likely 404) |
| `[API/POST] ❌ Google Apps Script did not return success flag` | ❌ Apps Script response missing `ok: true` |

---

## Expected Google Apps Script Response Format

The route expects Google Apps Script to return JSON like:

```json
{
  "ok": true,
  "message": "Success",
  "rowCount": 1
}
```

**OR:**

```json
{
  "success": true,
  "data": {...}
}
```

**NOT:**
```html
<!DOCTYPE html>
<html>...
```

(This would indicate the Apps Script is not deployed or the URL is wrong)

---

## Summary of Changes

| File | Change | Impact |
|------|--------|--------|
| `app/api/lead/route.ts` | Added GET endpoint + comprehensive logging + strict validation | Form now only succeeds if Google Sheets write actually happens |
| `src/components/form/src/components/forms/ConversionForm.tsx` | Changed `if (data.ok)` to `if (data.ok === true)` | Client only shows success for real success |

---

## Next Steps

1. **Run the project:** `pnpm dev`
2. **Test health check:** Visit `http://localhost:3000/api/lead` (GET)
3. **Test form submission:** Click CTA button, fill form, submit
4. **Check results:**
   - ✅ Success message shows
   - ✅ Form clears
   - ✅ New row appears in Google Sheets
5. **Check logs:**
   - ✅ Server logs show `[API/POST] ✅ SUCCESS: Data saved to Google Sheets`

If any step fails, check the server console and browser DevTools Network tab for detailed error messages.
