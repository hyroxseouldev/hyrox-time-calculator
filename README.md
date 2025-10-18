# HYROX 기록 계산기

HYROX 운동 시간을 정확하게 계산하고 분석하는 모바일 최적화 웹 애플리케이션입니다.

## 주요 기능

### Phase 1 (MVP) ✅
- **달리기 기록 입력** - 8개 고정 입력 필드
- **8가지 스테이션 운동 입력**
  - 스키 에르그
  - 슬레드 푸시
  - 슬레드 풀
  - 버피 브로드 점프
  - 로잉
  - 파머스 캐리
  - 샌드백 런지
  - 월볼
- **록스존 시간 입력** - 전환 시간
- **자동 계산 기능**
  - 러닝 합계
  - 스테이션 합계
  - 록스존 시간
  - 총 합계 시간
- **다크 모드 지원**
- **모바일 최적화 UI**

## 기술 스택

- **Framework**: Next.js 15.5.6 (App Router + Turbopack)
- **UI Library**: React 19.1.0
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui (New York style)
- **Theme**: next-themes
- **Icons**: lucide-react
- **Type Safety**: TypeScript

## 시작하기

### 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 앱을 확인하세요.

### 빌드

```bash
# 프로덕션 빌드
pnpm build

# 빌드 실행
pnpm start
```

### 린트

```bash
pnpm lint
```

## 사용 방법

1. **달리기 탭**: 8개의 달리기 입력 필드에 각각 시간을 MM:SS 형식으로 입력
2. **스테이션 탭**: 각 스테이션 운동의 시간을 입력
3. **록스존 탭**: 운동 간 전환 시간을 입력
4. **자동 계산**: 입력과 동시에 상단에 합계 시간이 자동으로 표시됩니다

## 프로젝트 구조

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # 루트 레이아웃 (테마, 메타데이터)
│   ├── page.tsx                 # 메인 페이지
│   └── globals.css              # 전역 스타일
├── components/
│   ├── ui/                      # shadcn/ui 컴포넌트
│   ├── exercise-entry.tsx       # 운동 입력 컴포넌트
│   ├── time-input.tsx           # 시간 입력 필드
│   ├── workout-calculator.tsx   # 메인 계산기 컴포넌트
│   ├── workout-summary.tsx      # 합계 표시 컴포넌트
│   ├── theme-provider.tsx       # 테마 제공자
│   └── theme-toggle.tsx         # 테마 전환 버튼
├── lib/
│   ├── time-utils.ts            # 시간 변환 유틸리티
│   ├── workout-calculations.ts  # 운동 계산 로직
│   └── utils.ts                 # 일반 유틸리티
└── types/
    └── workout.ts               # 운동 타입 정의
```

## 모바일 최적화

- **반응형 디자인**: 모든 화면 크기 지원
- **터치 최적화**: 큰 터치 타겟과 직관적인 인터랙션
- **PWA 지원**: 홈 화면에 추가 가능
- **성능 최적화**: Turbopack으로 빠른 로딩
- **접근성**: WCAG 가이드라인 준수

## 향후 개발 계획

### Phase 2
- [ ] 사진 OCR 인식 기능
- [ ] 기록 저장 및 히스토리 관리
- [ ] localStorage 기반 데이터 저장

### Phase 3
- [ ] 운동별 평균 시간 분석
- [ ] 데이터 내보내기 (CSV, PDF)
- [ ] 사용자 계정 시스템

## 라이선스

MIT
