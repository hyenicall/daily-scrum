"use client"

import { useState, useEffect } from "react"
import { Plus, ClipboardList } from "lucide-react"

import { useWorklogStore } from "@/stores/use-worklog-store"
import type { WorkTag, WorkStatus } from "@/types"
import { useNotionSync } from "@/hooks/use-notion-sync"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { WorkItemCard } from "./work-item-card"
import { WorkItemForm } from "./work-item-form"
import { DateSelector } from "./date-selector"
import { NotionSync } from "./notion-sync"
import type { WorkItemFormValues } from "@/lib/validations/worklog"

export function WorklogList() {
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0],
  )
  const [dialogOpen, setDialogOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { getWorkLog, addWorkItem, fetchWorkLog } = useWorklogStore()

  // 마운트 후 데이터 패치
  useEffect(() => {
    setMounted(true)
    fetchWorkLog(selectedDate).catch(() => {})
  // fetchWorkLog는 안정적인 함수 참조이므로 의존성에서 제외
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate])

  const items = mounted ? (getWorkLog(selectedDate)?.items ?? []) : []
  const syncStatus = useNotionSync(selectedDate, items)

  const handleAdd = async (values: WorkItemFormValues) => {
    await addWorkItem(
      selectedDate,
      values.content,
      values.tag as WorkTag,
      values.status as WorkStatus,
    )
    setDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">오늘의 워크로그</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            날짜별 작업을 기록하세요
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <DateSelector value={selectedDate} onChange={setSelectedDate} />
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 size-4" />
                작업 추가
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>작업 추가</DialogTitle>
              </DialogHeader>
              <WorkItemForm
                onSubmit={handleAdd}
                onCancel={() => setDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 작업 목록 or EmptyState */}
      {items.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="아직 기록된 작업이 없습니다"
          description="오늘 진행한 작업을 추가하여 스크럼 자동 생성에 활용하세요"
          action={
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 size-4" />
              첫 번째 작업 추가하기
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <WorkItemCard key={item.id} item={item} date={selectedDate} />
          ))}
        </div>
      )}

      {/* Notion 연동 버튼 영역 */}
      <div className="border-t pt-4">
        <NotionSync date={selectedDate} items={items} syncStatus={syncStatus} />
      </div>
    </div>
  )
}
