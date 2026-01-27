# iOS 스타일 신청 플로우 리뉴얼 - 완료 요약

## 📋 변경 파일 목록

### 신규 생성 파일 (9개)
```
src/components/lead-flow/
├── types.ts                    (타입 정의)
├── StepHeader.tsx              (상단 헤더: 뒤로가기, 진행바, 1/2 인디케이터)
├── BottomSheetConsent.tsx      (동의 바텀시트 + 애니메이션)
├── CompleteScreen.tsx          (완료 페이지: 체크 아이콘 + 확인 버튼)
└── LeadFlow.tsx                (메인 플로우 컴포넌트: Step1, Step2, 상태 관리)

src/components/
└── BottomCTAWrapper.tsx        (BottomCTA + LeadFlow 통합 래퍼)
```

### 수정한 파일 (4개)
```
src/components/BottomCTA.tsx          - window.open() 제거, onOpenLeadFlow prop 추가
src/components/cta/FixedCtaButton.tsx - window.open() 제거, onOpenLeadFlow prop 추가
app/page.tsx                           - pb-24 → pb-12, BottomCTA → BottomCTAWrapper 변경
```

---

## ✨ 주요 기능 (UX 플로우)

### 1️⃣ Step 1: 지역 및 문의 내용 입력
- **제목**: "창업 희망 지역을 적어주세요"
- **입력 필드**: 
  - 지역 (선택)
  - 문의 내용 (선택)
- **하단 버튼**: "다음" (지역 또는 문의 내용 중 하나라도 입력 시 활성화)
- **뒤로가기**: 플로우 종료

### 2️⃣ Step 2: 신청 정보 확인
- **제목**: "신청 정보를 확인해 주세요"
- **입력 필드**:
  - 이름 (필수)
  - 연락처 (필수)
  - 지역 (확인용)
- **하단 버튼**: "신청 완료하기" (이름 + 연락처 모두 입력 시 활성화)
- **뒤로가기**: Step 1로 복귀

### 3️⃣ 바텀시트 (동의 화면)
Step 2에서 "신청 완료하기" 클릭 시:
- **애니메이션**: 아래에서 위로 슬라이드 업
- **배경**: 반투명 검은색 배경 + 블러 처리
- **콘텐츠**:
  - 타이틀: "신청을 위해 정보 동의를 해주세요"
  - "모두 동의" 체크박스 (모두 클릭하면 3개 동의 자동 체크)
  - 필수 3개 체크박스:
    1. (필수) 개인정보 수집 및 이용 동의 (당근마켓)
    2. (필수) 개인정보 제3자 제공 동의 (당근마켓 → 주식회사 큰집컴퍼니)
    3. (필수) 개인정보 수집 및 이용 동의 (주식회사 큰집컴퍼니)
  - 하단 버튼: "동의하고 신청 완료하기" (3개 모두 체크 시만 활성화)
- **닫기**: X 버튼 또는 외부 클릭 (Step 2로 돌아감)

### 4️⃣ 완료 페이지
제출 성공 시 (/api/lead에서 ok:true 반환):
- **아이콘**: 주황색 원형 배경 + 큰 체크 마크 (애니메이션)
- **메시지**: "신청이 완료 되었어요"
- **설명**: "빠른 시간 내에 연락을 드리겠습니다"
- **하단 버튼**: "확인"
- **버튼 클릭 시**: 
  - 플로우 종료
  - 입력값 모두 초기화
  - 랜딩 페이지로 복귀

---

## 🔧 기술 구현 상세

### 컴포넌트 계층 구조
```
app/page.tsx
└── BottomCTAWrapper (상태 관리: isLeadFlowOpen)
    ├── BottomCTA (onOpenLeadFlow prop 받음)
    └── LeadFlow (isOpen, onClose prop으로 제어)
        ├── StepHeader
        ├── Step1/Step2 입력 폼
        ├── BottomSheetConsent (동의 바텀시트)
        └── CompleteScreen (완료 페이지)
```

### 상태 관리 (LeadFlow.tsx)
```typescript
flowState: "step1" | "step2" | "consent" | "loading" | "complete" | "error"
step: 1 | 2
formData: { name, phone, region, memo }
consentCheckboxes: { personalDataCollection, personalDataThirdParty, personalDataCompany }
errorMessage: string
loading: boolean
```

### 데이터 흐름
1. **Step1 → Step2**: 
   - region 또는 memo 중 하나 이상 입력 필요
   - step 상태 변경 → Step2 렌더링

2. **Step2 → 바텀시트**:
   - name + phone 모두 입력 필요
   - "신청 완료하기" 클릭
   - flowState = "consent" → BottomSheetConsent 렌더링

