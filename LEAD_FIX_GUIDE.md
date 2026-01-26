# /lead 폼 제출 오류 진단 및 수정 완료

## 🎯 수정 사항 요약

### 주요 버그 원인 3가지 수정

| 원인 | 문제 | 해결 |
|------|------|------|
| **1. 시트탭명 오류** | `"Sheet1"` (영문) | `"시트1"` (한글)로 수정 |
| **2. import 경로 불일치** | `../../../lib/mailer` vs `../../../src/lib/googleSheets` | 모두 `@/lib/*` alias로 통일 |
| **3. 에러 메시지 부재** | 터미널/프론트에 원인 정보 없음 | `console.error()` 로깅 + 상세 에러 메시지 반환 |

---

## 📂 수정된 파일 목록

### 1️⃣ `src/lib/googleSheets.ts` (완전 재작성)
- ✅ 환경변수 검증 추가
- ✅ 줄바꿈 처리: `.replace(/\\n/g, "\n")` 적용
- ✅ 시트탭명: `"시트1!A:G"` 정확히 변경
- ✅ 에러 분류: 401/403/404 별도 처리
- ✅ 상세 로그: `[googleSheets]` 프리픽스로 디버깅

**저장 컬럼 순서:**
```
A: createdAt (ISO 형식 또는 KST)
B: name (이름)
C: phone (연락처)
D: region (지역)
E: memo (메모)
F: referer (출처)
G: userAgent (사용자 에이전트)
```

### 2️⃣ `src/lib/mailer.ts` (완전 재작성)
- ✅ HTML 이메일 템플릿 개선
- ✅ XSS 방지: `escapeHtml()` 함수 추가
- ✅ 환경변수 개별 검증
- ✅ Resend 응답 에러 상세 로깅
- ✅ `[mailer]` 프리픽스 로그

**필요한 환경변수:**
```
RESEND_API_KEY
RESEND_FROM_EMAIL
NOTIFICATION_EMAIL
```

### 3️⃣ `app/api/lead/route.ts` (수정)
- ✅ import 경로 통일: `@/lib/googleSheets`, `@/lib/mailer`
- ✅ 상세한 단계별 로그 추가
- ✅ Google Sheets 저장 실패 시 early return (500)
- ✅ 이메일 실패 시에도 시트 저장 성공으로 간주
- ✅ 에러 메시지를 프론트엔드에 전달
- ✅ `export const runtime = "nodejs"` 명시

**에러 처리 로직:**
```
시트 저장 실패 → 즉시 500 반환 (중요!)
시트 저장 성공 + 이메일 실패 → 200 반환 (시트만 중요)
전체 성공 → 200 반환
```

---

## 🔧 설정 체크리스트

### .env.local 필수 항목
```bash
# Google Sheets
GOOGLE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
GOOGLE_SHEET_ID=1ZUFvH_WscaeAMSLxfy2u6LmM7KDdB1-wkfbKn5HqE

# Resend (이메일)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@example.com
NOTIFICATION_EMAIL=your-admin@example.com
```

### 권한 설정 (가장 중요!)
1. Google Sheets "Carrot Leads" 스프레드시트 열기
2. 우측 상단 "공유" → `GOOGLE_CLIENT_EMAIL` 입력
3. **"편집자" 권한** 선택 (필수)
4. 공유 완료
5. ✅ 권한 확인: 서비스계정 이메일로 Google Sheets API 액세스 권한 있음

### 시트 탭명 확인
- 스프레드시트 하단 탭 확인
- 탭명이 `"시트1"` (한글)인지 확인
- 아니면 `"Sheet1"` 등 다른 이름이면 `src/lib/googleSheets.ts` range 수정

---

## 📋 로컬 테스트 절차

### Step 1: 개발 서버 시작
```bash
npm run dev
```

### Step 2: /lead 페이지 방문
```
http://localhost:3000/lead
```

### Step 3: 폼 작성 및 제출
```
이름: 테스트유저
연락처: 010-1234-5678
지역: 서울시
메모: 테스트 메시지
마케팅 동의: ✓ 체크
```

