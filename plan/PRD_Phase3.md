# HYROX 기록 계산기 - Phase 3 PRD (Product Requirements Document)

## 문서 정보

- **버전**: 2.0 (MVP)
- **작성일**: 2025년 10월 22일
- **최종 수정일**: 2025년 10월 22일
- **Phase**: Phase 3 (Workout History - MVP)
- **상태**: Planning

---

## 1. 개요

### 1.1 Phase 3 목표 (MVP)

Phase 3는 **운동 기록 저장 및 조회 기능**에 집중한 MVP(Minimum Viable Product)입니다. 사용자가 운동 기록을 데이터베이스에 저장하고, 조회하며, 관리할 수 있는 핵심 기능을 제공합니다.

### 1.2 현재 프로젝트 상태 (Phase 1-2 완료)

**Phase 1 완료 기능:**
- ✅ 8개 달리기 기록 입력
- ✅ 8가지 스테이션 운동 입력
- ✅ 록스존 시간 입력
- ✅ 자동 계산 (러닝 합계, 스테이션 합계, 총 합계)
- ✅ 다크 모드
- ✅ 모바일 최적화 UI (Tailwind v4 + shadcn/ui)

**Phase 2 완료 기능:**
- ✅ Clerk 기반 사용자 인증
- ✅ Gemini 2.0 Flash 기반 OCR
- ✅ 이미지 업로드 및 자동 데이터 추출
- ✅ 모바일 카메라 지원

**기술 스택:**
- Next.js 15.5.6 (App Router + Turbopack)
- React 19.1.0 + TypeScript
- Tailwind CSS v4 + shadcn/ui (New York)
- Clerk (Authentication)
- Neon DB (Database)
- Drizzle ORM

### 1.3 Phase 3 핵심 가치

1. **데이터 영속성**: 운동 기록을 안전하게 저장하고 관리
2. **간편한 조회**: 날짜, 참가자, 디비전별 기록 검색 및 필터링
3. **운동 추적**: 개인 및 팀의 운동 기록 히스토리 추적

---

## 2. 기능 요구사항 (MVP)

### 2.1 운동 기록 저장 (Workout History)

#### 2.1.1 기록 저장 기능

**Priority**: P0 (필수)

**요구사항:**
- 사용자별 운동 기록 영구 저장
- 각 기록에 포함될 데이터:
  - 운동 날짜 및 시간 (timestamp)
  - 참가자 이름
  - 담당 코치 이름
  - 디비전
  - 8개 달리기 기록 (각각의 시간)
  - 8개 스테이션 기록 (각 스테이션별 시간)
  - 록스존 시간
  - 자동 계산된 합계 (러닝, 스테이션, 총계)
  - 운동 노트 (선택사항 - 최대 500자)

**기술 구현:**

**데이터베이스**: Neon DB (Serverless Postgres)
**ORM**: Drizzle ORM

**Schema 설계:**

```typescript
// src/db/schema.ts
import { pgTable, text, timestamp, integer, jsonb, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const workoutRecords = pgTable('workout_records', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull(), // Clerk user ID (코치)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  workoutDate: timestamp('workout_date').notNull(),

  // Participant information
  participantName: varchar('participant_name', { length: 100 }).notNull(),
  coachName: varchar('coach_name', { length: 100 }).notNull(),
  division: varchar('division', { length: 50 }).notNull(),

  // Running data (8 rounds) - stored as JSON
  running: jsonb('running').notNull(), // TimeEntry[]
  runningTotal: integer('running_total').notNull(), // seconds

  // Station data - stored as JSON
  stations: jsonb('stations').notNull(),
  stationTotal: integer('station_total').notNull(), // seconds

  // Roxzone
  roxzoneMinutes: integer('roxzone_minutes').notNull(),
  roxzoneSeconds: integer('roxzone_seconds').notNull(),
  roxzoneTotal: integer('roxzone_total').notNull(), // seconds

  // Calculated totals
  overallTotal: integer('overall_total').notNull(), // seconds

  // Optional metadata
  notes: text('notes'),
  tags: jsonb('tags').$type<string[]>().default([]),
});

// Indexes for performance
export const workoutRecordsIndex = {
  userIdIdx: index('user_id_idx').on(workoutRecords.userId),
  workoutDateIdx: index('workout_date_idx').on(workoutRecords.workoutDate),
  participantNameIdx: index('participant_name_idx').on(workoutRecords.participantName),
  divisionIdx: index('division_idx').on(workoutRecords.division),
};

// Zod schemas for validation
export const insertWorkoutRecordSchema = createInsertSchema(workoutRecords);
export const selectWorkoutRecordSchema = createSelectSchema(workoutRecords);

// TypeScript types
export type WorkoutRecord = typeof workoutRecords.$inferSelect;
export type NewWorkoutRecord = typeof workoutRecords.$inferInsert;

// Division types
export const DIVISIONS = [
  'single_pro_men',
  'single_open_men',
  'single_pro_women',
  'single_open_women',
  'double_pro_men',
  'double_open_men',
  'double_open_women',
  'double_pro_women',
  'double_mixed',
  'relay_mixed',
  'relay_women',
  'relay_men',
] as const;

export type DivisionType = typeof DIVISIONS[number];
```

