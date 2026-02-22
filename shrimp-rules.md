# AI Agent 개발 가이드라인

## 프로젝트 개요

개발자가 퇴근 전 작업 내용을 입력하면 OpenAI(`gpt-4o-mini`)가 데일리 스크럼을 자동 생성하는 Next.js 앱.
**핵심 도메인:** 워크로그 입력 → AI 스크럼 생성 → 슬랙/마크다운 포맷 출력 → 공유 링크 발급.

---

## 디렉토리 구조 & 파일 위치 규칙

### 절대 경로 기준

| 목적 | 경로 |
|------|------|
| 페이지 | `src/app/[route]/page.tsx` |
| API 라우트 | `src/app/api/[endpoint]/route.ts` |
| 도메인 컴포넌트 | `components/[domain]/[name].tsx` |
| shadcn/ui 컴포넌트 | `components/ui/[name].tsx` |
| 레이아웃 컴포넌트 | `components/layout/[name].tsx` |
| Zustand 스토어 | `stores/use-[domain]-store.ts` |
| Zod 스키마 | `lib/validations/[domain].ts` |
| 유틸 함수 | `lib/[name].ts` |
| 타입 정의 | `types/index.ts` |
| 사이트 설정 | `config/site.ts` |

### 도메인 컴포넌트 디렉토리

- 워크로그 관련: `components/worklog/`
- 스크럼 관련: `components/scrum/`
- 기록 조회 관련: `components/history/`
- 공유 관련: `components/share/`

---

## 타입 & 스키마 규칙

### 타입 정의 (`types/index.ts`)

- **모든 타입은 `types/index.ts` 한 곳에만 정의한다.**
- 기존 타입: `WorkTag`, `WorkStatus`, `WorkItem`, `WorkLog`, `ScrumFormat`, `DailyScrum`, `NavItem`, `SiteConfig`
- 레이블 상수: `WORK_TAG_LABELS`, `WORK_STATUS_LABELS`, `WORK_TAGS`, `WORK_STATUSES` — 수정 금지, UI에서 이 상수를 import하여 사용
- 새 타입 추가 시 기존 도메인 그룹 아래 배치

### Zod 스키마 (`lib/validations/`)

- **반드시 `import { z } from "zod/v4"` 사용** (`"zod"` 직접 import 금지)
- 에러 메시지는 `message` 대신 **`error`** 필드로 설정
  ```typescript
  // 올바름
  z.string().min(1, { error: "입력하세요." })
  z.enum(values as [string, ...string[]], { error: "선택하세요." })
  // 틀림 — 사용 금지
  z.string().min(1, "입력하세요.")
  ```
- 기존 스키마: `workItemSchema`, `scrumEditSchema` (`lib/validations/worklog.ts`)
- API 요청/응답 스키마는 `lib/validations/scrum.ts`에 작성

---

## 상태관리 (Zustand) 규칙

### 스토어 파일 구조

- 파일 최상단에 반드시 `"use client"` 선언
- `persist` 미들웨어 사용, localStorage 키 규칙:
  - 워크로그: `"daily-scrum-worklogs"`
  - 스크럼: `"daily-scrum-scrums"`
- 새 스토어 추가 시 `stores/use-[domain]-store.ts` 패턴 유지

### 기존 스토어 API

**`useWorklogStore`** (`stores/use-worklog-store.ts`):
- `getWorkLog(date)` / `getTodayWorkLog()`
- `ensureWorkLog(date)` — 없으면 자동 생성
- `addWorkItem(date, content, tag, status)`
- `updateWorkItem(date, itemId, updates)`
- `deleteWorkItem(date, itemId)`
- `reorderWorkItems(date, items)`

**`useScrumStore`** (`stores/use-scrum-store.ts`):
- `getScrum(date)` / `getScrumByShareId(shareId)`
- `saveScrum(date, data)` — 신규/업데이트 자동 처리
- `applyGeneratedScrum(date, yesterday, today, blocker, format)` — AI 결과 저장
- `updateScrumField(date, field, value)`
- `setGenerating(bool)` / `setGenerateError(msg)`

---

## 컴포넌트 작성 규칙

### Server vs Client 컴포넌트

- **Server Component 기본** — 클라이언트 상태/이벤트 핸들러 필요 시에만 `"use client"` 추가
- Zustand 스토어를 사용하는 컴포넌트는 반드시 `"use client"`

### 재사용 컴포넌트 패턴

**EmptyState** — 빈 상태 / 에러 표시:
```typescript
<EmptyState icon={Icon} title="제목" description="설명" action={<Button>...</Button>} />
```

**StatCard** — 수치 통계 표시:
```typescript
<StatCard title="라벨" value="값" icon={Icon} trend={12.5} />
```

