# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Next.js 16.1.6 + React 19.2.3 + Tailwind CSS v4 + shadcn/ui 기반의 모던 웹 스타터킷입니다.

**주요 기술 스택:**
- Next.js 16.1.6 (App Router)
- React 19.2.3
- TypeScript 5
- Tailwind CSS v4
- shadcn/ui 컴포넌트
- Zustand 5.0.11 (상태 관리)
- React Hook Form 7 + Zod 4 (폼 검증)
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
├── src/app/                # Next.js App Router 페이지
│   ├── layout.tsx         # 루트 레이아웃 (ThemeProvider, Header/Footer)
│   ├── page.tsx           # 홈 페이지
│   ├── not-found.tsx      # 커스텀 404 페이지
│   ├── about/             # About 페이지
│   └── blog/              # Blog 페이지
├── components/            # React 컴포넌트
│   ├── ui/                # shadcn/ui 기반 재사용 컴포넌트
│   ├── layout/            # 레이아웃 컴포넌트
│   │   ├── site-header.tsx    # 헤더
│   │   ├── site-footer.tsx    # 푸터
│   │   ├── container.tsx      # 반응형 컨테이너
│   │   ├── main-nav.tsx       # 데스크톱 네비게이션
│   │   └── mobile-nav.tsx     # 모바일 네비게이션
│   ├── providers.tsx      # Context Providers
│   └── theme-toggle.tsx   # 테마 토글 버튼
├── config/                # 애플리케이션 설정
│   └── site.ts            # 사이트 메타데이터 및 네비게이션 설정
├── lib/                   # 유틸리티 라이브러리
│   └── validations/       # Zod 검증 스키마
├── stores/                # Zustand 상태 관리 스토어
├── hooks/                 # 커스텀 React 훅
│   └── use-confirm.tsx    # Promise 기반 확인 다이얼로그 훅
├── types/                 # TypeScript 타입 정의
├── public/                # 정적 파일
├── .claude/               # Claude Code 설정
│   ├── agents/            # 커스텀 에이전트
│   │   └── code-reviewer.md
│   ├── commands/          # 커스텀 커맨드
│   │   ├── review.md      # /review 커맨드
│   │   └── git/commit.md  # /git:commit 커맨드
│   └── hooks/             # 이벤트 훅
│       └── slack-notify.sh
└── .mcp.json              # MCP 서버 설정
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

- **playwright**: E2E 테스팅 및 브라우저 자동화
- **context7**: 라이브러리 문서 검색 (최신 API 참조)
- **sequential-thinking**: 복잡한 문제 단계별 추론
- **shadcn**: shadcn/ui 컴포넌트 관리 및 설치

### 커스텀 커맨드 (.claude/commands/)

- `/review`: 브랜치 머지 전 코드 품질 검증 (lint, build, AI 리뷰)
- `/git:commit`: 이모지 컨벤셔널 커밋 포맷으로 커밋 메시지 생성

### 코드 리뷰어 에이전트 (.claude/agents/code-reviewer.md)

구현 완료 후 자동으로 코드 리뷰를 실행하는 에이전트입니다.
TypeScript 타입 안전성, 접근성, 다크모드, 반응형 등을 체크합니다.

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

## 주의사항

- **포트 충돌:** 개발 서버 실행 시 3000번 포트가 사용 중이면 자동으로 3001번 포트 사용
- **Fast Refresh:** 파일 저장 시 자동으로 브라우저 업데이트
- **TypeScript 에러:** `pnpm build` 전에 타입 에러 해결 필수
- **404 페이지:** `src/app/not-found.tsx`가 모든 정의되지 않은 경로에서 표시됨
