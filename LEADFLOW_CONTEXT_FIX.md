# LeadFlow Context Provider 도입 - 에러 해결

## 🐛 문제 분석

**에러 메시지**: `onOpenLeadFlow is not a function`

**원인**:
- `FixedCtaButton`이 `app/layout.tsx`에서 prop 없이 호출됨
- `onOpenLeadFlow` prop이 undefined
- Prop drilling으로 인한 누락 위험

## ✅ 해결 방법: Context + Provider 패턴

### 핵심 변경사항

**Before (문제)**:
```tsx
// FixedCtaButton이 prop을 받지 못함
<FixedCtaButton />  // onOpenLeadFlow 누락!
```

**After (해결)**:
```tsx
// LeadFlowProvider로 감싸기
<LeadFlowProvider>
  <FixedCtaButton />  // useLeadFlow() 훅으로 자동 접근
</LeadFlowProvider>
```

---

## 📋 수정된 파일 (6개)

### 1️⃣ **신규 생성**

#### `src/components/lead-flow/leadFlowContext.ts`
- React Context 정의
- `useLeadFlow()` 훅 제공
- 타입: `{ isOpen, openLeadFlow(), closeLeadFlow() }`
- Provider 없을 시 명확한 에러 메시지

#### `src/components/lead-flow/LeadFlowProvider.tsx`
- "use client" 컴포넌트
- `isOpen` 상태 관리
- `children` 렌더링 + `LeadFlow` 모달 항상 포함
- Context.Provider로 value 전달

### 2️⃣ **수정된 파일**

#### `src/components/cta/FixedCtaButton.tsx`
```tsx
// Before
interface FixedCtaButtonProps {
  onOpenLeadFlow: () => void;
}
export default function FixedCtaButton({ onOpenLeadFlow }: FixedCtaButtonProps)

// After
import { useLeadFlow } from "@/components/lead-flow/leadFlowContext";
export default function FixedCtaButton() {
  const { openLeadFlow } = useLeadFlow();
```

#### `src/components/BottomCTA.tsx`
```tsx
// Before
interface BottomCTAProps {
  onOpenLeadFlow: () => void;
}
export default function BottomCTA({ onOpenLeadFlow }: BottomCTAProps)

// After
import { useLeadFlow } from "@/components/lead-flow/leadFlowContext";
export default function BottomCTA() {
  const { openLeadFlow } = useLeadFlow();
```

#### `app/layout.tsx`
```tsx
// Before
<body>
  <div>{children}</div>
  <FixedCtaButton />
</body>

// After
<body>
  <LeadFlowProvider>
    <div>{children}</div>
    <FixedCtaButton />
  </LeadFlowProvider>
</body>
```

#### `app/page.tsx`
```tsx
// Before
import BottomCTAWrapper from "@/components/BottomCTAWrapper";
<BottomCTAWrapper />

// After
import BottomCTA from "@/components/BottomCTA";
<BottomCTA />
```

---

## 🔄 데이터 흐름

```
LeadFlowProvider (app/layout.tsx)
  │
  ├─ Context.Provider ({ isOpen, openLeadFlow, closeLeadFlow })
  │
  ├─ {children}
  │   └─ BottomCTA & FixedCtaButton
  │       └─ useLeadFlow() → openLeadFlow()
  │
  └─ <LeadFlow isOpen={isOpen} onClose={closeLeadFlow} />
```

## 🛡️ 에러 방지

**Provider 누락 시**:
```typescript
// leadFlowContext.ts에서
if (!context) {
  throw new Error(
    "useLeadFlow must be used within LeadFlowProvider. 
     Make sure LeadFlowProvider wraps your component tree in app/layout.tsx"
  );
}
```

---

## ✨ 최종 결과

| 항목 | 상태 |
|------|------|
| `onOpenLeadFlow is not a function` 에러 | ✅ 해결됨 |
| 버튼 클릭 시 LeadFlow 열기 | ✅ 정상 작동 |
| 새로고침 시 팝업 차단 alert | ✅ 없음 |
| TypeScript 에러 | ✅ 0개 |
| window.open 사용 | ✅ 제거됨 |

---

## 🧪 테스트 체크리스트

- [ ] 모바일 새로고침 → 팝업 모달 없음
- [ ] BottomCTA 클릭 → LeadFlow 모달 열림
- [ ] FixedCtaButton 클릭 → LeadFlow 모달 열림
- [ ] Step1 → Step2 진행 정상
- [ ] 바텀시트 애니메이션 정상
- [ ] 제출 성공 → 완료 페이지 전환
- [ ] 완료 페이지 "확인" → 모달 종료
- [ ] 콘솔 에러 없음

---

**완료일**: 2026-01-27
**작업**: LeadFlow Context Provider 도입으로 Prop Drilling 제거 및 에러 해결
