import type { Metadata } from "next"
import { Bot, Sparkles } from "lucide-react"
import Link from "next/link"

import { Container } from "@/components/layout/container"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "스크럼 생성 | 데일리 스크럼",
  description: "워크로그를 기반으로 AI가 스크럼 내용을 자동으로 생성합니다",
}

export default function ScrumPage() {
  return (
    <Container className="py-10">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">스크럼 생성</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          워크로그를 기반으로 AI가 스크럼 내용을 자동으로 작성합니다
        </p>
      </div>

      {/* 스크럼 생성 영역 - 추후 ScrumGenerator 클라이언트 컴포넌트로 교체 */}
      <EmptyState
        icon={Bot}
        title="워크로그를 먼저 입력해주세요"
        description="오늘의 작업을 기록한 후 AI 스크럼 자동 생성을 사용할 수 있습니다"
        action={
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/">
                워크로그 입력하러 가기
              </Link>
            </Button>
            <Button variant="outline" disabled>
              <Sparkles className="mr-2 size-4" />
              스크럼 자동 생성
            </Button>
          </div>
        }
      />
    </Container>
  )
}
