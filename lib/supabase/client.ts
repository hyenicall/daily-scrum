import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

// 브라우저 환경에서 싱글톤으로 사용하는 Supabase 클라이언트
let client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}
