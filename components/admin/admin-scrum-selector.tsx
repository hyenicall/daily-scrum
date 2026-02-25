"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { AdminConsolidatedPreview } from "./admin-consolidated-preview"
import type { DailyScrum, TeamMember, ScrumFormat } from "@/types"
import type { GenerateScrumResponse } from "@/lib/validations/scrum"

interface AdminScrumSelectorProps {
  date: string
  scrums: DailyScrum[]
  members: TeamMember[]
}

// 팀원 스크럼 선택 → 통합 생성 → 저장 UI — Client Component
export function AdminScrumSelector({ date, scrums, members }: AdminScrumSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(scrums.map((s) => s.id))
  )
  const [isConsolidating, setIsConsolidating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [consolidated, setConsolidated] = useState<GenerateScrumResponse | null>(null)
  const [format, setFormat] = useState<ScrumFormat>("slack")

  // userId → TeamMember 맵
  const memberMap = new Map(members.map((m) => [m.userId, m]))

  const toggleScrum = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedScrums = scrums.filter((s) => selectedIds.has(s.id))

  /** 선택된 스크럼을 AI로 통합 */
  const handleConsolidate = async () => {
    if (selectedScrums.length === 0) {
      toast.error("스크럼을 하나 이상 선택해주세요")
      return
    }

    setIsConsolidating(true)
    try {
      const response = await fetch("/api/admin/consolidate-scrum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          scrums: selectedScrums.map((s) => ({
            userId: s.userId,
            yesterday: s.yesterday,
            today: s.today,
            blocker: s.blocker,
          })),
          format,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error ?? "통합에 실패했습니다")
      }

      const data = await response.json() as GenerateScrumResponse
      setConsolidated(data)
      toast.success("팀 스크럼이 통합되었습니다")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "통합에 실패했습니다")
    } finally {
      setIsConsolidating(false)
    }
  }

  /** 통합 스크럼 저장 */
  const handleSave = async () => {
    if (!consolidated) return

    setIsSaving(true)
    try {
      const response = await fetch("/api/admin/save-team-scrum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          yesterday: consolidated.yesterday,
          today: consolidated.today,
          blocker: consolidated.blocker,
          format,
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error ?? "저장에 실패했습니다")
      }

      toast.success("팀 스크럼이 저장되었습니다")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "저장에 실패했습니다")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 스크럼 선택 체크박스 */}
      <div className="space-y-3">
        <p className="text-sm font-medium">통합할 스크럼 선택</p>
        {scrums.map((scrum) => {
          const member = scrum.userId ? memberMap.get(scrum.userId) : undefined
          const memberName =
            member?.profile?.displayName ?? member?.profile?.email ?? "알 수 없음"

          return (
            <div key={scrum.id} className="flex items-center gap-2">
              <Checkbox
                id={scrum.id}
                checked={selectedIds.has(scrum.id)}
                onCheckedChange={() => toggleScrum(scrum.id)}
              />
              <Label htmlFor={scrum.id} className="cursor-pointer">
                {memberName} ({scrum.date})
              </Label>
            </div>
          )
        })}
      </div>

      {/* 통합 버튼 */}
      <Button
        onClick={handleConsolidate}
        disabled={isConsolidating || selectedScrums.length === 0}
        className="w-full"
      >
        {isConsolidating ? (
          <>
            <Spinner size="sm" className="mr-2" />
            통합 중...
          </>
        ) : (
          `선택한 ${selectedScrums.length}명 스크럼 통합`
        )}
      </Button>

      {/* 통합 결과 미리보기 */}
      {consolidated && (
        <AdminConsolidatedPreview
          result={consolidated}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}
    </div>
  )
}