**API Endpoints:**

```typescript
POST   /api/workouts          // Create new record
GET    /api/workouts          // List user's records (with pagination & filters)
GET    /api/workouts/:id      // Get single record
PATCH  /api/workouts/:id      // Update record
DELETE /api/workouts/:id      // Delete record
```

**API 응답 예시:**

```typescript
// GET /api/workouts?page=1&limit=10&division=single_pro_men
{
  "workouts": WorkoutRecord[],
  "total": number,
  "page": number,
  "limit": number,
  "hasMore": boolean
}
```

**사용자 시나리오:**

1. 사용자가 운동 기록 입력 완료
2. "기록 저장" 버튼 클릭
3. 저장 모달 열림:
   - 운동 날짜 선택 (기본값: 오늘)
   - 참가자 이름 입력
   - 디비전 선택 (드롭다운)
   - 담당 코치 이름 입력 (기본값: 로그인 사용자 이름)
   - 선택적 노트 입력
4. "저장" 클릭
5. 성공 토스트 메시지 표시
6. 메인 페이지로 리디렉션 또는 기록 목록으로 이동

---

#### 2.1.2 기록 조회 및 검색

**Priority**: P0 (필수)

**요구사항:**

**기본 조회:**
- 전체 운동 기록 목록 조회 (페이지네이션)
- 최신순 정렬 (기본값)

**필터링:**
- 날짜 범위 필터 (최근 7일, 30일, 90일, 전체)
- 디비전별 필터
- 참가자 이름 검색

**정렬:**
- 최신순 (기본값)
- 오래된순
- 총 시간순 (빠른순/느린순)

**페이지네이션:**
- 한 페이지당 10개 기록
- 무한 스크롤 또는 페이지 네비게이션 (모바일 고려)

**UI 라이브러리:**
- TanStack Table (React Table v8) 사용 권장

**UI 컴포넌트:**

```
RecordListPage
├── FilterBar
│   ├── DateRangeFilter
│   ├── DivisionFilter
│   └── SearchInput
├── RecordTable (or RecordCardList for mobile)
│   ├── RecordRow (desktop)
│   └── RecordCard (mobile)
└── Pagination
```

**모바일 UX:**
- 카드 기반 리스트 (모바일)
- 테이블 형식 (데스크톱)
- 스와이프 제스처 지원 (삭제, 수정)

---

#### 2.1.3 기록 상세 보기

**Priority**: P0 (필수)

**요구사항:**

- 개별 기록의 모든 세부 정보 표시
- 운동별 시간 시각화 (프로그레스 바 또는 막대 그래프)
- 참가자 정보, 디비전, 코치 정보 표시
- 노트 표시
- 수정 및 삭제 기능

**UI 레이아웃:**

