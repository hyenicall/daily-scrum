import type { Metadata } from "next"

import { Container } from "@/components/layout/container"
import { SharedScrumView } from "@/components/share/shared-scrum-view"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { DailyScrum, ScrumFormat } from "@/types"

// 공유 페이지 메타데이터
export const metadata: Metadata = {
  title: "공유된 스크럼 | 데일리 스크럼",
  description: "공유된 데일리 스크럼 내용입니다",
}

interface SharePageProps {
  params: Promise<{
    id: string
  }>
}

// Supabase DB 레코드 타입
interface DailyScrumRow {
  id: string
  date: string
  yesterday: string[]
  today: string[]
  blocker: string
  format: string
  share_id: string
  created_at: string
}

export default async function SharePage({ params }: SharePageProps) {
  // Next.js 15에서 params는 Promise — await 필요
  const { id } = await params

  // 서버사이드에서 Supabase로 share_id 조회 (anon 정책으로 접근 가능)
  let scrum: DailyScrum | null = null
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase
      .from("daily_scrums")
      .select("*")
      .eq("share_id", id)
      .maybeSingle()

    if (!error && data) {
      const row = data as DailyScrumRow
      scrum = {
        id: row.id,
        date: row.date,
        yesterday: row.yesterday ?? [],
        today: row.today ?? [],
        blocker: row.blocker ?? "",
        format: row.format as ScrumFormat,
        shareId: row.share_id,
        createdAt: new Date(row.created_at),
      }
    }
  } catch {
    // Supabase 환경변수 미설정 등 에러 시 null 유지
    scrum = null
  }

  return (
    <Container className="py-10" size="md">
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">공유된 스크럼</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          공유 ID:{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
            {id}
          </code>
        </p>
      </div>

      {/* 공유 스크럼 읽기 전용 뷰 */}
      <SharedScrumView scrum={scrum} />
    </Container>
  )
}
