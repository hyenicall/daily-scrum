import type { Metadata } from "next"
import { History } from "lucide-react"
import Link from "next/link"

import { Container } from "@/components/layout/container"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "기록 조회 | 데일리 스크럼",
  description: "날짜별 워크로그 기록을 조회합니다",
}

export default function HistoryPage() {
  return (
    <Container className="py-10">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">기록 조회</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          날짜별로 저장된 워크로그 기록을 확인합니다
        </p>
      </div>

      {/* 기록 목록 영역 - 추후 HistoryList 클라이언트 컴포넌트로 교체 */}
      <EmptyState
        icon={History}
        title="아직 기록이 없습니다"
        description="워크로그를 작성하면 날짜별로 이곳에 기록이 쌓입니다"
        action={
          <Button asChild>
            <Link href="/">오늘 워크로그 작성하기</Link>
          </Button>
        }
      />
    </Container>
  )
}
