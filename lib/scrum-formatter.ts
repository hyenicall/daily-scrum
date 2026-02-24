import type { DailyScrum } from "@/types"

// 요일 한국어 매핑
const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"]

/** 날짜 문자열 "YYYY-MM-DD" → "N월 N일 (요일)" */
function formatDateKo(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const dayName = DAY_NAMES[date.getDay()]
  return `${month}월 ${day}일 (${dayName})`
}

/** 슬랙 포맷으로 변환 */
export function formatAsSlack(scrum: DailyScrum): string {
  const dateLabel = formatDateKo(scrum.date)
  const blocker = scrum.blocker.trim() || "없음"

  const yesterdayLines = scrum.yesterday.length > 0
    ? scrum.yesterday.map((item) => `• ${item}`).join("\n")
    : "• (없음)"

  const todayLines = scrum.today.length > 0
    ? scrum.today.map((item) => `• ${item}`).join("\n")
    : "• (없음)"

  return [
    `📅 데일리 스크럼 - ${dateLabel}`,
    "",
    "✅ 어제 한 일",
    yesterdayLines,
    "",
    "🔨 오늘 할 일",
    todayLines,
    "",
    "⚠️ 블로커",
    `• ${blocker}`,
  ].join("\n")
}

/** 마크다운 포맷으로 변환 */
export function formatAsMarkdown(scrum: DailyScrum): string {
  const blocker = scrum.blocker.trim() || "없음"

  const yesterdayLines = scrum.yesterday.length > 0
    ? scrum.yesterday.map((item) => `- ${item}`).join("\n")
    : "- (없음)"

  const todayLines = scrum.today.length > 0
    ? scrum.today.map((item) => `- ${item}`).join("\n")
    : "- (없음)"

  return [
    `## 데일리 스크럼 - ${scrum.date}`,
    "",
    "### 어제 한 일",
    yesterdayLines,
    "",
    "### 오늘 할 일",
    todayLines,
    "",
    "### 블로커",
    `- ${blocker}`,
  ].join("\n")
}
