---
description: '브랜치 머지 전 코드 품질 검증 및 AI 리뷰'
allowed-tools:
  [
    'Bash(git diff:*)',
    'Bash(git log:*)',
    'Bash(git branch:*)',
    'Bash(git status:*)',
    'Bash(pnpm lint:*)',
    'Bash(pnpm build:*)',
    'Read',
    'Glob',
  ]
---

# 머지 전 코드 리뷰

main 브랜치 대비 변경사항을 검증하고 AI 리뷰를 수행합니다.

## 프로세스

아래 순서대로 모두 실행하세요.

### 1단계: 변경사항 파악

```bash
git branch --show-current
git log main..HEAD --oneline
git diff main...HEAD --name-only
git diff main...HEAD
```

### 2단계: Lint 검사

```bash
pnpm lint 2>&1
```

에러/경고를 수집하고 기록합니다.

### 3단계: Build / TypeScript 타입 체크

```bash
pnpm build 2>&1
```

타입 에러, 빌드 에러를 수집하고 기록합니다.

### 4단계: 변경 파일 코드 읽기

`git diff --name-only`로 확인된 파일을 Read 도구로 읽어 코드 내용을 파악합니다.

### 5단계: 리뷰 리포트 출력

아래 포맷으로 최종 리포트를 출력합니다.

---

## 리뷰 체크 항목

변경된 코드를 리뷰할 때 아래 항목을 기준으로 검토합니다.

- **Lint**: ESLint 에러/경고 여부
- **TypeScript**: 타입 에러, `any` 타입 사용 여부
- **컨벤션**: 컴포넌트 분리, Server/Client Component 적절한 사용
- **보안**: XSS, 민감 정보 노출 가능성
- **성능**: 불필요한 리렌더링, 큰 번들 추가 여부
- **코드 품질**: 중복 코드, 복잡한 로직, 누락된 예외 처리

---

## 출력 포맷

```
## 🔍 머지 전 리뷰 리포트

**브랜치:** `현재브랜치` → `main`
**커밋 수:** N개

---

### 📋 변경 파일 (N개)
- `경로/파일명` — 변경 유형 (추가/수정/삭제)

---

### ✅ Lint  (또는 ❌ Lint)
- 에러/경고 요약 (없으면 "에러 없음")

### ✅ Build / TypeScript  (또는 ❌ Build / TypeScript)
- 에러 요약 (없으면 "에러 없음")

---

### 🤖 AI 코드 리뷰

#### `파일명`
- 🔴 **심각**: ...
- 🟡 **경고**: ...
- 🟢 **제안**: ...

---

### 🚀 머지 가능 여부

✅ **머지 가능** — 이유 요약
(또는)
❌ **머지 불가** — 해결 필요 항목 목록
```

---

## 주의사항

- lint/build는 반드시 실제 실행 결과를 사용합니다 (추측 금지)
- 변경 파일이 없으면 "변경 파일 없음"으로 리포트 종료
- 심각도: 🔴 버그/에러 가능성 | 🟡 컨벤션/성능 경고 | 🟢 개선 제안
