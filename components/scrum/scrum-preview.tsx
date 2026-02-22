"use client"

import { Plus, X } from "lucide-react"

import { useScrumStore } from "@/stores/use-scrum-store"
import type { ScrumFormat } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ScrumPreviewProps {
  date: string
}

export function ScrumPreview({ date }: ScrumPreviewProps) {
  const { getScrum, updateScrumField } = useScrumStore()
  const scrum = getScrum(date)

  // 스크럼이 없으면 렌더링하지 않음
  if (!scrum) return null

  /** yesterday 배열의 특정 인덱스 텍스트 수정 */
  const handleYesterdayChange = (index: number, value: string) => {
    const updated = [...scrum.yesterday]
    updated[index] = value
    updateScrumField(date, "yesterday", updated)
  }

  /** today 배열의 특정 인덱스 텍스트 수정 */
  const handleTodayChange = (index: number, value: string) => {
    const updated = [...scrum.today]
    updated[index] = value
    updateScrumField(date, "today", updated)
  }

  /** yesterday 항목 추가 */
  const handleAddYesterday = () => {
    updateScrumField(date, "yesterday", [...scrum.yesterday, ""])
  }

  /** today 항목 추가 */
  const handleAddToday = () => {
    updateScrumField(date, "today", [...scrum.today, ""])
  }

  /** yesterday 항목 삭제 */
  const handleRemoveYesterday = (index: number) => {
    const updated = scrum.yesterday.filter((_, i) => i !== index)
    updateScrumField(date, "yesterday", updated)
  }

  /** today 항목 삭제 */
  const handleRemoveToday = (index: number) => {
    const updated = scrum.today.filter((_, i) => i !== index)
    updateScrumField(date, "today", updated)
  }

  /** blocker 텍스트 수정 */
  const handleBlockerChange = (value: string) => {
    updateScrumField(date, "blocker", value)
  }

  /** 포맷 변경 */
  const handleFormatChange = (value: ScrumFormat) => {
    updateScrumField(date, "format", value)
  }

  return (
    <div className="space-y-4">
      {/* 어제 한 일 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">어제 한 일</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {scrum.yesterday.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={item}
                onChange={(e) => handleYesterdayChange(index, e.target.value)}
                placeholder="어제 한 일을 입력하세요"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveYesterday(index)}
                aria-label="항목 삭제"
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddYesterday}
            className="w-full"
          >
            <Plus className="mr-2 size-4" />
            항목 추가
          </Button>
        </CardContent>
      </Card>

      {/* 오늘 할 일 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">오늘 할 일</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {scrum.today.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={item}
                onChange={(e) => handleTodayChange(index, e.target.value)}
                placeholder="오늘 할 일을 입력하세요"
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveToday(index)}
                aria-label="항목 삭제"
                className="shrink-0 text-muted-foreground hover:text-destructive"
              >
                <X className="size-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddToday}
            className="w-full"
          >
            <Plus className="mr-2 size-4" />
            항목 추가
          </Button>
        </CardContent>
      </Card>

      {/* 블로커 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">블로커</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={scrum.blocker}
            onChange={(e) => handleBlockerChange(e.target.value)}
            placeholder="방해 요소가 있으면 입력하세요 (없으면 '없음')"
            rows={3}
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* 포맷 선택 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">출력 포맷</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={scrum.format === "slack" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFormatChange("slack")}
            >
              Slack
            </Button>
            <Button
              type="button"
              variant={scrum.format === "markdown" ? "default" : "outline"}
              size="sm"
              onClick={() => handleFormatChange("markdown")}
            >
              Markdown
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
