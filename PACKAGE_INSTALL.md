# 패키지 설치 안내

## 필수 패키지

### Google Sheets API 및 이메일 발송

```bash
npm install googleapis resend
```

또는 yarn 사용:
```bash
yarn add googleapis resend
```

## 설치된 패키지 설명

| 패키지 | 버전 | 용도 |
|--------|------|------|
| googleapis | ^133.0.0 | Google Sheets API를 통한 데이터 저장 |
| resend | ^3.0.0 | 이메일 발송 |

## 설치 후 확인

설치 완료 후 `package.json`의 `dependencies`에 다음이 추가되었는지 확인:

```json
{
  "dependencies": {
    "googleapis": "^133.0.0",
    "resend": "^3.0.0"
  }
}
```

## 추가 고려사항

### TypeScript 타입
- `googleapis`: 자체 TypeScript 정의 포함
- `resend`: 자체 TypeScript 정의 포함

### Node.js 버전
- Node.js 18 이상 권장 (async/await 및 fetch API 안정성)

### 프로덕션 배포
- Vercel 배포 시: 환경 변수를 Vercel 프로젝트 설정에 추가
- Self-hosted 배포 시: `.env.local` 대신 `.env.production`에 실제 값 설정

> `GOOGLE_PRIVATE_KEY`의 개행문자(`\n`)를 올바르게 처리해야 합니다. 환경 변수로 전달 시 실제 줄 바꿈이 아닌 `\n` 문자열로 관리하세요.
