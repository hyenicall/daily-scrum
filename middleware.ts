import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookieList) => {
          cookieList.forEach((cookie) => {
            request.cookies.set(cookie)
            response.cookies.set(cookie)
          })
        },
      },
    }
  )

  // 세션 갱신 및 사용자 정보 조회
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // /admin 경로는 인증된 사용자만 접근 가능
  if (!user && request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return response
}

export const config = {
  matcher: [
    // 정적 자산 및 이미지 경로 제외
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
