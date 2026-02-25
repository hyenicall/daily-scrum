import { CalendarDays } from "lucide-react"

import { EmptyState } from "@/components/ui/empty-state"
import { AdminScrumCard } from "./admin-scrum-card"
import type { DailyScrum, TeamMember } from "@/types"

interface AdminScrumTimelineProps {
  scrums: DailyScrum[]
  members: TeamMember[]
}

// 날짜별로 팀원 스크럼을 그룹핑하여 표시 — Server Component
export function AdminScrumTimeline({ scrums, members }: AdminScrumTimelineProps) {
  if (scrums.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="최근 스크럼이 없습니다"
        description="팀원들이 스크럼을 생성하면 이곳에 표시됩니다"
      />
    )
  }

  // 날짜별로 스크럼 그룹핑 (내림차순)
  const scrumsByDate = scrums.reduce<Record<string, DailyScrum[]>>((acc, scrum) => {
    if (!acc[scrum.date]) acc[scrum.date] = []
    acc[scrum.date].push(scrum)
    return acc
  }, {})

  const sortedDates = Object.keys(scrumsByDate).sort().reverse()

  // userId → TeamMember 맵
  const memberMap = new Map(members.map((m) => [m.userId, m]))

  return (
    <div className="space-y-8">
      {sortedDates.map((date) => {
        const dateScrums = scrumsByDate[date]

        // 날짜 포맷 (한국어)
        const dateLabel = new Date(date + "T00:00:00").toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "short",
        })

        return (
          <div key={date}>
            {/* 날짜 헤더 */}
            <div className="mb-3 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">{dateLabel}</h3>
              <span className="text-xs text-muted-foreground">
                ({dateScrums.length}명 제출)
              </span>
            </div>

            {/* 해당 날짜 팀원 스크럼 카드 그리드 */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {dateScrums.map((scrum) => (
                <AdminScrumCard
                  key={scrum.id}
                  scrum={scrum}
                  member={scrum.userId ? memberMap.get(scrum.userId) : undefined}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
