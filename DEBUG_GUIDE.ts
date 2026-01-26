/**
 * 🔴 가장 가능성 높은 실패 원인 TOP 3 (꼭 확인하세요!)
 * 
 * 1️⃣ [권한 오류 - 가장 흔함] 🚨
 *    - Google "Carrot Leads" 스프레드시트를 서비스계정 이메일로 공유하지 않았을 때
 *    - 에러: 403 Forbidden 또는 404 Not Found
 *    - 해결: Google Sheets 우측 상단 "공유" → GOOGLE_CLIENT_EMAIL 주소 → "편집자" 권한으로 공유
 * 
 * 2️⃣ [환경변수 에러 - 두 번째로 흔함]
 *    - GOOGLE_PRIVATE_KEY의 줄바꿈이 literal "\n"이 아니라 실제 newline인 경우
 *    - 또는 .env.local에 값이 전혀 없는 경우
 *    - 에러: "GOOGLE_CLIENT_EMAIL 환경변수가 설정되지 않았습니다" 등
 *    - 해결: .env.local 재확인, npm run dev 재시작
 * 
 * 3️⃣ [시트탭명 오류]
 *    - "Sheet1" (영문) 대신 "시트1" (한글)로 명명되어 있을 때
 *    - 에러: "Google Sheets ID가 잘못되었거나 시트탭명이 '시트1'이 아닙니다"
 *    - 해결: Google Sheets에서 시트 탭명을 확인해서 range에 정확히 입력
 * 
 * ===========================
 * 📋 로컬 테스트 절차 (필독!)
 * ===========================
 */

// ==========================================
// 단계 1: 환경변수 설정 확인
// ==========================================
/*
.env.local 파일에 다음이 정확히 있는지 확인:

GOOGLE_CLIENT_EMAIL=<your-service-account-email@....iam.gserviceaccount.com>
GOOGLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
GOOGLE_SHEET_ID=1ZUFvH_WscaeAMSLxfy2u6LmM7KDdB1-wkfbKn5HqE

RESEND_API_KEY=<your-resend-api-key>
RESEND_FROM_EMAIL=<your-verified-email@example.com>
NOTIFICATION_EMAIL=<your-notification-email@example.com>

✅ 확인 사항:
  - GOOGLE_PRIVATE_KEY는 따옴표로 감싸져 있는가?
  - \n 이스케이프가 있는가? (아니면 실제 줄바꿈인가?)
  - GOOGLE_SHEET_ID는 1ZUFvH_WscaeAMSLxfy2u6LmM7KDdB1-wkfbKn5HqE 인가?
*/

// ==========================================
// 단계 2: 서비스계정 공유 확인
// ==========================================
/*
Google Sheets "Carrot Leads" 스프레드시트:

1) 우측 상단 "공유" 버튼 클릭
2) GOOGLE_CLIENT_EMAIL 이메일 주소를 입력
3) "편집자" 권한 선택 후 공유
4) 확인 이메일 받음 (또는 클립보드 링크)

✅ 확인 후 Google Sheets 탭명:
  - 시트 탭이 "시트1"로 되어 있는지 확인
  - (기본 탭명인 "Sheet1"이 아닌지 확인)
*/

// ==========================================
// 단계 3: 로컬 개발 서버 시작
// ==========================================
/*
터미널에서:

npm run dev

예상 로그:
> carrot@0.0.1 dev
> next dev

▲ Next.js 14.x.x
  - Local:        http://localhost:3000
*/

// ==========================================
// 단계 4: /lead 페이지에서 폼 제출 테스트
// ==========================================
/*
1) 브라우저에서 http://localhost:3000/lead 방문
2) 폼 작성:
   - 이름: "테스트유저"
   - 연락처: "010-1234-5678"
   - 지역: "서울시"
   - 메모: "테스트입니다"
   - 마케팅 동의: 체크

3) "신청하기" 버튼 클릭

4) 예상 결과:
   - 페이지에 "신청이 완료되었습니다" 메시지 표시
   - 또는 에러 메시지 with 상세 원인
*/