### Step 4: 터미널 로그 확인
```
✅ 성공 로그 (이 순서대로):
[lead api] Processing lead: name=테스트유저, phone=010-****-5678, region=서울시, memo=테스트...
[googleSheets] Appending to sheet: 1ZUFvH_WscaeAMSLxfy2u6LmM7KDdB1-wkfbKn5HqE
[googleSheets] Range: 시트1!A:G
[googleSheets] Successfully appended. Updates: {...}
[lead api] Successfully saved to Google Sheets
[mailer] Sending email to <your-admin@example.com>...
[mailer] Email sent successfully. ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
[lead api] Email sent successfully
[lead api] Lead processing completed successfully for 테스트유저

✅ 브라우저 알림: "신청이 완료되었습니다"
```

### Step 5: Google Sheets 확인
스프레드시트 "시트1"에 새 행 추가 확인:
```
A: 2024-01-26T14:30:45.123Z
B: 테스트유저
C: 010-1234-5678
D: 서울시
E: 테스트 메시지
F: http://localhost:3000/lead
G: Mozilla/5.0 ...
```

### Step 6: 이메일 수신 확인
관리자 이메일에 HTML 형식 알림 수신 확인

---

## 🚨 가능한 에러 메시지 & 해결

| 에러 메시지 | 원인 | 해결 |
|-----------|------|------|
| `"GOOGLE_CLIENT_EMAIL 환경변수가 설정되지 않았습니다"` | .env.local 누락 | .env.local 확인, npm run dev 재시작 |
| `"GOOGLE_PRIVATE_KEY 환경변수가 설정되지 않았습니다"` | .env.local 누락 | .env.local 확인, npm run dev 재시작 |
| `"Google Sheets 권한 오류"` | 서비스계정 공유 안 됨 | Google Sheets → 공유 → "편집자" 권한 추가 |
| `"Google Sheets ID가 잘못되었거나 시트탭명이 '시트1'이 아닙니다"` | 시트탭명 오류 또는 ID 오류 | 시트탭명 "시트1" 확인, ID 재확인 |
| `"NOTIFICATION_EMAIL 환경변수가 설정되지 않았습니다"` | .env.local 누락 | .env.local에 NOTIFICATION_EMAIL 추가 |
| `"Resend API 오류"` | Resend 키 오류 또는 이메일 미검증 | RESEND_API_KEY 확인, RESEND_FROM_EMAIL 검증 |
| `"요청 처리 중 오류 발생: ..."` | 기타 에러 | 터미널 `[lead api]` 로그 확인 |

---

## ✅ 최종 확인 사항

- [ ] `.env.local` 파일에 모든 환경변수 설정됨
- [ ] `GOOGLE_PRIVATE_KEY`가 따옴표로 감싸져 있고 `\n` 포함
- [ ] "Carrot Leads" 스프레드시트를 서비스계정 이메일로 "편집자" 권한 공유
- [ ] 시트 탭명이 `"시트1"` (한글)임
- [ ] `npm run dev` 재시작 완료
- [ ] /lead 페이지에서 테스트 제출 성공
- [ ] 터미널에 `[lead api]` 성공 로그 확인
- [ ] Google Sheets에 새 행 추가 확인
- [ ] 관리자 이메일 수신 확인

---

## 📞 추가 문제 발생 시

1. **브라우저 개발자 도구 (F12) 열기**
   - Network 탭 → POST /api/lead 요청
   - Response 탭에서 `message` 값 확인

2. **터미널 로그 정확히 읽기**
   - `[lead api]`, `[googleSheets]`, `[mailer]` 프리픽스 확인
   - 에러 메시지 전문 복사

3. **Google Cloud Console 확인**
   - APIs & Services → Enabled APIs
   - "Google Sheets API" 활성화 상태 확인

4. **서비스계정 키 재생성**
   - Google Cloud Console → Service Accounts
   - 기존 키 삭제 → 새 키 생성 (JSON)
   - GOOGLE_PRIVATE_KEY 업데이트

---

**모든 수정이 완료되었습니다! 위 절차를 따라 로컬에서 테스트하고 에러가 나면 DEBUG_GUIDE.ts와 이 문서를 참고하세요.**
