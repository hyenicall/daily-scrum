import type { Metadata } from "next"

import { Container } from "@/components/layout/container"
import { WorklogList } from "@/components/worklog/worklog-list"

export const metadata: Metadata = {
  title: "오늘의 워크로그 | 데일리 스크럼",
  description: "오늘의 작업을 기록하고 AI 스크럼을 자동으로 생성하세요",
}

export default function HomePage() {
  return (
    <Container className="py-10">
      <WorklogList />
    </Container>
  )
}
