"use client"

import { useState, useEffect } from "react"
import { Sparkles, ClipboardList, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

import { useWorklogStore } from "@/stores/use-worklog-store"
import { useScrumStore } from "@/stores/use-scrum-store"
import type { GenerateScrumResponse } from "@/lib/validations/scrum"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ScrumPreview } from "./scrum-preview"
import { ScrumOutput } from "./scrum-output"
import { SlackSendButton } from "./slack-send-button"

export function ScrumGenerator() {
  const [mounted, setMounted] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Zustand persist + SSR hydration mismatch 방지
  useEffect(() => setMounted(true), [])

  const { getWorkLog } = useWorklogStore()
  const { getScrum, applyGeneratedScrum } = useScrumStore()

  // 전날 날짜 계산 ("YYYY-MM-DD" 형식)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split("T")[0]

  // 전날 워크로그 & 스크럼 조회 (mounted 이후에만)
  const workLog = mounted ? getWorkLog(yesterdayStr) : undefined
  const existingScrum = mounted ? getScrum(yesterdayStr) : undefined

  /** OpenAI API로 스크럼 생성 */
  const handleGenerate = async () => {
    if (!workLog || workLog.items.length === 0) return

    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-scrum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workItems: workLog.items,
          format: "slack",
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(
          (err as { error?: string }).error ?? "스크럼 생성에 실패했습니다",
        )
      }

      const data = (await response.json()) as GenerateScrumResponse
      await applyGeneratedScrum(
        yesterdayStr,
        data.yesterday,
        data.today,
        data.blocker,
        "slack",
      )
      toast.success("스크럼이 생성되었습니다")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "스크럼 생성에 실패했습니다"
      toast.error(message)
    } finally {
      setIsGenerating(false)
    }
  }

  // 마운트 전: 빈 상태 (hydration 방지)
  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="md" />
      </div>
    )
  }

  // 전날 워크로그 없음
  if (!workLog || workLog.items.length === 0) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="전날 워크로그가 없습니다"
        description="어제 날짜의 워크로그를 먼저 입력해주세요"
        action={
          <Button asChild>
            <Link href="/">워크로그 입력하러 가기</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* 스크럼 생성 / 재생성 버튼 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {yesterdayStr} 워크로그 기반 ({workLog.items.length}개 항목)
        </p>
        {existingScrum ? (
          <Button
            variant="outline"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Spinner size="sm" className="mr-2" />
                생성 중...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 size-4" />
                재생성
              </>
            )}
          </Button>
        ) : (
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Spinner size="sm" className="mr-2" />
                생성 중...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 size-4" />
                스크럼 자동 생성
              </>
            )}
          </Button>
        )}
      </div>

      {/* 기존 스크럼이 있으면 미리보기/편집 UI 표시 */}
      {existingScrum && <ScrumPreview date={yesterdayStr} />}

      {/* 스크럼이 있으면 포맷된 최종 출력 + 슬랙 전송 버튼 표시 */}
      {existingScrum && <ScrumOutput date={yesterdayStr} />}
      {existingScrum && (
        <div className="flex justify-end">
          <SlackSendButton date={yesterdayStr} />
        </div>
      )}

      {/* 스크럼이 없을 때 생성 유도 */}
      {!existingScrum && !isGenerating && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            &ldquo;스크럼 자동 생성&rdquo; 버튼을 눌러 AI가 스크럼을 작성하도록 해보세요
          </p>
        </div>
      )}
    </div>
  )
}
