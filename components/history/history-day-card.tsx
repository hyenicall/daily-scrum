import type { WorkLog } from "@/types"
import { Badge } from "@/components/ui/badge"
import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import { WorkTagBadge, WorkStatusBadge } from "@/components/worklog/work-item-badge"

interface HistoryDayCardProps {
  log: WorkLog
  hasScrumGenerated: boolean
}

/** 날짜 문자열을 한국어 형식으로 변환 (예: 2026-02-22 → 2026년 2월 22일 (일)) */
function formatDateKo(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00")
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  })
}

export function HistoryDayCard({ log, hasScrumGenerated }: HistoryDayCardProps) {
  const sortedItems = [...log.items].sort((a, b) => a.order - b.order)

  return (
    <AccordionItem value={log.date}>
      <AccordionTrigger className="hover:no-underline">
        {/* 헤더: 날짜 + 뱃지들 */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{formatDateKo(log.date)}</span>
          <Badge variant="outline">{log.items.length}개</Badge>
          {hasScrumGenerated && (
            <Badge variant="secondary">스크럼 생성됨</Badge>
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent>
        {sortedItems.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            작업 항목이 없습니다
          </p>
        ) : (
          <ul className="space-y-2">
            {sortedItems.map((item) => (
              <li key={item.id} className="flex flex-wrap items-start gap-2">
                <WorkTagBadge tag={item.tag} />
                <WorkStatusBadge status={item.status} />
                <p className="text-sm leading-5 text-foreground">{item.content}</p>
              </li>
            ))}
          </ul>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}
