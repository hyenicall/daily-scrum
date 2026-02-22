# 코드 리뷰어 에이전트 메모리

## 프로젝트 개요
- Next.js 16.1.6 (App Router), React 19.2.3, TypeScript 5 (strict), Tailwind CSS v4, shadcn/ui
- pnpm 패키지 매니저 사용
- `@/*` 경로 별칭은 프로젝트 루트(`./`)를 가리킴

## 아키텍처 결정 사항
- 컴포넌트 루트: `/components/` (src 외부)
- 페이지: `/src/app/` (App Router)
- 타입 정의 단일 파일: `/types/index.ts`
- 검증 스키마: `/lib/validations/`
- 전역 상태: `/stores/`
- 커스텀 훅: `/hooks/`

## 발견된 프로젝트 패턴
- EmptyState + Container 조합 패턴 (not-found, blog 페이지에 적용됨)
- `as const` 사용으로 배열 타입 고정 (features, techStack 등)
- shadcn/ui 컴포넌트들은 `import * as React from "react"` 방식 사용
- 커스텀 컴포넌트들은 React 자동 import 방식 사용 (React 17+ JSX transform)
- `cn()` 유틸리티 일관적으로 사용됨
- Server Component 우선 원칙 잘 지켜짐

## 확인된 이슈 목록 (2026-02-20 첫 전체 리뷰)
1. [Minor] `not-found.tsx` - metadata export 위치가 default export 이후에 위치 (관례상 위로 올리는 것 권장)
2. [Minor] `not-found.tsx` - metadata 타입 명시 누락 (`Metadata` 타입 미사용)
3. [Minor] `about/page.tsx` - metadata export 누락 (SEO 설정 없음)
4. [Minor] `blog/page.tsx` - metadata export 누락 (SEO 설정 없음)
5. [Minor] `site.ts` - `links.github` 값이 플레이스홀더 URL ("https://github.com")
6. [Minor] `types/index.ts` - `NavItem.external` 필드가 정의되어 있으나 실제 사용 안 됨
7. [Minor] `stat-card.tsx` - 하드코딩된 색상 값 (`text-green-500`, `text-red-500`) - 다크모드 호환 가능하나 디자인 토큰 사용 권장
8. [Minor] `CLAUDE.md` - Next.js 버전 표기 오류 (16.1.6이라고 표기, 실제도 16.1.6)
9. [Major] `use-confirm.tsx` - 훅 내부에서 컴포넌트를 반환하는 패턴은 렌더링 최적화 이슈 가능 (매 렌더마다 새 함수 참조)
10. [Minor] `sonner.tsx` - `theme as ToasterProps["theme"]` 타입 캐스팅 사용 (불가피하나 주석 권장)
11. [Minor] `container.tsx` - `React` import 누락 (JSX 사용하나 React 명시적 미import - React 17+ transform으로 정상 동작)

## 잘 구현된 패턴
- any 타입 전혀 사용 안 함 (엄격한 TypeScript)
- 모든 컴포넌트에 명시적 Props 타입 정의
- Server Component 우선 원칙 준수 (use client는 꼭 필요한 곳에만)
- 접근성: sr-only 스크린리더 텍스트, semantic HTML 요소 사용
- 반응형 디자인 일관 적용 (mobile-first)
- Zustand 스토어 패턴 명확하게 구현
- forwardRef + displayName 패턴 올바르게 사용 (PasswordInput, SearchInput)
- useCallback으로 불필요한 리렌더 방지

## 자주 발생하는 이슈 패턴 (프로젝트 공통)
- 새 페이지 추가 시 metadata export 누락 가능성 높음
- metadata 타입(`Metadata`)을 명시하지 않는 경우 발생
