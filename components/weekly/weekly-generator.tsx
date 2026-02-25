"use client"

import { useState, useEffect } from "react"
import { Sparkles, FileText } from "lucide-react"
import { toast } from "sonner"

import { useScrumStore } from "@/stores/use-scrum-store"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { EmptyState } from "@/components/ui/empty-state"
import { WeeklyPreview } from "./weekly-preview"
import type { GenerateWeeklyResponse } from "@/lib/validations/scrum"

// 이번 주 월요일 ~ 오늘까지의 날짜 범위 계산
function getWeekRange(): { weekStart: string; weekEnd: string } {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=일, 1=월, ..., 6=토
  // 월요일 기준 (일요일이면 6일 전이 월요일)
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1

  const monday = new Date(today)
  monday.setDate(today.getDate() - daysFromMonday)

  const weekStart = monday.toISOString().split("T")[0]
  const weekEnd = today.toISOString().split("T")[0]

  return { weekStart, weekEnd }
}

// weekStart ~ weekEnd 사이의 날짜 목록 생성
function getDatesBetween(start: string, end: string): string[] {
  const dates: string[] = []
  const current = new Date(start + "T00:00:00")
  const endDate = new Date(end + "T00:00:00")

  while (current <= endDate) {
    dates.push(current.toISOString().split("T")[0])
    current.setDate(current.getDate() + 1)
  }

  return dates
}

// 주간 회고 생성기 — Client Component
export function WeeklyGenerator() {
  const [mounted, setMounted] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<GenerateWeeklyResponse | null>(null)

  const { scrums, fetchScrums } = useScrumStore()

  useEffect(() => {
    setMounted(true)
    fetchScrums().catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { weekStart, weekEnd } = getWeekRange()
  const weekDates = getDatesBetween(weekStart, weekEnd)

  // 이번 주 스크럼 데이터 수집
  const weeklyScrums = mounted
    ? weekDates
        .map((date) => scrums[date])
        .filter(Boolean)
        .map((s) => ({
          date: s.date,
          yesterday: s.yesterday,
          today: s.today,
          blocker: s.blocker,
        }))
    : []

  const handleGenerate = async () => {
    if (weeklyScrums.length === 0) return

    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-weekly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weekStart, weekEnd, scrums: weeklyScrums }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error ?? "주간 회고 생성에 실패했습니다")
      }

      const data = (await response.json()) as GenerateWeeklyResponse
      setResult(data)
      toast.success("주간 회고가 생성되었습니다")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "주간 회고 생성에 실패했습니다")
    } finally {
      setIsGenerating(false)
    }
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="md" />
      </div>
    )
  }

  if (weeklyScrums.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="이번 주 스크럼이 없습니다"
        description="스크럼을 먼저 생성하면 주간 회고를 자동으로 작성할 수 있습니다"
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {weekStart} ~ {weekEnd} ({weeklyScrums.length}일 스크럼 기반)
        </p>
        <Button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Spinner size="sm" className="mr-2" />
              생성 중...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 size-4" />
              주간 회고 생성
            </>
          )}
        </Button>
      </div>

      {/* 결과 미리보기 */}
      {result && <WeeklyPreview result={result} weekStart={weekStart} weekEnd={weekEnd} />}

      {/* 생성 유도 */}
      {!result && !isGenerating && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            &ldquo;주간 회고 생성&rdquo; 버튼을 눌러 AI가 이번 주 회고를 작성하도록 해보세요
          </p>
        </div>
      )}
    </div>
  )
}
