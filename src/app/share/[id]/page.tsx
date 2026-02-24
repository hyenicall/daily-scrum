import type { Metadata } from "next"

import { Container } from "@/components/layout/container"
import { SharedScrumView } from "@/components/share/shared-scrum-view"

// 공유 페이지의 동적 메타데이터
export const metadata: Metadata = {
  title: "공유된 스크럼 | 데일리 스크럼",
  description: "공유된 데일리 스크럼 내용입니다",
}

interface SharePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function SharePage({ params }: SharePageProps) {
  // Next.js 15에서 params는 Promise - await 필요
  const { id } = await params

  return (
    <Container className="py-10" size="md">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">공유된 스크럼</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          공유 ID: <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">{id}</code>
        </p>
      </div>

      {/* 공유 스크럼 읽기 전용 뷰 */}
      <SharedScrumView shareId={id} />
    </Container>
  )
}