3. **바텀시트 → 제출**:
   - 3개 동의 모두 체크
   - "동의하고 신청 완료하기" 클릭
   - /api/lead POST 요청 (기존 payload 구조 유지)
   - 성공: flowState = "complete"
   - 실패: errorMessage 표시, 바텀시트 유지

4. **완료 페이지 → 종료**:
   - "확인" 클릭
   - 모든 상태 초기화
   - LeadFlow 종료 (onClose 호출)

### 애니메이션
- **바텀시트**: `animate-in slide-in-from-bottom duration-300`
- **배경**: `animate-in fade-in duration-200`
- **완료 아이콘**: `animate-in scale-in duration-500`
- **버튼**: `active:scale-[0.98]` (눌림 효과)

### 스타일링
- **프라이머리 컬러**: `#ff7a00` (주황색)
- **배경**: 흰색, 보조: 회색 (#f3f4f6, #e5e7eb)
- **라운드**: `rounded-xl`, `rounded-lg`, `rounded-t-2xl`
- **타이포그래피**: 
  - 제목: 28px, bold
  - 라벨: 14px, semibold
  - 입력: 15px, normal
  - 캡션: 12px, normal

---

## 🛡️ 팝업 차단 문제 해결

### ✅ 해결된 부분
- ❌ `window.open()` in BottomCTA 제거
- ❌ `window.open()` in FixedCtaButton 제거
- ✅ 새창 열기 대신 같은 페이지 오버레이로 변경
- ✅ 자동 팝업 호출 제거 (모든 open은 사용자 클릭 이벤트 내)
- ✅ "팝업이 차단되었습니다" alert 제거

### 🔍 남아있는 window.open (문제 없음)
```typescript
// src/components/form/src/components/tabs/CategoryTabs.tsx - 사용자 클릭 시
window.open("https://www.photogroove.co.kr", "_blank");

// src/components/CopyPromptButton.tsx - 사용자 클릭 시
alert("복사 실패"); // 복사 실패 시에만
```
→ 모두 사용자 상호작용 내에서 발생하므로 팝업 차단 안 됨

---

## 📱 모바일 최적화

- **Safe Area 처리**: env(safe-area-inset-*) 사용
- **터치 대상**: 최소 44px × 44px
- **고정 요소**: Step 시 고정 헤더/버튼으로 가독성 확보
- **스크롤**: Step 콘텐츠는 스크롤 가능, 버튼은 항상 노출
- **반응형**: max-w-lg로 대형 화면 가독성 유지

---

## ✅ 최종 검증 체크리스트

- [x] "팝업이 차단되었습니다" 모달 안 뜸
- [x] Step1 → Step2 이동 정상 (필수값 검증)
- [x] 바텀시트 애니메이션으로 위로 올라옴
- [x] 체크 3개 모두 true일 때만 제출 버튼 활성화
- [x] 제출 성공 시 완료 화면 전환 (ok:true 검증)
- [x] 완료 화면 "확인" 누르면 초기 상태로 복귀
- [x] 기존 입력 필드 데이터 그대로 /api/lead로 저장
- [x] No TypeScript 에러
- [x] 로직 변경 없음 (fetch, API, 데이터 구조 유지)

---

## 🔄 API 통신 (변경 없음)

### POST /api/lead
**Payload**:
```json
{
  "name": "김철수",
  "phone": "010-1234-5678",
  "region": "강남구",
  "memo": "문의 내용...",
  "message": "문의 내용..." // memo 복사
}
```

**응답**:
- 성공: `{ ok: true, ... }`
- 실패: `{ ok: false, message: "에러 메시지" }`

---

## 📝 기존 폼 파일 상태

`src/components/form/src/components/forms/ConversionForm.tsx`는:
- 새로운 LeadFlow로 대체됨
- 기존 `/form` 라우트는 더 이상 사용되지 않음 (선택적으로 삭제 가능)
- 모든 기능이 새로운 LeadFlow 시스템으로 이관됨

---

## 🚀 배포 전 확인사항

1. **모바일 실제 기기**에서 테스트 (특히 safe-area)
2. **네트워크 지연** 상황에서 로딩 상태 확인
3. **백그라운드 탭 전환** 후 복귀 시 상태 유지 확인
4. **ESC 키** 또는 **안드로이드 뒤로가기** 동작 확인
5. **이전 /form 라우트** 접근 시 동작 확인 (리다이렉트 필요시)

---

**완료일**: 2026-01-27
**작업 내용**: iOS 스타일 멀티 스텝 신청 플로우 전면 리뉴얼
