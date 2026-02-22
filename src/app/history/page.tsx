import type { Metadata } from "next"

import { Container } from "@/components/layout/container"
import { HistoryList } from "@/components/history/history-list"

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

      {/* 날짜별 기록 목록 */}
      <HistoryList />
    </Container>
  )
}
