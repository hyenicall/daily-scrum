# Next.js App Router Dev - 프로젝트 메모리

## 프로젝트 기본 정보
- 경로: `/Users/jihye/workspace/daily-scrum`
- Next.js 16.1.6 (App Router), React 19, TypeScript strict
- 패키지 매니저: pnpm

## 핵심 파일 위치
- 타입: `types/index.ts` (WorkItem, WorkLog, DailyScrum, ScrumFormat 등)
- 워크로그 스토어: `stores/use-worklog-store.ts` — `workLogs: Record<string, WorkLog>`, `getWorkLog(date)`, `addWorkItem()`, `ensureWorkLog(date)`
- 스크럼 스토어: `stores/use-scrum-store.ts` — `scrums: Record<string, DailyScrum>`, `getScrum(date)`, `getScrumByShareId(shareId)`, `saveScrum()`, `applyGeneratedScrum()`
- 사이트 설정: `config/site.ts` (mainNav 배열로 네비게이션 관리)

## 확인된 컴포넌트 패턴

### mounted 패턴 (SSR hydration mismatch 방지)
```typescript
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
const data = mounted ? store.data : []
```

### EmptyState 사용법
```typescript
<EmptyState
  icon={History}
  title="아직 기록이 없습니다"
  description="설명"
  action={<Button asChild><Link href="/">이동</Link></Button>}
/>
```

### WorkTagBadge / WorkStatusBadge
- 위치: `components/worklog/work-item-badge.tsx`
- `"use client"` 선언 필요 (이 파일 자체가 Client Component)

### Accordion 사용법
```typescript
<Accordion type="multiple" className="w-full">
  <AccordionItem value={uniqueKey}>
    <AccordionTrigger>...</AccordionTrigger>
    <AccordionContent>...</AccordionContent>
  </AccordionItem>
</Accordion>
```
- `type="multiple"` 로 여러 개 동시 열기 가능
- `AccordionItem`의 `value`는 고유값 필요 (날짜 문자열 활용)

## 구현 완료 현황
- Day 1: 워크로그 입력 UI (WorklogList, WorkItemCard, WorkItemForm, DateSelector)
- Day 1+: Notion 연동 (NotionSync 컴포넌트, /api/notion/page, /api/notion/upload)
- Day 2: 기록 조회 페이지 (HistoryList, HistoryDayCard, /history page)
- Day 3: OpenAI API 연동 + 스크럼 자동 생성
  - `lib/validations/scrum.ts` — Zod 스키마 (GenerateScrumRequest/Response)
  - `src/app/api/generate-scrum/route.ts` — OpenAI gpt-4o-mini Route Handler
  - `components/scrum/scrum-preview.tsx` — 생성 결과 편집 UI (Client Component)
  - `components/scrum/scrum-generator.tsx` — 생성 흐름 제어 (Client Component)
  - `src/app/scrum/page.tsx` — ScrumGenerator 탑재 (Server Component)
- Day 4: 포맷 선택 + 클립보드 복사
  - `lib/scrum-formatter.ts` — formatAsSlack / formatAsMarkdown 변환 유틸
  - `components/scrum/copy-button.tsx` — useCopyToClipboard + toast.success (Client Component)
  - `components/scrum/scrum-output.tsx` — 포맷된 텍스트 pre 출력 + CopyButton (Client Component)
  - scrum-generator.tsx에 ScrumOutput 삽입 (ScrumPreview 바로 아래)

## OpenAI Route Handler 패턴
```typescript
// 환경변수 → request.json() → Zod safeParse → openai.chat.completions.create
// model: "gpt-4o-mini", response_format: { type: "json_object" }
// Zod parse 결과를 NextResponse.json()으로 반환
```
- `import { z } from "zod/v4"` 패턴 필수
- openai 패키지: `pnpm add openai` (버전 6.x)

## 전날 날짜 계산 패턴
```typescript
const yesterday = new Date()
yesterday.setDate(yesterday.getDate() - 1)
const yesterdayStr = yesterday.toISOString().split("T")[0]
```

## 날짜 포맷 변환
```typescript
// "2026-02-22" → "2026년 2월 22일 일"
function formatDateKo(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00")
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  })
}
```
- `T00:00:00` suffix 필수 — 없으면 UTC 기준으로 날짜가 하루 밀릴 수 있음

## 주의사항
- worklog-list.tsx에서 workLogs 직접 구독 시: `const { workLogs } = useWorklogStore()`
- 날짜 내림차순: `Object.keys(workLogs).sort().reverse()`
- HistoryDayCard는 Server Component (use client 없음) — AccordionItem 자체는 Client Component인 Accordion 내부에서 렌더
