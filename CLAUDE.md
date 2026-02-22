# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

**데일리 워크로그 & 스크럼 자동 생성기** — 개발자가 퇴근 전 작업 내용을 빠르게 기록하면 OpenAI가 자동으로 데일리 스크럼 문서를 생성해주는 개인용 도구입니다. 슬랙/노션 호환 포맷 선택, 원클릭 공유 링크 생성을 지원합니다.

> 개발 단계별 태스크 및 완료 기준은 **[docs/ROADMAP.md](./docs/ROADMAP.md)** 를 참고하세요.

**주요 기술 스택:**
- Next.js 16.1.6 (App Router)
- React 19.2.3
- TypeScript 5
- Tailwind CSS v4
- shadcn/ui 컴포넌트
- Zustand 5.0.11 (상태 관리, localStorage persist)
- React Hook Form 7 + Zod 4 (폼 검증)
- OpenAI API `gpt-4o-mini` (스크럼 자동 생성)
- next-themes (다크모드)
- Sonner 2 (토스트 알림)
- Lucide React (아이콘)
- usehooks-ts 3

## 개발 명령어

```bash
# 개발 서버 실행 (http://localhost:3000)
pnpm dev

# 프로덕션 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# ESLint 실행
pnpm lint
```

## 코드 아키텍처

### 디렉토리 구조

```
프로젝트 루트/
├── src/
│   └── app/                     # Next.js App Router 페이지
│       ├── layout.tsx            # 루트 레이아웃 (ThemeProvider, Header/Footer)
│       ├── page.tsx              # 홈 — 오늘의 워크로그 입력
│       ├── not-found.tsx         # 커스텀 404 페이지
│       ├── scrum/
│       │   └── page.tsx          # 스크럼 생성 & 미리보기 & 공유
│       ├── history/
│       │   └── page.tsx          # 날짜별 워크로그 기록 조회
│       ├── share/
│       │   └── [id]/
│       │       └── page.tsx      # 공유 링크 (읽기 전용, 로그인 불필요)
│       └── api/
│           └── generate-scrum/
│               └── route.ts      # OpenAI API Route Handler
├── components/
│   ├── ui/                       # shadcn/ui 기반 재사용 컴포넌트
│   ├── layout/                   # 레이아웃 컴포넌트
│   │   ├── site-header.tsx
│   │   ├── site-footer.tsx
│   │   ├── container.tsx
│   │   ├── main-nav.tsx
│   │   └── mobile-nav.tsx
│   ├── worklog/                  # 워크로그 입력 관련 컴포넌트
│   │   ├── work-item-form.tsx    # 작업 추가/수정 폼
│   │   ├── work-item-card.tsx    # 개별 작업 항목 카드
│   │   ├── work-item-badge.tsx   # 태그/상태 Badge
│   │   ├── worklog-list.tsx      # 작업 목록
│   │   └── date-selector.tsx     # 날짜 선택기
│   ├── history/                  # 기록 조회 관련 컴포넌트
│   │   ├── history-list.tsx
│   │   └── history-day-card.tsx
│   ├── scrum/                    # 스크럼 생성/출력 관련 컴포넌트
│   │   ├── scrum-generator.tsx
│   │   ├── scrum-preview.tsx
│   │   ├── scrum-output.tsx
│   │   ├── format-selector.tsx
│   │   ├── copy-button.tsx
│   │   └── share-button.tsx
│   ├── share/                    # 공유 페이지 관련 컴포넌트
│   │   └── shared-scrum-view.tsx
│   ├── providers.tsx
│   └── theme-toggle.tsx
├── config/
│   └── site.ts                   # 사이트 메타데이터 및 네비게이션 설정
├── lib/
│   ├── scrum-formatter.ts         # 슬랙/마크다운 포맷 변환 유틸
│   └── validations/
│       ├── worklog.ts             # workItemSchema (완료)
│       └── scrum.ts              # API 요청/응답 Zod 스키마
├── stores/
│   ├── use-worklog-store.ts       # 워크로그 Zustand 스토어 (완료)
│   └── use-scrum-store.ts        # 스크럼 Zustand 스토어 (완료)
├── hooks/
│   └── use-confirm.tsx           # Promise 기반 확인 다이얼로그 훅
├── types/
│   └── index.ts                  # WorkLog, WorkItem, DailyScrum 타입 (완료)
├── docs/
│   ├── PRD.md                    # 제품 요구사항 문서
│   └── ROADMAP.md                # 개발 로드맵 (Day 1~5 마일스톤)
├── public/
├── .claude/
│   ├── agents/
│   │   ├── code-reviewer.md
│   │   └── prd-roadmap-architect.md
│   ├── commands/
│   │   ├── review.md
│   │   └── git/commit.md
│   └── hooks/
│       └── slack-notify.sh
└── .mcp.json                     # MCP 서버 설정
```

### 경로 별칭

