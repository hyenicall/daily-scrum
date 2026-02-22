import type { Metadata } from "next"

import { Container } from "@/components/layout/container"
import { ScrumGenerator } from "@/components/scrum/scrum-generator"

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

      {/* 스크럼 생성 클라이언트 컴포넌트 */}
      <ScrumGenerator />
    </Container>
  )
}
