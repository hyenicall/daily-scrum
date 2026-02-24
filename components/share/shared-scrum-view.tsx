"use client"

import { useState, useEffect } from "react"
import { Share2 } from "lucide-react"
import Link from "next/link"

import { useScrumStore } from "@/stores/use-scrum-store"
import { formatAsSlack } from "@/lib/scrum-formatter"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { CopyButton } from "@/components/scrum/copy-button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SharedScrumViewProps {
  shareId: string
}

export function SharedScrumView({ shareId }: SharedScrumViewProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const scrum = useScrumStore((state) => state.getScrumByShareId(shareId))

  // 마운트 전: SSR hydration 방지용 스피너
  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="md" />
      </div>
    )
  }

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
          <CardTitle className="text-base">✅ 어제 한 일</CardTitle>
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
          <CardTitle className="text-base">🔨 오늘 할 일</CardTitle>
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
          <CardTitle className="text-base">⚠️ 블로커</CardTitle>
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
