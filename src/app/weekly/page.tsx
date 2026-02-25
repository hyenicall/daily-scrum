import type { Metadata } from "next"

import { Container } from "@/components/layout/container"
import { WeeklyGenerator } from "@/components/weekly/weekly-generator"

export const metadata: Metadata = {
  title: "주간 회고 | 데일리 스크럼",
  description: "이번 주 스크럼을 기반으로 AI가 자동으로 주간 회고를 작성합니다",
}

export default function WeeklyPage() {
  return (
    <Container className="py-10">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">주간 회고</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          이번 주 스크럼을 기반으로 AI가 자동으로 주간 회고를 작성합니다
        </p>
      </div>

      {/* 주간 회고 생성기 */}
      <WeeklyGenerator />
    </Container>
  )
}
