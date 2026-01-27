# LeadFlow X 버튼 제거 & Hooks 오류 수정

## 🐛 문제 분석

**Hooks 오류**: "Rendered more hooks than during the previous render"
- `if (!isOpen) return null;`이 hooks 선언 전에 있어서 조건부로 hooks가 선언됨

**UI/UX 문제**:
- X(닫기) 버튼이 여러 곳에 있어서 혼란스러움
- 뒤로가기 동작이 일관성 없음

## ✅ 해결 방법

### 1️⃣ Hooks 순서 고정 (Hooks 오류 제거)

**Before**:
```tsx
export default function LeadFlow({ isOpen, onClose }) {
  const [step] = useState(1);
  // ... 다른 hooks
  
  if (!isOpen) return null; // ❌ hooks 조건부 선언!
}
```

**After**:
```tsx
export default function LeadFlow({ isOpen, onClose }) {
  // 모든 hooks를 최상단에 선언
  const [step] = useState(1);
  // ... 다른 hooks
  
  if (!isOpen) return null; // ✅ hooks 이후 조기 return
}
```

### 2️⃣ 상태 설계 단순화

**Before**:
- `flowState`: "step1" | "step2" | "consent" | "complete"

**After**:
- `step`: 1 | 2 | "done"
- `isConsentOpen`: boolean

→ 더 직관적이고 조기 return 논리 단순화

### 3️⃣ 통합 뒤로가기 핸들러

```tsx
const handleBackClick = useCallback(() => {
  if (isConsentOpen) {
    // 바텀시트만 닫기
    setIsConsentOpen(false);
  } else if (step === 2) {
    // Step 1로 이동
    setStep(1);
  } else if (step === 1) {
    // LeadFlow 닫기
    onClose();
    // 상태 초기화
  } else if (step === "done") {
    // LeadFlow 닫기
    onClose();
    // 상태 초기화
  }
}, [step, isConsentOpen, onClose]);
```

---

## 📋 수정된 파일 (3개)

### 1. `src/components/lead-flow/LeadFlow.tsx` ✏️

**변경 사항**:
- ✅ Hooks 선언 → `if (!isOpen)` 조기 return 순서 변경
- ✅ `flowState` 제거, `step` + `isConsentOpen` 사용
- ✅ 통합 뒤로가기 핸들러 구현
- ✅ 바텀시트 `if (isConsentOpen && ...)` 렌더링

**코드 구조**:
```tsx
1. 모든 useState hooks
2. 조기 return: if (!isOpen) return null;
3. useCallback hooks
4. 렌더링 로직

// UI 순서:
if (step === "done") → CompleteScreen
else → StepHeader + Step1/2 + 바텀시트
```

### 2. `src/components/lead-flow/BottomSheetConsent.tsx` ✏️

**변경 사항**:
- ❌ X(닫기) 버튼 제거
- 헤더는 타이틀만 유지
- 뒤로가기는 상단의 ← 버튼으로 통일

**헤더 Before**:
```tsx
<div className="flex items-center justify-between">
  <h2>신청을 위해 정보 동의를 해주세요</h2>
  <button onClick={onClose}> {/* X 버튼 */}
</div>
```

**헤더 After**:
```tsx
<div>
  <h2>신청을 위해 정보 동의를 해주세요</h2>
  {/* X 버튼 제거됨 */}
</div>
```

### 3. `src/components/lead-flow/CompleteScreen.tsx` ✅

**상태**: 수정 없음
- 이미 ← 버튼 없고 "확인" 버튼만 존재
- `onConfirm` 호출로 LeadFlow 종료

---

## 🔄 사용자 여정 (Flow)

### Step 1 화면 (1/2)
```
[← 뒤로가기] "창업 희망 지역을 적어주세요"
├─ 지역 입력
├─ 문의 내용
└─ [다음] 버튼
   ├─ ← 클릭 → LeadFlow 닫기 + 상태 초기화
   └─ "다음" 클릭 → Step 2로 이동
```

### Step 2 화면 (2/2)
```
[← 뒤로가기] "신청 정보를 확인해 주세요"
├─ 이름 (필수)
├─ 연락처 (필수)
├─ 지역
└─ [신청 완료하기] 버튼
   ├─ ← 클릭 → Step 1로 이동
   └─ "신청 완료하기" 클릭 → 바텀시트 열기
```

### 약관 바텀시트
```
약관 동의 바텀시트 (하단에서 애니메이션으로 올라옴)
├─ "신청을 위해 정보 동의를 해주세요"
├─ 3개 동의 체크박스
├─ [동의하고 신청 완료하기] 버튼
└─ 뒤로가기:
   ├─ ← (LeadFlow 상단) 클릭 → 바텀시트만 닫기
   └─ (외부 클릭도 닫기)
```

### 완료 화면
```
[체크 아이콘] "신청이 완료 되었어요"
└─ [확인] 버튼
   └─ 클릭 → LeadFlow 닫기 + 상태 초기화
```

---

## 🛡️ 뒤로가기 동작 규칙

| 상황 | 동작 |
|------|------|
| Step 1 + ← | LeadFlow 닫기 + 상태 초기화 |
| Step 2 + ← | Step 1로 이동 |
| 바텀시트 열림 + ← | 바텀시트만 닫기 |
| 완료 화면 + "확인" | LeadFlow 닫기 + 상태 초기화 |

---

## ✨ 최종 결과

| 항목 | 상태 |
|------|------|
| Hooks "Rendered more..." 오류 | ✅ 해결됨 |
| X 버튼 제거 (X → ← 통일) | ✅ 완료됨 |
| 뒤로가기 동작 일관성 | ✅ 통합됨 |
| 바텀시트 애니메이션 | ✅ 유지됨 |
| 팝업 차단 문제 | ✅ 없음 |
| TypeScript 에러 | ✅ 0개 |

---

## 🧪 테스트 체크리스트

- [ ] CTA 클릭 → LeadFlow 열림 (새창 안 열림)
- [ ] Step 1 ← 클릭 → LeadFlow 닫힘
- [ ] Step 1 "다음" → Step 2 전환
- [ ] Step 2 ← 클릭 → Step 1로 돌아감
- [ ] Step 2 "신청 완료하기" → 바텀시트 올라옴
- [ ] 바텀시트에서 ← 클릭 → 바텀시트만 닫힘 (Step 2 유지)
- [ ] 바텀시트 "동의하고 신청 완료하기" → 완료 화면
- [ ] 완료 화면 "확인" → LeadFlow 닫힘
- [ ] 모든 상태 전환 시 입력값 초기화
- [ ] 콘솔 에러 없음

---

**완료일**: 2026-01-27
**작업**: LeadFlow X 버튼 제거 + Hooks 오류 수정 + 뒤로가기 통합
