// ============================================================
// 공통 네비게이션 / 사이트 설정 타입
// ============================================================

export interface NavItem {
  title: string
  href: string
  disabled?: boolean
  external?: boolean
}

export interface SiteConfig {
  name: string
  description: string
  mainNav: NavItem[]
  links: {
    github: string
  }
}

// ============================================================
// 워크로그 도메인 타입
// ============================================================

/** 작업 항목의 태그 분류 */
export type WorkTag =
  | "feature"   // 기능 개발
  | "bugfix"    // 버그 수정
  | "meeting"   // 회의
  | "review"    // 코드 리뷰
  | "etc"       // 기타

/** 작업 항목의 진행 상태 */
export type WorkStatus =
  | "done"        // 완료
  | "in-progress" // 진행 중
  | "blocked"     // 블로킹

/** 개별 작업 항목 */
export interface WorkItem {
  id: string
  content: string     // 작업 내용 (자유 텍스트)
  tag: WorkTag
  status: WorkStatus
  order: number       // 정렬 순서
}

/** 날짜별 워크로그 */
export interface WorkLog {
  id: string
  date: string        // "YYYY-MM-DD" 형식
  items: WorkItem[]
  createdAt: Date
  updatedAt: Date
}

// ============================================================
// 스크럼 도메인 타입
// ============================================================

/** 스크럼 출력 형식 */
export type ScrumFormat = "slack" | "markdown"

/** 데일리 스크럼 */
export interface DailyScrum {
  id: string
  date: string
  yesterday: string[] // AI 생성 요약 (수정 가능)
  today: string[]     // 오늘 계획 초안 (수정 가능)
  blocker: string     // 기본값: "없음"
  format: ScrumFormat
  shareId: string     // 공유 링크용 고유 ID
  userId?: string     // 팀 스크럼 조회 시 사용 (선택적)
  createdAt: Date
}

// ============================================================
// 사용자 프로필 타입
// ============================================================

export interface UserProfile {
  id: string
  email: string | null
  displayName: string | null
  createdAt: Date
}

// ============================================================
// 팀 도메인 타입
// ============================================================

export type TeamMemberRole = "admin" | "member"

export interface Team {
  id: string
  name: string
  adminUserId: string
}

export interface TeamMember {
  teamId: string
  userId: string
  role: TeamMemberRole
  profile?: UserProfile
}

// ============================================================
// 주간 회고 타입
// ============================================================

export interface WeeklyReview {
  id: string
  userId: string
  weekStart: string   // "YYYY-MM-DD" 형식 (월요일 기준)
  weekEnd: string     // "YYYY-MM-DD" 형식 (일요일 기준)
  summary: string[]   // 주간 성과 요약
  highlights: string[]  // 주요 하이라이트
  improvements: string[]  // 개선 사항
  nextWeekGoals: string[] // 다음 주 목표
  createdAt: Date
}

// ============================================================
// WorkTag / WorkStatus 레이블 매핑 (UI 표시용)
// ============================================================

export const WORK_TAG_LABELS: Record<WorkTag, string> = {
  feature: "기능",
  bugfix: "버그수정",
  meeting: "회의",
  review: "리뷰",
  etc: "기타",
}

export const WORK_STATUS_LABELS: Record<WorkStatus, string> = {
  done: "완료",
  "in-progress": "진행 중",
  blocked: "블로킹",
}

/** WorkTag 목록 (셀렉트 옵션용) */
export const WORK_TAGS: WorkTag[] = [
  "feature",
  "bugfix",
  "meeting",
  "review",
  "etc",
]

/** WorkStatus 목록 (셀렉트 옵션용) */
export const WORK_STATUSES: WorkStatus[] = ["done", "in-progress", "blocked"]