```
┌─────────────────────────────────────┐
│ 📅 2024년 10월 22일                  │
│ 👤 참가자: 홍길동                    │
│ 🏋️ 디비전: Single Pro Men           │
│ 👨‍🏫 코치: 김코치                      │
├─────────────────────────────────────┤
│ ⏱️ 총 시간: 42:35                   │
├─────────────────────────────────────┤
│ 🏃 달리기 합계: 18:45                │
│ [████████░░] 44%                    │
│                                     │
│ 💪 스테이션 합계: 20:30              │
│ [██████████] 48%                    │
│                                     │
│ 🔄 록스존: 03:20                     │
│ [██░░░░░░░░] 8%                     │
├─────────────────────────────────────┤
│ 📊 상세 기록                         │
│ [Detailed breakdown table/cards]    │
├─────────────────────────────────────┤
│ 📝 노트:                             │
│ "오늘 컨디션 좋았음"                 │
├─────────────────────────────────────┤
│ [수정] [삭제]                        │
└─────────────────────────────────────┘
```

---

## 3. 사용자 경험 (UX) 설계

### 3.1 네비게이션 구조

**메인 네비게이션:**

```
┌─────────────────────────────────────┐
│ [Logo] HYROX  [UserButton] [Theme]  │
└─────────────────────────────────────┘

메뉴:
🏠 홈 (기록 입력)
📊 기록 보기
⚙️ 설정
```

**모바일 네비게이션:**
- 하단 탭 바 (Bottom Tab Bar)
- 3개 메뉴: 홈, 기록, 프로필

### 3.2 사용자 플로우

**플로우 1: 새 기록 저장**

```
홈 → 운동 데이터 입력 → "기록 저장" 버튼 →
저장 모달 (참가자, 코치, 디비전, 날짜, 노트) →
저장 → 성공 토스트 → 기록 목록 페이지
```

**플로우 2: 기록 조회**

```
기록 보기 → 필터 설정 (날짜, 디비전, 검색) →
기록 목록 → 기록 선택 → 상세 페이지
```

**플로우 3: 기록 수정/삭제**

```
기록 상세 → [수정] → 수정 모달 → 저장
기록 상세 → [삭제] → 확인 다이얼로그 → 삭제 → 목록으로
```

### 3.3 반응형 디자인

**브레이크포인트:**
- Mobile: < 768px (기본, 우선)
- Desktop: ≥ 768px

**모바일 우선 접근:**
- 터치 타겟 최소 44px
- 스와이프 제스처 지원
- 하단 네비게이션
- 카드 기반 레이아웃

---

## 4. 기술 요구사항

### 4.1 아키텍처

**Overall Architecture:**

```
┌─────────────────────────────────────┐
│         Frontend (Next.js)          │
│  - App Router                       │
│  - React Server Components          │
│  - Client Components (Interactive)  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      API Routes (/app/api)          │
│  - Workout CRUD                     │
│  - Clerk Auth Middleware            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│    Database (Neon DB - Postgres)    │
│  - Drizzle ORM                      │
│  - Schema: workout_records          │
└─────────────────────────────────────┘
```

### 4.2 데이터베이스: Neon DB

**선택 이유:**
- Serverless Postgres with 넉넉한 무료 티어
- Vercel과 완벽한 통합 (공식 파트너)
- 브랜칭 기능 (개발/프로덕션 분리)
- 자동 스케일링 및 콜드 스타트 최적화

**무료 티어:**
- 스토리지: 10GB
- 컴퓨팅: 무제한 (자동 일시정지)
- 브랜치: 10개

**브랜칭 전략:**
- `main`: Production
- `dev`: Development
- `preview`: PR Preview (optional)

### 4.3 ORM: Drizzle ORM

**선택 이유:**
- Type-safe SQL query builder
- 경량 (Prisma보다 빠름)
- Next.js App Router 최적화
- Neon DB 공식 지원

**설치:**

```bash
pnpm add drizzle-orm postgres
pnpm add -D drizzle-kit
```

**Configuration:**

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### 4.4 API 설계 (Server Actions 우선)

**Next.js Server Actions 사용 권장:**

```typescript
// src/app/actions/workout.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { workoutRecords } from '@/db/schema';
import { revalidatePath } from 'next/cache';

export async function createWorkout(data: NewWorkoutRecord) {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  const workout = await db.insert(workoutRecords).values({
    ...data,
    userId,
  }).returning();

  revalidatePath('/workouts');
  return workout[0];
}

export async function getWorkouts(filters?: WorkoutFilters) {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  // Query with filters...
  return workouts;
}

export async function deleteWorkout(id: string) {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');

  await db.delete(workoutRecords).where(
    and(
      eq(workoutRecords.id, id),
      eq(workoutRecords.userId, userId)
    )
  );

  revalidatePath('/workouts');
}
```

