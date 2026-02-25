import { redirect } from "next/navigation"
import type { ReactNode } from "react"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { Container } from "@/components/layout/container"

interface AdminLayoutProps {
  children: ReactNode
}

// 관리자 레이아웃 — 인증된 사용자만 접근 가능 (미들웨어 + 서버 이중 체크)
export default async function AdminLayout({ children }: AdminLayoutProps) {
  let isAuthenticated = false
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    isAuthenticated = !!user
  } catch {
    isAuthenticated = false
  }

  if (!isAuthenticated) {
    redirect("/login")
  }

  return (
    <Container className="py-10">
      {/* 관리자 페이지 헤더 */}
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold tracking-tight">관리자 대시보드</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          팀 스크럼 현황과 팀원 관리를 확인하세요
        </p>
      </div>
      {children}
    </Container>
  )
}