TypeScript 경로 별칭 `@/*`는 프로젝트 루트를 가리킵니다.

```typescript
import { Button } from "@/components/ui/button"
import { siteConfig } from "@/config/site"
```

### 레이아웃 시스템

**전역 레이아웃 구조:**
- `src/app/layout.tsx`: RootLayout에서 ThemeProvider, SiteHeader, SiteFooter를 제공
- 모든 페이지는 자동으로 헤더/푸터를 포함
- Container 컴포넌트로 반응형 래퍼 제공 (`max-w-screen-xl` 기본값)

**레이아웃 컴포넌트:**
- `SiteHeader`: 로고, 네비게이션 메뉴, 테마 토글
- `SiteFooter`: 저작권, 링크
- `Container`: 반응형 컨테이너 (px-4 sm:px-6 lg:px-8)
- `MainNav`: 데스크톱 네비게이션, `usePathname`으로 현재 경로 감지하여 활성 링크 표시
- `MobileNav`: Sheet 기반 모바일 사이드바 네비게이션

### UI 컴포넌트 패턴

**EmptyState 패턴 (중요):**
빈 상태나 에러 페이지에는 `EmptyState` 컴포넌트를 재사용합니다.

```typescript
<EmptyState
  icon={FileQuestion}           // lucide-react 아이콘
  title="페이지를 찾을 수 없습니다"
  description="설명 텍스트"
  action={<Button>...</Button>} // 선택적 액션 버튼
/>
```

**사용 예시:**
- `src/app/not-found.tsx`: 404 페이지
- `src/app/blog/page.tsx`: 블로그 준비 중

**StatCard 패턴:**
통계 수치 표시에는 `StatCard` 컴포넌트를 사용합니다.

```typescript
<StatCard
  title="총 사용자"
  value="1,234"
  icon={Users}
  trend={12.5}  // 양수: 녹색 상승, 음수: 빨간색 하강
/>
```

**ConfirmDialog + useConfirm 패턴:**
비파괴적 확인이 필요한 작업에는 `useConfirm` 훅을 사용합니다.

```typescript
const [dialog, confirm] = useConfirm({
  title: "정말 삭제하시겠습니까?",
  description: "이 작업은 취소할 수 없습니다.",
  variant: "destructive"
})

const handleDelete = async () => {
  const ok = await confirm()
  if (ok) { /* 삭제 처리 */ }
}

// JSX에서 dialog 렌더링
return (
  <>
    {dialog}
    <Button onClick={handleDelete}>삭제</Button>
  </>
)
```

**기타 입력 컴포넌트:**
- `PasswordInput`: 비밀번호 표시/숨기기 토글 내장 입력
- `SearchInput`: 검색어 입력 + 지우기 버튼 내장
- `Spinner`: 로딩 인디케이터 (`size` prop: `sm` / `md` / `lg`)

**컴포넌트 재사용 원칙:**
- 새로운 페이지 생성 시 기존 컴포넌트를 최대한 재사용
- Container + EmptyState 조합 패턴 따르기
- 다크모드 자동 지원 (theme-aware 컴포넌트 사용)

### Providers 구성

`components/providers.tsx`의 실제 구성:

```typescript
// ThemeProvider > TooltipProvider > children + Toaster 순서
<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
  <TooltipProvider>
    {children}
    <Toaster richColors position="bottom-right" />
  </TooltipProvider>
</ThemeProvider>
```

- `TooltipProvider`가 루트에 있으므로 모든 페이지에서 `Tooltip` 컴포넌트 바로 사용 가능
- `Toaster`는 Sonner 기반, `toast()` 함수로 알림 표시

### 커스텀 훅

**useConfirm** (`hooks/use-confirm.tsx`):
Promise 기반 확인 다이얼로그 훅. `[dialog, confirm]` 튜플 반환.
- `dialog`: JSX에 렌더링할 ConfirmDialog 요소
- `confirm()`: 사용자 응답을 기다리는 Promise (`boolean` 반환)

### 상태 관리

Zustand를 사용하여 전역 상태를 관리합니다.

```typescript
// stores/use-sidebar-store.ts 예시
import { create } from "zustand"

export const useSidebarStore = create<SidebarStore>((set) => ({
  // 상태 및 액션 정의
}))
```

### 폼 검증

React Hook Form + Zod를 사용합니다.

```typescript
// lib/validations/ 에 스키마 정의
import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})
```

### 사이트 설정

`config/site.ts`에서 사이트 메타데이터와 네비게이션을 중앙 관리합니다.

```typescript
export const siteConfig: SiteConfig = {
  name: "Next.js Starter",
  description: "...",
  mainNav: [...],  // 헤더 네비게이션 메뉴
  links: {...},    // 외부 링크 (GitHub 등)
}
```

새로운 네비게이션 항목 추가 시 이 파일만 수정하면 됩니다.

### 테마 시스템