**useConfirm** — 삭제 등 확인 다이얼로그:
```typescript
const [dialog, confirm] = useConfirm({ title, description, variant: "destructive" })
// JSX에 {dialog} 렌더링 필수
```

**Spinner** — 로딩 표시: `<Spinner size="sm" | "md" | "lg" />`

### 페이지 생성 체크리스트

1. `src/app/[route]/page.tsx` 생성
2. `config/site.ts`의 `mainNav` 배열에 항목 추가 **(동시 수정 필수)**
3. `export const metadata: Metadata = { title, description }` 포함
4. `<Container className="py-10">` 최상위 래퍼 사용

---

## API 라우트 규칙

### OpenAI 연동 (`src/app/api/generate-scrum/route.ts`)

- 모델: **`gpt-4o-mini`** 고정 (다른 모델 사용 금지)
- API 키: `process.env.OPENAI_API_KEY` (서버 사이드 전용)
- **Claude API 사용 금지**
- 요청/응답 Zod 스키마는 `lib/validations/scrum.ts`에 정의

### 포맷 변환 (`lib/scrum-formatter.ts`)

- 슬랙 포맷, 마크다운 포맷 변환 로직은 이 파일에만 구현
- `ScrumFormat` 타입(`"slack" | "markdown"`)에 따라 분기

---

## 다중 파일 연동 규칙 (필수)

아래 작업 수행 시 **반드시 동시에 수정**해야 하는 파일 목록:

| 작업 | 수정 필수 파일 |
|------|--------------|
| 새 페이지 추가 | `src/app/[route]/page.tsx` + `config/site.ts` |
| 새 타입 추가 | `types/index.ts` (단독) |
| 새 Zod 스키마 추가 | `lib/validations/[domain].ts` |
| 새 Zustand 스토어 추가 | `stores/use-[domain]-store.ts` |
| WorkTag / WorkStatus 값 추가 | `types/index.ts` (레이블 상수도 동시 업데이트) |
| 공유 기능 수정 | `stores/use-scrum-store.ts` + `src/app/share/[id]/page.tsx` |
| 포맷 변경 | `lib/scrum-formatter.ts` + `types/index.ts`의 `ScrumFormat` |

---

## E2E 테스트 규칙 (Playwright MCP)

**아래 기능 구현 시 Playwright MCP 테스트 필수 — 테스트 통과 전 완료 처리 금지:**

| 대상 | 필수 여부 |
|------|----------|
| OpenAI API 연동 (`/api/generate-scrum`) | 필수 |
| 포맷 변환 로직 (`lib/scrum-formatter.ts`) | 필수 |
| 공유 링크 생성 & 조회 | 필수 |
| UI 컴포넌트 (폼, 카드 등) | 권장 |

**테스트 순서:**
```
pnpm dev 실행 → browser_navigate → browser_snapshot → browser_click/type → browser_snapshot → 결과 확인
```

---

## AI 의사결정 기준

### 컴포넌트 위치 결정 트리

```
재사용 가능 + 도메인 무관?
  → components/ui/

재사용 가능 + 특정 도메인?
  → components/[domain]/

단일 페이지 전용 + 복잡한 로직?
  → 동일 디렉토리에 별도 파일로 분리

단일 페이지 전용 + 간단?
  → page.tsx 내에 인라인
```

### 상태 관리 결정 트리

```
서버 데이터 캐시가 필요한가?
  → Server Component + fetch 사용

여러 컴포넌트에서 공유되는 클라이언트 상태?
  → Zustand 스토어 사용

단일 컴포넌트 내 UI 상태?
  → useState 사용
```

### 스크럼 생성 흐름

```
useWorklogStore.getTodayWorkLog()
  → 작업 항목이 없으면 스크럼 생성 버튼 비활성화
  → 작업 항목 있으면 POST /api/generate-scrum
  → useScrumStore.applyGeneratedScrum() 로 저장
  → scrum-formatter.ts 로 포맷 변환 후 출력
  → useScrumStore.saveScrum() 로 shareId 보존
```

---

## 금지 사항

- **`any` 타입 사용 금지** — `unknown` 또는 명시적 타입으로 대체
- **Claude API 사용 금지** — 반드시 OpenAI API(`gpt-4o-mini`)만 사용
- **`import { z } from "zod"` 금지** — 반드시 `"zod/v4"` 사용
- **`types/index.ts` 외부에 타입 정의 금지** — 타입은 한 곳에 집중
- **`config/site.ts` 동기화 없이 페이지 추가 금지** — 네비게이션 누락 방지
- **localStorage 키 임의 변경 금지** — 기존 사용자 데이터 손실 방지
- **환경변수 `OPENAI_API_KEY` 클라이언트 노출 금지** — API 라우트에서만 사용
- **Zustand 스토어 파일에 `"use client"` 누락 금지**
- **API 연동 구현 후 Playwright 테스트 생략 금지**
