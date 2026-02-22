import { z } from "zod/v4"
import { WORK_TAGS, WORK_STATUSES } from "@/types"

/** 작업 항목 추가/수정 폼 스키마 */
export const workItemSchema = z.object({
  content: z
    .string()
    .min(1, "작업 내용을 입력해주세요.")
    .max(500, "작업 내용은 500자를 초과할 수 없습니다."),
  tag: z.enum(WORK_TAGS as [string, ...string[]], {
    error: "올바른 태그를 선택해주세요.",
  }),
  status: z.enum(WORK_STATUSES as [string, ...string[]], {
    error: "올바른 상태를 선택해주세요.",
  }),
})

export type WorkItemFormValues = z.infer<typeof workItemSchema>

/** 스크럼 수동 편집 폼 스키마 */
export const scrumEditSchema = z.object({
  yesterday: z
    .array(z.string().min(1))
    .min(1, "어제 한 일을 최소 1개 입력해주세요."),
  today: z
    .array(z.string().min(1))
    .min(1, "오늘 할 일을 최소 1개 입력해주세요."),
  blocker: z.string().default("없음"),
  format: z.enum(["slack", "markdown"]),
})

export type ScrumEditFormValues = z.infer<typeof scrumEditSchema>
