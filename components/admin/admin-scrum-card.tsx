import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { DailyScrum, TeamMember } from "@/types"

interface AdminScrumCardProps {
  scrum: DailyScrum
  member?: TeamMember
}

// 개별 팀원 스크럼 카드 — Server Component
export function AdminScrumCard({ scrum, member }: AdminScrumCardProps) {
  const memberName = member?.profile?.displayName
    ?? member?.profile?.email
    ?? "알 수 없음"

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{memberName}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {scrum.date}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {/* 어제 한 일 */}
        <div>
          <p className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
            어제 한 일
          </p>
          {scrum.yesterday.length > 0 ? (
            <ul className="space-y-0.5">
              {scrum.yesterday.map((item, idx) => (
                <li key={idx} className="text-sm text-foreground">
                  • {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">-</p>
          )}
        </div>

        {/* 오늘 할 일 */}
        <div>
          <p className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
            오늘 할 일
          </p>
          {scrum.today.length > 0 ? (
            <ul className="space-y-0.5">
              {scrum.today.map((item, idx) => (
                <li key={idx} className="text-sm text-foreground">
                  • {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">-</p>
          )}
        </div>

        {/* 블로커 */}
        {scrum.blocker && scrum.blocker !== "없음" && (
          <div>
            <p className="mb-1 font-medium text-muted-foreground text-xs uppercase tracking-wide">
              블로커
            </p>
            <p className="text-sm text-destructive">{scrum.blocker}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
