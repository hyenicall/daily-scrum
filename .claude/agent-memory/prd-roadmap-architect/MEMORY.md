# PRD Roadmap Architect - 에이전트 메모리

> 이 프로젝트: 데일리 워크로그 & 스크럼 자동 생성기
> 스택: Next.js 16.1.6 + React 19 + Tailwind v4 + shadcn/ui + Zustand 5 + Zod 4

## 프로젝트 핵심 구조

- 타입 정의: `types/index.ts` (WorkLog, WorkItem, DailyScrum, WorkTag, WorkStatus 완료)
- 스토어: `stores/use-worklog-store.ts`, `stores/use-scrum-store.ts` (localStorage persist 완료)
- 검증 스키마: `lib/validations/worklog.ts` (workItemSchema, scrumEditSchema 완료)
- 페이지 라우트: `/`, `/scrum`, `/history`, `/share/[id]` (플레이스홀더 완료)
- 네비게이션: `config/site.ts`에 3개 메뉴 등록 완료

## 재사용 가능한 컴포넌트

- `EmptyState`: 빈 상태/에러 페이지 (icon, title, description, action props)
- `StatCard`: 통계 수치 표시 (title, value, icon, trend)
- `useConfirm`: 삭제 확인 다이얼로그 훅 (`[dialog, confirm]` 튜플 반환)
- `Spinner`: 로딩 인디케이터 (size: sm/md/lg)
- `useCopyToClipboard`: usehooks-ts 제공, 클립보드 복사
- `toast()`: Sonner 기반, Toaster가 루트에 이미 설정됨

## PRD → ROADMAP 변환 패턴

- PRD의 개발 순서(Day N)를 각 Phase 내 마일스톤으로 변환
- 각 Day마다 구체적인 파일 경로 + 구현 방법 + DoD 명시
- "가정" 태그로 불확실한 부분 표시, 미결 사항 섹션 별도 추가
- 기술적 의존성은 Mermaid graph TD로 시각화
- 환경변수 섹션 별도 추가 (AI API 키 등)

## 이 프로젝트의 특이사항

- Zod v4 사용: `import { z } from "zod/v4"` (일반 `"zod"` 아님)
- Next.js 15+: params가 Promise → `const { id } = await params`
- localStorage 기반 MVP → v2에서 Supabase 연동 예정
- Claude API 모델: `claude-haiku-4-5` (빠르고 저렴)
- AI API 키는 Route Handler에서만 사용 (클라이언트 노출 금지)
- 상세 참조: `docs/patterns.md`

## 구현 완료 현황 (2026-02-22 기준)

- Day 0: 완료 (프로젝트 골격 전체)
- Day 1: 완료 (WorkItemForm, WorkItemCard, WorklogList, DateSelector)
- Notion 연동: 선행 구현 완료 (PRD v2 기능, 사용자 요청으로 조기 구현)
  - `lib/notion.ts`, `api/notion/upload/route.ts`, `api/notion/page/route.ts`
  - `components/worklog/notion-sync.tsx` (WorklogList 하단에 통합)
  - 환경변수: `NOTION_API_KEY`, `NOTION_PARENT_PAGE_ID`
  - 패키지: `@notionhq/client 5.9.0`

## ROADMAP 업데이트 패턴

- 선행 구현 시: Day 섹션 사이에 별도 섹션으로 추가 + Phase 2에 완료 표시 + 제외 범위에서 취소선 처리
- 완료 항목은 `[ ]` → `[x]` 체크, 버전/날짜 변경 이력 필수 추가
