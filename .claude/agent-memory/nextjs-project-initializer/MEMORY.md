# 프로젝트 초기화 메모리 - 데일리 스크럼

## 프로젝트 기본 정보
- **프로젝트명:** 데일리 워크로그 & 스크럼 자동 생성기
- **경로:** `/Users/jihye/workspace/daily-scrum`
- **패키지 매니저:** pnpm
- **경로 별칭:** `@/*` → 프로젝트 루트

## 초기화 완료 현황 (2026-02-22)

### 도메인 타입 (types/index.ts)
- `WorkTag`: feature | bugfix | meeting | review | etc
- `WorkStatus`: done | in-progress | blocked
- `WorkItem`, `WorkLog`, `DailyScrum`, `ScrumFormat` 정의
- UI용 레이블 상수: `WORK_TAG_LABELS`, `WORK_STATUS_LABELS`, `WORK_TAGS`, `WORK_STATUSES`

### Zustand 스토어
- `stores/use-worklog-store.ts`: WorkLog CRUD + localStorage (persist 미들웨어)
  - 키: `daily-scrum-worklogs`
- `stores/use-scrum-store.ts`: DailyScrum 상태 + AI 생성 로딩 상태
  - 키: `daily-scrum-scrums`

### 페이지 구조
- `/` → `src/app/page.tsx` (오늘의 워크로그 입력)
- `/scrum` → `src/app/scrum/page.tsx` (스크럼 생성 & 미리보기)
- `/history` → `src/app/history/page.tsx` (날짜별 기록 조회)
- `/share/[id]` → `src/app/share/[id]/page.tsx` (공유 링크, 읽기 전용)
  - Next.js 15에서 params는 `Promise` → `await params` 필수

### Zod 검증 스키마
- `lib/validations/worklog.ts`: workItemSchema, scrumEditSchema
- `lib/validations/auth.ts`: 기존 스키마 (미사용, 재활용 가능)
- **주의:** `zod/v4` 서브패스 사용 (`import { z } from "zod/v4"`)

### 환경 변수
- `.env.local.example` 생성 (실제 `.env.local`은 미생성)
- 필수 키: `ANTHROPIC_API_KEY` (Claude API, AI 스크럼 생성용)

## 다음 구현 예정 작업
1. `WorklogList` 클라이언트 컴포넌트 (홈 페이지 실제 UI)
2. `WorklogForm` 컴포넌트 (작업 항목 추가/수정 폼)
3. `ScrumGenerator` 컴포넌트 (AI 생성 트리거 + 결과 편집)
4. `app/api/scrum/generate/route.ts` (Claude API 라우트 핸들러)
5. `HistoryList` 컴포넌트 (날짜 캘린더/리스트)
6. `SharedScrumView` 컴포넌트 (공유 페이지 읽기 전용 뷰)

## 패턴 & 규칙
- 모든 Store는 `"use client"` 선언 + `zustand/middleware`의 `persist` 사용
- ID 생성: 외부 의존성 없이 `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
- Next.js 15 dynamic params: `params: Promise<{ id: string }>` + `await params`
- EmptyState 패턴: 빈 상태 UI 표준 컴포넌트
- Server Component 우선, 클라이언트 상태 필요 시만 `"use client"`
