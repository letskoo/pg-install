# 환경 설정 가이드

## .env.local에 필요한 환경 변수

### Google Sheets API (서비스 계정)
```
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_PRIVATE_KEY_ID=your-private-key-id
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/...
GOOGLE_SHEET_ID=your-spreadsheet-id
```

### Resend 이메일 발송
```
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
NOTIFICATION_EMAIL=your-email@example.com
```

---

## 값 획득 방법

### 1. Google Sheets 서비스 계정 설정

#### 1-1. Google Cloud 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/)에 접속
2. 새 프로젝트 생성
3. 프로젝트 이름 입력 후 생성

#### 1-2. Google Sheets API 활성화
1. 좌측 메뉴 → "API 및 서비스" → "라이브러리" 검색
2. "Google Sheets API" 검색 후 "활성화" 버튼 클릭

#### 1-3. 서비스 계정 생성
1. "API 및 서비스" → "사용자 인증 정보" 이동
2. "사용자 인증 정보 만들기" → "서비스 계정" 선택
3. 서비스 계정 이름 입력 후 "만들기 및 계속" 클릭
4. 역할 선택 스킵하고 "계속" 클릭
5. "완료" 클릭

#### 1-4. 서비스 계정 키 생성
1. 생성된 서비스 계정 클릭
2. "키" 탭 → "키 추가" → "새 키 생성"
3. JSON 형식 선택 후 "생성"
4. 다운로드된 JSON 파일에서 다음 값들 추출:
   - `project_id` → `GOOGLE_PROJECT_ID`
   - `private_key_id` → `GOOGLE_PRIVATE_KEY_ID`
   - `private_key` → `GOOGLE_PRIVATE_KEY` (문자열 그대로 사용, `\n` 유지)
   - `client_email` → `GOOGLE_CLIENT_EMAIL`
   - `client_id` → `GOOGLE_CLIENT_ID`
   - `client_x509_cert_url` → `GOOGLE_CLIENT_X509_CERT_URL`

#### 1-5. Google Sheet 생성 및 공유
1. [Google Sheets](https://sheets.google.com/)에서 새 스프레드시트 생성
2. 시트 이름을 "Leads"로 변경
3. 첫 번째 행(헤더)에 다음 추가:
   ```
   createdAt | name | phone | region | memo | userAgent | referer
   ```
4. 스프레드시트 URL에서 ID 추출:
   - URL: `https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit`
   - `{SHEET_ID}` 부분이 → `GOOGLE_SHEET_ID`
5. 서비스 계정에 시트 공유:
   - 공유 버튼 클릭
   - `GOOGLE_CLIENT_EMAIL` 입력
   - "편집자" 권한으로 공유

### 2. Resend 이메일 설정

#### 2-1. Resend 계정 생성
1. [Resend](https://resend.com/)에 접속
2. 이메일로 가입 후 로그인

#### 2-2. API Key 생성
1. 대시보드 → "API Keys" 또는 설정에서 API 키 생성
2. 생성된 키 → `RESEND_API_KEY`

#### 2-3. 발송 이메일 설정
1. "Domains" 섹션에서 도메인 추가하거나 Resend 제공 도메인 사용
2. 발송할 이메일 주소 설정 (예: noreply@yourdomain.com) → `RESEND_FROM_EMAIL`
3. 알림을 받을 이메일 주소 → `NOTIFICATION_EMAIL`

> **주의**: 프로덕션 환경에서는 자체 도메인 사용 권장. 초기 테스트는 Resend 제공 도메인(resend.dev)으로도 가능하지만, 발송 제한이 있을 수 있음.

---

## 샘플 Google Sheet 구조

### 시트 이름: "Leads"

| createdAt | name | phone | region | memo | userAgent | referer |
|-----------|------|-------|--------|------|-----------|---------|
| 2024-01-26T10:30:45.123Z | 홍길동 | 010-1234-5678 | 서울 | 평일 오후 연락 부탁드립니다 | Mozilla/5.0... | https://example.com |

**컬럼 설명:**
- `createdAt`: ISO 8601 형식의 한국 시간(KST)
- `name`: 사용자 이름
- `phone`: 정규화된 전화번호 (공백 제거, 하이픈 유지)
- `region`: 지역 (선택사항, 빈 경우 공백)
- `memo`: 메모 (선택사항, 빈 경우 공백)
- `userAgent`: 브라우저 User-Agent
- `referer`: 페이지 리퍼러

---

## 필요 패키지 설치

```bash
npm install googleapis resend
```

또는 yarn 사용 시:
```bash
yarn add googleapis resend
```

**설치된 패키지:**
- `googleapis`: Google API 클라이언트 라이브러리
- `resend`: Resend 이메일 서비스 클라이언트

---

## 로컬 테스트 (curl 예시)

### 성공 케이스
```bash
curl -X POST http://localhost:3000/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "테스트사용자",
    "phone": "010-1234-5678",
    "region": "서울",
    "memo": "테스트 메모",
    "isMarketingAgreed": true,
    "userAgent": "curl",
    "referer": "http://localhost:3000"
  }'
```

**예상 응답 (성공):**
```json
{"ok": true}
```

### 마케팅 미동의 케이스
```bash
curl -X POST http://localhost:3000/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "테스트사용자",
    "phone": "010-1234-5678",
    "isMarketingAgreed": false
  }'
```

**예상 응답 (400):**
```json
{"ok": false, "message": "마케팅 동의가 필요합니다"}
```

### 필수값 누락 케이스
```bash
curl -X POST http://localhost:3000/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "010-1234-5678",
    "isMarketingAgreed": true
  }'
```

**예상 응답 (400):**
```json
{"ok": false, "message": "이름은 필수입니다"}
```

### 전화번호 형식 오류
```bash
curl -X POST http://localhost:3000/api/lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "테스트사용자",
    "phone": "abc-1234-5678",
    "isMarketingAgreed": true
  }'
```

**예상 응답 (400):**
```json
{"ok": false, "message": "전화번호는 숫자, 하이픈, 공백만 포함해야 합니다"}
```

---

## 프로덕션 배포 체크리스트

- [ ] 모든 `.env.local` 값이 올바르게 설정되었는가?
- [ ] Google Sheet에 서비스 계정이 공유되었는가?
- [ ] Resend의 발송 이메일이 검증되었는가? (자체 도메인 또는 resend.dev)
- [ ] 알림 이메일이 올바른가?
- [ ] 로컬에서 curl 테스트가 성공했는가?
- [ ] Google Sheets와 이메일 발송이 실제로 작동하는가?
