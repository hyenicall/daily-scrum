"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { workItemSchema, type WorkItemFormValues } from "@/lib/validations/worklog"
import { WORK_TAGS, WORK_STATUSES, WORK_TAG_LABELS, WORK_STATUS_LABELS } from "@/types"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface WorkItemFormProps {
  defaultValues?: Partial<WorkItemFormValues>
  onSubmit: (values: WorkItemFormValues) => void
  onCancel?: () => void
  /** 제출 버튼 레이블 (기본값: "추가") */
  submitLabel?: string
}

export function WorkItemForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "추가",
}: WorkItemFormProps) {
  const form = useForm<WorkItemFormValues>({
    resolver: zodResolver(workItemSchema),
    defaultValues: {
      content: "",
      tag: "feature",
      status: "in-progress",
      ...defaultValues,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* 작업 내용 */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>작업 내용</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="오늘 진행한 작업을 입력하세요"
                  maxLength={500}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 태그 & 상태 선택 */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tag"
            render={({ field }) => (
              <FormItem>
                <FormLabel>태그</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="태그 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {WORK_TAGS.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {WORK_TAG_LABELS[tag]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>상태</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {WORK_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {WORK_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 버튼 영역 */}
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              취소
            </Button>
          )}
          <Button type="submit">{submitLabel}</Button>
        </div>
      </form>
    </Form>
  )
}
