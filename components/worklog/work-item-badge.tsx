"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { WORK_TAG_LABELS, WORK_STATUS_LABELS } from "@/types"
import type { WorkTag, WorkStatus } from "@/types"

// 태그별 variant 및 추가 클래스 매핑
const TAG_VARIANT_MAP: Record<WorkTag, "default" | "destructive" | "secondary"> = {
  feature: "default",
  bugfix: "destructive",
  meeting: "default",
  review: "default",
  etc: "secondary",
}

const TAG_CLASS_MAP: Record<WorkTag, string> = {
  feature: "",
  bugfix: "",
  meeting: "bg-purple-500 text-white border-transparent hover:bg-purple-500/90",
  review: "bg-yellow-400 text-black border-transparent hover:bg-yellow-400/90",
  etc: "",
}

// 상태별 variant 및 추가 클래스 매핑
const STATUS_VARIANT_MAP: Record<WorkStatus, "default" | "destructive" | "secondary"> = {
  done: "default",
  "in-progress": "default",
  blocked: "destructive",
}

const STATUS_CLASS_MAP: Record<WorkStatus, string> = {
  done: "bg-green-500 text-white border-transparent hover:bg-green-500/90",
  "in-progress": "",
  blocked: "",
}

export function WorkTagBadge({ tag }: { tag: WorkTag }) {
  return (
    <Badge
      variant={TAG_VARIANT_MAP[tag]}
      className={cn(TAG_CLASS_MAP[tag])}
    >
      {WORK_TAG_LABELS[tag]}
    </Badge>
  )
}

export function WorkStatusBadge({ status }: { status: WorkStatus }) {
  return (
    <Badge
      variant={STATUS_VARIANT_MAP[status]}
      className={cn(STATUS_CLASS_MAP[status])}
    >
      {WORK_STATUS_LABELS[status]}
    </Badge>
  )
}