### 4.5 상태 관리

**React Server Components 우선:**
- Server Actions for mutations
- URL State for filters (useSearchParams)
- Minimal client state

**필요 시 Zustand:**
- UI 상태 (모달, 토스트)
- 임시 폼 데이터

### 4.6 폼 관리

**React Hook Form + Zod:**
- 이미 설치됨 (Phase 1)
- Drizzle Zod schemas 활용

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertWorkoutRecordSchema } from '@/db/schema';

const form = useForm({
  resolver: zodResolver(insertWorkoutRecordSchema),
});
```

---

## 5. 성능 요구사항

### 5.1 목표 성능 지표

**페이지 로드 시간:**
- 홈 페이지: < 1초
- 기록 목록: < 1.5초
- 상세 페이지: < 1초

**Core Web Vitals:**
- LCP: < 2.5초
- FID: < 100ms
- CLS: < 0.1

**데이터베이스 쿼리:**
- 단일 기록 조회: < 50ms
- 목록 조회 (10개): < 100ms

### 5.2 최적화 전략

**1. React Server Components 활용:**
- 기본적으로 서버 컴포넌트 사용
- 클라이언트 컴포넌트는 필요한 경우만

**2. 데이터베이스 최적화:**
- 인덱스 활용 (userId, workoutDate, participantName, division)
- 페이지네이션 (LIMIT/OFFSET)

**3. 캐싱:**
- Next.js 자동 캐싱 활용
- `revalidatePath()` for 데이터 변경 시

---

## 6. 보안 요구사항

### 6.1 인증 및 권한

**Clerk 미들웨어:**
- 모든 `/workouts` 라우트 보호
- API 라우트 보호

**권한 관리:**
- 사용자는 본인의 데이터만 접근 가능
- Server Actions에서 `auth()` 검증

```typescript
const { userId } = auth();
if (!userId) throw new Error('Unauthorized');
```

### 6.2 데이터 검증

**클라이언트 검증:**
- Zod schema (react-hook-form)

**서버 검증:**
- Drizzle Zod schemas
- Server Actions에서 재검증

---

## 7. 테스팅 전략 (선택사항)

### 7.1 수동 테스팅

**MVP 단계:**
- 기능별 수동 테스트
- 모바일/데스크톱 크로스 브라우저 테스트

### 7.2 향후 자동화 테스트 (Phase 4)

- Vitest (단위 테스트)
- Playwright (E2E)

---

## 8. 배포 및 운영

### 8.1 배포 환경

**Production**: Vercel
- 자동 배포 (main 브랜치)
- Preview 배포 (PR)

**데이터베이스**: Neon DB
- Production: Main 브랜치
- Development: Dev 브랜치

### 8.2 환경 변수

```bash
# .env.local
DATABASE_URL=postgresql://...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

### 8.3 모니터링

**기본 모니터링:**
- Vercel Analytics (무료)
- Neon DB Metrics (무료)

---

## 9. 마일스톤 및 일정

### 9.1 Phase 3 개발 일정 (4주 - MVP)

**Week 1: 데이터베이스 및 백엔드**
- [ ] Neon DB 프로젝트 생성 및 브랜치 설정
- [ ] Drizzle ORM 설정 및 스키마 작성
- [ ] 마이그레이션 실행
- [ ] Server Actions 구현 (CRUD)
- [ ] Clerk 인증 통합

**Week 2: 기록 저장 UI**
- [ ] 저장 모달 컴포넌트
- [ ] 폼 검증 (Zod + React Hook Form)
- [ ] 디비전 선택 UI
- [ ] 성공/에러 토스트

**Week 3: 기록 조회 UI**
- [ ] 기록 목록 페이지
- [ ] 필터 컴포넌트 (날짜, 디비전, 검색)
- [ ] TanStack Table 통합
- [ ] 페이지네이션
- [ ] 모바일 카드 레이아웃

