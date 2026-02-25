import { NextResponse } from "next/server"
import { saveTeamScrumRequestSchema } from "@/lib/validations/scrum"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()

  // 인증 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "요청 본문을 파싱할 수 없습니다" }, { status: 400 })
  }

  const parsed = saveTeamScrumRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 })
  }

  const { date, yesterday, today, blocker, format } = parsed.data

  // 팀 스크럼으로 저장 (is_team_scrum = true)
  const { data, error } = await supabase
    .from("daily_scrums")
    .upsert(
      {
        user_id: user.id,
        date,
        yesterday,
        today,
        blocker,
        format,
        is_team_scrum: true,
      },
      { onConflict: "user_id,date" }
    )
    .select()
    .single()

  if (error) {
    console.error("팀 스크럼 저장 오류:", error)
    return NextResponse.json({ error: "팀 스크럼 저장에 실패했습니다" }, { status: 500 })
  }

  return NextResponse.json({ scrum: data, message: "팀 스크럼이 저장되었습니다" })
}