next-themes를 사용하여 다크모드를 지원합니다.

- `components/providers.tsx`: ThemeProvider 설정
- `components/theme-toggle.tsx`: 테마 전환 UI
- 모든 Tailwind 클래스는 `dark:` prefix로 다크모드 스타일 정의

### TypeScript 설정

- `strict` 모드 활성화
- `any` 타입 사용 금지
- 모든 타입은 `types/index.ts`에 정의

## Claude Code 개발 환경

### MCP 서버 설정 (.mcp.json)

프로젝트에 다음 MCP 서버가 설정되어 있습니다:

- **playwright**: E2E 테스팅 및 브라우저 자동화 — **API 연동 / 비즈니스 로직 구현 후 필수 사용**
- **context7**: 라이브러리 문서 검색 (최신 API 참조)
- **sequential-thinking**: 복잡한 문제 단계별 추론
- **shadcn**: shadcn/ui 컴포넌트 관리 및 설치

### 커스텀 커맨드 (.claude/commands/)

- `/review`: 브랜치 머지 전 코드 품질 검증 (lint, build, AI 리뷰)
- `/git:commit`: 이모지 컨벤셔널 커밋 포맷으로 커밋 메시지 생성

### 커스텀 에이전트 (.claude/agents/)

- **code-reviewer**: 구현 완료 후 자동으로 코드 리뷰를 실행합니다. TypeScript 타입 안전성, 접근성, 다크모드, 반응형 등을 체크합니다.
- **prd-roadmap-architect**: PRD를 분석하여 ROADMAP.md를 생성/갱신합니다. OpenAI API 사용 및 Playwright MCP 테스트 원칙이 반영되어 있습니다.

### Slack 알림 훅 (.claude/hooks/slack-notify.sh)

권한 요청 시 / 작업 완료 시 Slack 채널로 알림을 전송합니다.
사용하려면 `SLACK_WEBHOOK_URL` 환경변수를 설정해야 합니다.

## 코딩 규칙

### 컴포넌트 작성

1. **Server Component 우선:** 클라이언트 상태가 필요한 경우에만 `"use client"` 사용
2. **컴포넌트 분리:** 재사용 가능한 단위로 컴포넌트 분리
3. **Props 타입 정의:** 모든 컴포넌트에 명시적 타입 정의

### 네이밍 규칙

- 컴포넌트: PascalCase (`Button`, `EmptyState`)
- 함수/변수: camelCase (`siteConfig`, `useSidebarStore`)
- 파일명: kebab-case 또는 PascalCase

### 스타일링

- Tailwind CSS 클래스 사용
- `cn()` 유틸리티로 조건부 클래스 병합
- 반응형 디자인 필수 (mobile-first)

### 페이지 생성

새 페이지 추가 시:

1. `src/app/[route]/page.tsx` 생성
2. `config/site.ts`에 네비게이션 추가
3. 기존 패턴 따르기 (Container + 내용 컴포넌트)
4. metadata export로 SEO 설정

```typescript
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "페이지 제목",
  description: "페이지 설명",
}
```

## 테스트 원칙

**API 연동 또는 비즈니스 로직을 구현한 경우, 반드시 Playwright MCP로 E2E 테스트를 수행해야 합니다.**

| 대상 | 테스트 필수 여부 |
|------|--------------|
| OpenAI API 연동 (`/api/generate-scrum`) | 필수 |
| 포맷 변환 로직 (`lib/scrum-formatter.ts`) | 필수 |
| 공유 링크 생성 & 조회 | 필수 |
| UI 컴포넌트 (폼, 카드 등) | 권장 |

**Playwright MCP 테스트 흐름:**
```
pnpm dev 실행
→ browser_navigate (테스트 대상 페이지)
→ browser_snapshot (초기 상태 확인)
→ browser_click / browser_type (인터랙션)
→ browser_snapshot (결과 확인)
→ 성공 조건 충족 시 완료 처리
```

> 테스트 통과 전까지 해당 기능을 완료(Done)로 처리하지 않습니다.

## 환경변수

| 변수명 | 필수 여부 | 설명 |
|--------|---------|------|
| `OPENAI_API_KEY` | 필수 (Day 3부터) | OpenAI API 인증 키 |

`.env.local` 파일에 설정:

```bash
OPENAI_API_KEY=sk-...
```

## 주의사항

- **포트 충돌:** 개발 서버 실행 시 3000번 포트가 사용 중이면 자동으로 3001번 포트 사용
- **Fast Refresh:** 파일 저장 시 자동으로 브라우저 업데이트
- **TypeScript 에러:** `pnpm build` 전에 타입 에러 해결 필수
- **404 페이지:** `src/app/not-found.tsx`가 모든 정의되지 않은 경로에서 표시됨
- **AI API:** Claude API 사용 금지 — 반드시 OpenAI API (`gpt-4o-mini`) 사용
