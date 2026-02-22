import type { Metadata } from "next"
import { Container } from "@/components/layout/container"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "404 - 페이지를 찾을 수 없습니다",
  description: "요청하신 페이지를 찾을 수 없습니다.",
}

export default function NotFoundPage() {
  return (
    <Container className="py-16">
      <EmptyState
        icon={FileQuestion}
        title="페이지를 찾을 수 없습니다"
        description="요청하신 페이지가 존재하지 않거나 이동되었습니다. URL을 확인하시거나 홈으로 돌아가세요."
        action={
          <div className="flex gap-4">
            <Button asChild>
              <Link href="/">홈으로 돌아가기</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/history">기록 조회</Link>
            </Button>
          </div>
        }
      />
    </Container>
  )
}
