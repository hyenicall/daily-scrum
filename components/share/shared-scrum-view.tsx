import { Share2 } from "lucide-react"
import Link from "next/link"

import { formatAsSlack } from "@/lib/scrum-formatter"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/scrum/copy-button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { DailyScrum } from "@/types"

interface SharedScrumViewProps {
  /** 서버에서 조회한 스크럼 데이터 (없으면 null) */
  scrum: DailyScrum | null
}

// 순수 presentational Server Component — useScrumStore 의존 없음
export function SharedScrumView({ scrum }: SharedScrumViewProps) {
  // 스크럼 없음: EmptyState
  if (!scrum) {
    return (
      <EmptyState
        icon={Share2}
        title="스크럼을 찾을 수 없습니다"
        description="링크가 올바른지 확인하거나 스크럼 작성자에게 문의하세요"
        action={
          <Button asChild variant="outline">
            <Link href="/">홈으로 이동</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* 날짜 헤더 + 복사 버튼 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{scrum.date} 데일리 스크럼</h2>
        <CopyButton text={formatAsSlack(scrum)} />
      </div>

      {/* 어제 한 일 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">어제 한 일</CardTitle>
        </CardHeader>
        <CardContent>
          {scrum.yesterday.length > 0 ? (
            <ul className="space-y-1">
              {scrum.yesterday.map((item, idx) => (
                <li key={idx} className="text-sm text-muted-foreground">
                  • {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">• (없음)</p>
          )}
        </CardContent>
      </Card>

      {/* 오늘 할 일 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">오늘 할 일</CardTitle>
        </CardHeader>
        <CardContent>
          {scrum.today.length > 0 ? (
            <ul className="space-y-1">
              {scrum.today.map((item, idx) => (
                <li key={idx} className="text-sm text-muted-foreground">
                  • {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">• (없음)</p>
          )}
        </CardContent>
      </Card>

      {/* 블로커 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">블로커</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            • {scrum.blocker.trim() || "없음"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
