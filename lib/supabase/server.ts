import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { SupabaseClient } from "@supabase/supabase-js"

// 서버 환경에서 쿠키 기반으로 사용하는 Supabase 클라이언트 (async)
export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookieList) => {
          cookieList.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
}