**Week 4: 상세 보기 및 마무리**
- [ ] 기록 상세 페이지
- [ ] 수정/삭제 기능
- [ ] 네비게이션 업데이트
- [ ] 반응형 최적화
- [ ] 버그 수정 및 테스트

### 9.2 성공 지표 (MVP)

**Phase 3 완료 기준:**
- ✅ 기록 저장 기능 작동
- ✅ 기록 조회 및 필터링 작동
- ✅ 기록 수정/삭제 작동
- ✅ 모바일 최적화 완료
- ✅ Clerk 인증 통합 완료

---

## 10. 리스크 및 대응

### 10.1 기술적 리스크

| 리스크                 | 확률 | 영향 | 대응 방안                      |
| ---------------------- | ---- | ---- | ------------------------------ |
| Neon DB 무료 티어 제한 | 낮음 | 중간 | 10GB 충분, 필요 시 유료 전환   |
| Drizzle ORM 학습 곡선  | 중간 | 낮음 | 공식 문서 참고, 간단한 쿼리만  |
| 성능 이슈              | 낮음 | 중간 | 인덱싱, 페이지네이션, 캐싱     |

### 10.2 사용자 경험 리스크

| 리스크             | 확률 | 영향 | 대응 방안              |
| ------------------ | ---- | ---- | ---------------------- |
| 복잡한 UI          | 낮음 | 높음 | 간단한 폼, 명확한 레이블 |
| 모바일 사용성 저하 | 낮음 | 중간 | 모바일 우선 설계       |

---

## 11. 부록

### 11.1 용어 정리

| 용어                     | 설명                                      |
| ------------------------ | ----------------------------------------- |
| HYROX                    | 러닝과 기능성 운동을 결합한 피트니스 경기 |
| 록스존 (Roxzone)         | 운동 구간 간 전환 시간                    |
| 디비전 (Division)        | 경기 참가 카테고리 (성별, 레벨 등)        |
| MVP                      | Minimum Viable Product (최소 기능 제품)   |

### 11.2 참고 자료

**기술 문서:**
- [Next.js App Router](https://nextjs.org/docs/app)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [Neon DB](https://neon.tech/docs)
- [Neon + Drizzle Guide](https://neon.tech/docs/guides/drizzle)
- [Clerk Authentication](https://clerk.com/docs)
- [TanStack Table](https://tanstack.com/table/v8)

### 11.3 변경 이력

| 버전 | 날짜       | 변경 내용                                              | 작성자 |
| ---- | ---------- | ------------------------------------------------------ | ------ |
| 1.0  | 2024-10-22 | 초안 작성                                              | Claude |
| 1.1  | 2024-10-22 | 대시보드 제거, Neon DB, 참가자/코치/디비전 필드 추가   | Claude |
| 2.0  | 2024-10-22 | MVP 정리: 통계/목표/내보내기/OCR 제거, Drizzle ORM 적용 | Claude |

---

## 12. 다음 단계

### 12.1 즉시 실행 항목

**1. 개발 환경 설정**
- [ ] Neon DB 프로젝트 생성
- [ ] Drizzle ORM 설치 및 설정
- [ ] 스키마 작성 및 마이그레이션
- [ ] `.env.local` 설정

**2. 백엔드 구현**
- [ ] Server Actions 작성 (CRUD)
- [ ] Clerk 인증 미들웨어 설정
- [ ] 데이터 검증 (Zod)

**3. 프론트엔드 구현**
- [ ] 저장 모달 컴포넌트
- [ ] 기록 목록 페이지
- [ ] 기록 상세 페이지
- [ ] 필터 및 검색 UI

### 12.2 Phase 4 계획 (미래)

**추가 기능:**
- 📊 통계 및 분석
- 🎯 목표 설정 및 추적
- 📤 데이터 내보내기 (CSV)
- 📈 기록 비교 및 개선 분석
- 🏆 개인 최고 기록 (PR) 추적

---

**이 문서는 Phase 3 MVP 개발의 북극성(North Star) 역할을 합니다.**
**모든 의사결정은 사용자 가치와 기술적 실현 가능성을 기준으로 합니다.**
