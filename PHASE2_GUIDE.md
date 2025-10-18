# Phase 2: OCR 기능 완성 가이드

## 🎯 구현된 기능

Phase 2에서는 Gemini AI를 활용한 **이미지 인식 자동 입력** 기능이 완성되었습니다.

### 핵심 기능
- ✅ **이미지 업로드** - 헤더의 카메라 아이콘으로 간편 업로드
- ✅ **AI 기반 OCR** - Gemini 2.0 Flash로 운동 시간 자동 추출
- ✅ **자동 입력** - 인식된 데이터가 자동으로 입력 필드에 채워짐
- ✅ **실시간 피드백** - 처리 상태와 신뢰도 표시
- ✅ **모바일 최적화** - 카메라 직접 촬영 지원

## 📁 새로 추가된 파일

```
src/
├── lib/
│   ├── gemini-ocr.ts           # 범용 Gemini OCR 유틸리티 (기존)
│   └── workout-ocr.ts          # HYROX 특화 OCR 로직 (신규)
├── components/
│   └── image-upload.tsx        # 이미지 업로드 컴포넌트 (신규)
├── app/
│   ├── api/
│   │   └── ocr/
│   │       └── route.ts        # OCR API 엔드포인트 (신규)
│   └── page.tsx                # 업데이트 (OCR 통합)
└── components/
    └── workout-calculator.tsx  # 업데이트 (자동 입력 지원)
```

## 🔧 설정 방법

### 1. Gemini API 키 발급

1. [Google AI Studio](https://aistudio.google.com/apikey)에 접속
2. "Get API Key" 버튼 클릭
3. API 키 복사

### 2. 환경 변수 설정

프로젝트 루트에 `.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일 편집:

```env
GEMINI_API_KEY=실제_발급받은_API_키_입력
```

### 3. 개발 서버 재시작

```bash
# 기존 서버 중지 (Ctrl+C)
# 서버 재시작
pnpm dev
```

## 🎨 사용 방법

### 웹에서 사용

1. 헤더 우측의 **카메라 아이콘** 클릭
2. "사진 선택" 버튼으로 파일 선택
3. HYROX 운동 기록 사진 업로드
4. AI가 자동으로 시간 데이터 추출 (3-5초 소요)
5. 추출된 데이터가 자동으로 입력 필드에 채워짐

### 모바일에서 사용

1. 카메라 아이콘 터치
2. **사진 선택** 또는 카메라로 **직접 촬영**
3. 업로드 후 자동 입력 완료

## 🧠 OCR 작동 원리

### 1. workout-ocr.ts - 데이터 추출 로직

```typescript
// HYROX 특화 프롬프트로 시간 데이터 추출
const prompt = `
이 이미지는 HYROX 운동 기록입니다.
달리기 8개, 스테이션 8개, 록스존 시간을 JSON 형식으로 추출하세요.

{
  "running": ["04:30", "04:45", ...],
  "stations": {
    "ski": "03:20",
    "sledPush": "02:15",
    ...
  },
  "roxzone": "08:30"
}
`;
```

### 2. API Route - 서버 사이드 처리

```typescript
// /api/ocr/route.ts
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const image = formData.get('image') as File;

  const result = await extractWorkoutTimes(
    image,
    process.env.GEMINI_API_KEY!
  );

  return NextResponse.json(result);
}
```

### 3. 자동 입력 - 추출된 데이터 매핑

```typescript
// workout-calculator.tsx
const fillFromOCR = (data: WorkoutOCRResult) => {
  // 달리기 8개 자동 채우기
  setRunningEntries(prev =>
    prev.map((entry, index) => ({
      ...entry,
      time: data.running[index]
    }))
  );

  // 스테이션 자동 채우기
  setStationEntries(prev =>
    prev.map(entry => ({
      ...entry,
      time: data.stations[entry.exercise]
    }))
  );

  // 록스존 채우기
  setRoxzoneTime(data.roxzone);
};
```

## 📊 인식 정확도

OCR은 3단계 신뢰도로 평가됩니다:

- **높음 (High)**: 6개 이상의 스테이션 + 달리기 데이터 인식
- **중간 (Medium)**: 3-5개 스테이션 인식
- **낮음 (Low)**: 3개 미만 인식

신뢰도가 낮을 경우 수동으로 수정하세요.

## 🎯 최적의 이미지 가이드

OCR 정확도를 높이려면:

### ✅ 좋은 이미지
- 텍스트가 선명하고 초점이 맞음
- 충분한 조명
- 정면에서 촬영
- 배경이 단순함
- 시간이 숫자로 명확히 표시됨 (MM:SS 형식)

### ❌ 피해야 할 이미지
- 흐릿하거나 초점이 안 맞음
- 너무 어둡거나 밝음
- 비스듬한 각도
- 복잡한 배경
- 손글씨 (인쇄된 텍스트 권장)

## 🔍 디버깅

### API 키 오류
```
Error: Gemini API 키가 설정되지 않았습니다
```

**해결책**: `.env` 파일에 `GEMINI_API_KEY` 설정 확인

### OCR 실패
```
Error: JSON 형식의 응답을 받지 못했습니다
```

**해결책**:
1. 이미지 품질 확인
2. 다른 각도/조명으로 재촬영
3. 수동 입력 사용

### 네트워크 오류
```
Error: HTTP error! status: 500
```

**해결책**:
1. 인터넷 연결 확인
2. API 키 유효성 확인
3. 개발 서버 재시작

## 🚀 성능 최적화

### 처리 속도
- 평균 **3-5초** 소요
- 이미지 크기: **5MB 이하** 권장
- 해상도: **1920x1080 이하** 권장

### API 사용량
- Gemini API: 무료 할당량 내 사용
- 월 60회 요청 무료 (Google AI Studio 기준)
- 추가 사용 시 유료 전환 필요

## 📝 추가 개선 사항 (향후)

### Phase 2.5 (선택적 개선)
- [ ] 이미지 전처리 (밝기, 대비 조정)
- [ ] 여러 이미지 일괄 처리
- [ ] 인식 결과 수정 UI
- [ ] OCR 히스토리 저장
- [ ] 오프라인 OCR (Tesseract.js)

### Phase 3 (계획)
- [ ] 사용자 계정 시스템
- [ ] 클라우드 데이터 저장
- [ ] 운동 기록 분석 및 통계
- [ ] 데이터 내보내기 (CSV, PDF)

## 🎉 Phase 2 완료!

이제 HYROX 운동 기록 사진을 찍어서 업로드하면 **자동으로 시간이 입력**됩니다! 🏃‍♂️📸✨

**테스트 방법**:
1. 샘플 HYROX 기록 이미지 준비
2. 헤더의 카메라 아이콘 클릭
3. 이미지 업로드
4. 자동 입력 확인!
