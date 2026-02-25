import Link from "next/link"

import { siteConfig } from "@/config/site"
import { Container } from "@/components/layout/container"
import { MainNav } from "@/components/layout/main-nav"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { UserMenu } from "@/components/auth/user-menu"
import { Button } from "@/components/ui/button"

// async Server Component — Supabase 세션으로 로그인 상태 감지
export async function SiteHeader() {
  // 서버에서 현재 사용자 정보 조회
  let userEmail: string | null = null
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    userEmail = user?.email ?? null
  } catch {
    // 환경변수 미설정 등의 이유로 에러 발생 시 로그인 없이 렌더
    userEmail = null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-bold">
              {siteConfig.name}
            </Link>
            <MainNav items={siteConfig.mainNav} />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {/* 로그인 상태에 따라 UserMenu 또는 로그인 버튼 표시 */}
            {userEmail ? (
              <UserMenu userEmail={userEmail} />
            ) : (
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">로그인</Link>
              </Button>
            )}
            <MobileNav
              items={siteConfig.mainNav}
              siteName={siteConfig.name}
            />
          </div>
        </div>
      </Container>
    </header>
  )
}
