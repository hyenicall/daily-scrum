"use client"

import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWorklogStore } from "@/stores/use-worklog-store"
import { useConfirm } from "@/hooks/use-confirm"
import { WorkTagBadge, WorkStatusBadge } from "./work-item-badge"
import { WorkItemForm } from "./work-item-form"
import type { WorkItem, WorkTag, WorkStatus } from "@/types"
import type { WorkItemFormValues } from "@/lib/validations/worklog"

interface WorkItemCardProps {
  item: WorkItem
  date: string
}

export function WorkItemCard({ item, date }: WorkItemCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { updateWorkItem, deleteWorkItem } = useWorklogStore()

  const [dialog, confirm] = useConfirm({
    title: "작업을 삭제하시겠습니까?",
    description: "삭제된 작업은 복구할 수 없습니다.",
    variant: "destructive",
    confirmLabel: "삭제",
  })

  const handleEdit = (values: WorkItemFormValues) => {
    updateWorkItem(date, item.id, {
      content: values.content,
      tag: values.tag as WorkTag,
      status: values.status as WorkStatus,
    })
    setIsEditing(false)
  }

  const handleDelete = async () => {
    const ok = await confirm()
    if (ok) {
      deleteWorkItem(date, item.id)
    }
  }

  return (
    <>
      {dialog}
      <Card className="py-0">
        <CardContent className="p-4">
          {isEditing ? (
            <WorkItemForm
              defaultValues={{
                content: item.content,
                tag: item.tag,
                status: item.status,
              }}
              onSubmit={handleEdit}
              onCancel={() => setIsEditing(false)}
              submitLabel="저장"
            />
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-2">
                <p className="break-words text-sm">{item.content}</p>
                <div className="flex flex-wrap gap-1.5">
                  <WorkTagBadge tag={item.tag} />
                  <WorkStatusBadge status={item.status} />
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => setIsEditing(true)}
                  aria-label="수정"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:text-destructive"
                  onClick={handleDelete}
                  aria-label="삭제"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