// ==========================================
// 단계 5: 터미널 로그 확인
// ==========================================
/*
npm run dev 터미널에서 다음 로그를 확인:

✅ 성공 시나리오:
  [lead api] Processing lead: name=테스트유저, phone=010-****-5678, region=서울시, memo=테스트...
  [googleSheets] Appending to sheet: 1ZUFvH_WscaeAMSLxfy2u6LmM7KDdB1-wkfbKn5HqE
  [googleSheets] Range: 시트1!A:G
  [googleSheets] Successfully appended. Updates: {...}
  [lead api] Successfully saved to Google Sheets
  [mailer] Sending email to <notification-email>...
  [mailer] Email sent successfully. ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  [lead api] Email sent successfully
  [lead api] Lead processing completed successfully for 테스트유저

❌ 실패 시나리오별 해결:
  
  에러 1) "[googleSheets] Error: 401 ... 권한 오류"
  → 서비스계정을 스프레드시트에 공유하지 않았음
  → 위 단계 2 재확인

  에러 2) "[googleSheets] Error: 404 ... 시트탭명이 '시트1'이 아닙니다"
  → 시트 탭명을 확인하고 src/lib/googleSheets.ts range 수정
  → 또는 시트탭명을 "시트1"로 변경

  에러 3) "GOOGLE_CLIENT_EMAIL 환경변수가 설정되지 않았습니다"
  → .env.local 재확인
  → npm run dev 재시작

  에러 4) "[mailer] NOTIFICATION_EMAIL 환경변수가 설정되지 않았습니다"
  → .env.local에 NOTIFICATION_EMAIL 추가
  → npm run dev 재시작
*/

// ==========================================
// 단계 6: Google Sheets 확인
// ==========================================
/*
Google Sheets "Carrot Leads" 시트1:

새 행이 추가되었는지 확인:
  A열(시간): 2024-01-26T14:30:45.123Z (또는 KST 형식)
  B열(이름): 테스트유저
  C열(연락처): 010-1234-5678
  D열(지역): 서울시
  E열(메모): 테스트입니다
  F열(출처): http://localhost:3000/lead
  G열(UserAgent): Mozilla/5.0 ...

✅ 확인 사항:
  - 새 행이 시트1 A:G 범위에 추가되었는가?
  - 시간 형식이 예상대로인가?
*/

// ==========================================
// 단계 7: 이메일 수신 확인
// ==========================================
/*
NOTIFICATION_EMAIL로 설정한 이메일에 수신:

발신인: RESEND_FROM_EMAIL
제목: "[바나타이거] 새로운 창업 상담 신청: 테스트유저"
본문: 
  이름: 테스트유저
  연락처: 010-1234-5678
  지역: 서울시
  메모: 테스트입니다
  제출 시간: 2024년 1월 26일 오후 2시 30분

✅ 확인 사항:
  - Resend 이메일이 spam 폴더로 가지 않았는가?
  - 본문 형식이 정상인가?
*/

// ==========================================
// 🔧 추가 디버깅 팁
// ==========================================
/*
만약 여전히 실패하면:

1) 브라우저 개발자 도구 (F12) → Network 탭
   → POST /api/lead 요청 → Response 탭 확인
   → { ok: false, message: "..." } 확인

2) 서비스계정 JSON 키 재생성 (Google Cloud Console)
   → 기존 키 삭제 후 새 키 생성
   → GOOGLE_PRIVATE_KEY 업데이트

3) Google Sheets API 활성화 확인 (Google Cloud Console)
   → APIs & Services → Enabled APIs
   → "Google Sheets API" 활성화 상태 확인

4) 스프레드시트 권한 다시 확인
   → "공유" → 서비스계정 이메일 → "편집자" 확인

5) 시트탭명이 정말 "시트1"인지 재확인
   → 스프레드시트 하단의 시트 탭 우클릭 → 이름 변경 확인
*/

export {};
