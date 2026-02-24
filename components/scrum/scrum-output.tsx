"use client"

import { useScrumStore } from "@/stores/use-scrum-store"
import { formatAsSlack, formatAsMarkdown } from "@/lib/scrum-formatter"
import { CopyButton } from "./copy-button"
import { FormatSelector } from "./format-selector"
import { ShareButton } from "./share-button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ScrumOutputProps {
  date: string
}

export function ScrumOutput({ date }: ScrumOutputProps) {
  // format 변경 시 자동 리렌더링을 위해 scrum 전체 구독
  const scrum = useScrumStore((state) => state.getScrum(date))

  // 스크럼 없으면 렌더링하지 않음
  if (!scrum) return null

  // 포맷에 따라 텍스트 변환
  const text =
    scrum.format === "slack"
      ? formatAsSlack(scrum)
      : formatAsMarkdown(scrum)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">최종 스크럼 출력</CardTitle>
          <div className="flex items-center gap-2">
            <ShareButton date={date} />
            <CopyButton text={text} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <FormatSelector date={date} />
        <pre className="whitespace-pre-wrap font-mono text-sm bg-muted rounded-md p-4 overflow-x-auto">
          {text}
        </pre>
      </CardContent>
    </Card>
  )
}
