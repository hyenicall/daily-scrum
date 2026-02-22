import type { Metadata } from "next"
import { ClipboardList, Plus } from "lucide-react"

import { Container } from "@/components/layout/container"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "오늘의 워크로그 | 데일리 스크럼",
  description: "오늘의 작업을 기록하고 AI 스크럼을 자동으로 생성하세요",
}

export default function HomePage() {
  return (
    <Container className="py-10">
      {/* 페이지 헤더 */}
      <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">오늘의 워크로그</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            오늘 진행한 작업을 기록하세요
          </p>
        </div>
        {/* 작업 추가 버튼 - 클라이언트 컴포넌트로 분리 예정 */}
        <Button className="mt-4 sm:mt-0" disabled>
          <Plus className="mr-2 size-4" />
          작업 추가
        </Button>
      </div>

      {/* 워크로그 목록 영역 - 추후 WorklogList 클라이언트 컴포넌트로 교체 */}
      <EmptyState
        icon={ClipboardList}
        title="아직 기록된 작업이 없습니다"
        description="오늘 진행한 작업을 추가하여 스크럼 자동 생성에 활용하세요"
        action={
          <Button disabled>
            <Plus className="mr-2 size-4" />
            첫 번째 작업 추가하기
          </Button>
        }
      />
    </Container>
  )
}
