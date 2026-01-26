# /lead 폼 제출 완벽 가이드 & 테스트 방법

## ✅ 수정 완료 상태

모든 파일이 정상적으로 수정되었습니다:

- ✅ `app/api/lead/route.ts` - 에러 로깅 & 단계별 처리 구현
- ✅ `src/lib/googleSheets.ts` - "시트1" 탭명, 줄바꿈 처리, 환경변수 검증
- ✅ `src/lib/mailer.ts` - Resend 이메일 발송, XSS 방지
- ✅ `tsconfig.json` - `@/*` alias 설정 (이미 있음)

---

## 🔴 필수 체크리스트 (실패의 95% 원인)

### 1️⃣ .env.local 설정 확인
```bash
# Google Sheets 인증
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=1ZUFvH_WscaeAMSLxfy2u6LmM7KDdB1-wkfbKn5HqE

# Resend 이메일
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@example.com
NOTIFICATION_EMAIL=your-admin-email@example.com
```

**중요:**
- GOOGLE_PRIVATE_KEY는 **따옴표로 감싸야 함** (줄바꿈 포함)
- `\n` 이스케이프 확인 (실제 줄바꿈 아님)
- GOOGLE_SHEET_ID는 정확히 `1ZUFvH_WscaeAMSLxfy2u6LmM7KDdB1-wkfbKn5HqE`

### 2️⃣ Google Sheets 권한 설정 (필수!)
1. Google Sheets "Carrot Leads" 열기
2. 우측 상단 **"공유"** 버튼
3. `GOOGLE_CLIENT_EMAIL` 이메일 입력
4. **"편집자" 권한** 선택 (Reader X, Editor O)
5. 공유 완료

### 3️⃣ 시트 탭명 확인
- 스프레드시트 하단 탭이 **"시트1"** (한글)인지 확인
- "Sheet1" (영문) 아니면 코드 수정 필요

### 4️⃣ npm 패키지 설치 확인
```bash
npm list googleapis resend
```

설치되지 않았으면:
```bash
npm install googleapis resend
```

---

## 🧪 로컬 테스트 절차

### Step 1: 개발 서버 시작
```bash
npm run dev
```

예상 출력:
```
▲ Next.js 14.x.x
  - Local:        http://localhost:3000
```

### Step 2: /lead 페이지 방문
```
http://localhost:3000/lead
```

### Step 3: curl로 POST 요청 테스트
```bash
curl -X POST http://localhost:3000/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "테스트유저",
    "phone": "010-1234-5678",
    "region": "서울시",
    "memo": "테스트 메모입니다",
    "isMarketingAgreed": true
  }'
```

**예상 성공 응답:**
```json
{
  "ok": true
}
```

**예상 실패 응답 예시:**
```json
{
  "ok": false,
  "message": "Google Sheets 저장 실패: Google Sheets 권한 오류: ..."
}
```

### Step 4: 터미널 로그 확인
`npm run dev` 터미널에서 다음 로그 확인:

**✅ 성공 로그:**
```
[lead api] Processing lead: name=테스트유저, phone=010-****-5678, region=서울시, memo=테스트...
[lead api] Saving to Google Sheets...
[googleSheets] Appending to sheet: 1ZUFvH_WscaeAMSLxfy2u6LmM7KDdB1-wkfbKn5HqE
[googleSheets] Range: 시트1!A:G
[googleSheets] Successfully appended. Updates: ...
[lead api] Successfully saved to Google Sheets
[lead api] Sending notification email...
[mailer] Sending email to your-admin-email@example.com from onboarding@example.com
[mailer] Email sent successfully. ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
[lead api] Email sent successfully
[lead api] Lead processing completed successfully for 테스트유저
```

**❌ 실패 로그 예시:**
```
[lead api] Processing lead: ...
[lead api] Saving to Google Sheets...
[googleSheets] Appending to sheet: ...
[googleSheets] Error: 403 ... 권한 오류
[lead api] Google Sheets error: Google Sheets 권한 오류: ...
[lead api] Unexpected error: Google Sheets 저장 실패: Google Sheets 권한 오류: ...
```

---

## 📊 결과 확인

### 1️⃣ Google Sheets 확인
"Carrot Leads" 스프레드시트 **"시트1"** 탭 확인:

새 행이 다음처럼 추가되어야 함:
```
A열(시간)      | 2024-01-26T14:30:45.123Z
B열(이름)      | 테스트유저
C열(연락처)    | 010-1234-5678
D열(지역)      | 서울시
E열(메모)      | 테스트 메모입니다
F열(출처)      | http://localhost:3000/lead
G열(UserAgent) | Mozilla/5.0 ...
```

### 2️⃣ 이메일 수신 확인
`NOTIFICATION_EMAIL`로 설정한 이메일 수신:

- 발신: `RESEND_FROM_EMAIL`
- 제목: `[바나타이거] 새로운 창업 상담 신청: 테스트유저`
- 본문: HTML 형식, 이름/연락처/지역/메모 포함

---

## 🔧 에러 해결

| 에러 메시지 | 원인 | 해결 |
|-----------|------|------|
| `"GOOGLE_CLIENT_EMAIL 환경변수가 설정되지 않았습니다"` | .env.local 누락 | .env.local 추가, npm run dev 재시작 |
| `"Google Sheets 권한 오류"` | 서비스계정 공유 안 됨 | Google Sheets → 공유 → "편집자" 권한 |
| `"시트탭명이 '시트1'이 아닙니다"` | 시트 탭명 오류 | 시트 탭명 "시트1" 확인 |
| `"NOTIFICATION_EMAIL 환경변수가 설정되지 않았습니다"` | .env.local 누락 | NOTIFICATION_EMAIL 추가 |
| `"Resend API 오류"` | Resend 키 오류 | RESEND_API_KEY 확인, Resend 대시보드 확인 |

---

## 📁 파일 경로 확인

```
project-root/
├── app/
│   ├── api/
│   │   └── lead/
│   │       └── route.ts ✅
│   ├── page.tsx
│   └── lead/
│       └── page.tsx
├── src/
│   ├── lib/
│   │   ├── googleSheets.ts ✅
│   │   └── mailer.ts ✅
│   ├── components/
│   │   └── ...
│   └── app/
│       └── ...
├── tsconfig.json ✅ (@/* alias 설정됨)
├── .env.local ✅ (필수)
└── package.json
```

---

## 💡 추가 팁

### 브라우저 개발자 도구로 확인
1. F12 → Network 탭
2. /lead 페이지에서 폼 제출
3. POST `/api/lead` 요청 선택
4. Response 탭 → `message` 확인

### 서비스계정 키 재생성
만약 계속 권한 에러가 나면:
1. Google Cloud Console → Service Accounts
2. 기존 키 삭제
3. 새 키 생성 (JSON 형식)
4. `GOOGLE_PRIVATE_KEY` 업데이트
5. npm run dev 재시작

### Google Sheets API 활성화 확인
1. Google Cloud Console
2. APIs & Services → Enabled APIs
3. "Google Sheets API" 활성화 여부 확인

---

**모든 설정이 완료되었습니다! 위 체크리스트를 따라 테스트하세요.** 🚀
