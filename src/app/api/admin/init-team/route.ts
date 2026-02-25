import { NextResponse } from "next/server"
import { z } from "zod/v4"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const initTeamSchema = z.object({
  teamName: z.string().min(2, "팀 이름은 2자 이상이어야 합니다").max(50, "팀 이름은 50자 이하여야 합니다"),
  memberEmails: z.array(z.email("올바른 이메일 형식이어야 합니다")).optional().default([]),
})

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()

  // 인증된 사용자 확인
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

  const parsed = initTeamSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 요청입니다", details: parsed.error.issues }, { status: 400 })
  }

  const { teamName, memberEmails } = parsed.data

  // 팀 생성
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert({ name: teamName, admin_user_id: user.id })
    .select()
    .single()

  if (teamError || !team) {
    return NextResponse.json({ error: "팀 생성에 실패했습니다" }, { status: 500 })
  }

  const teamId = (team as { id: string }).id

  // 관리자를 팀원으로 추가
  const { error: adminMemberError } = await supabase
    .from("team_members")
    .insert({ team_id: teamId, user_id: user.id, role: "admin" })

  if (adminMemberError) {
    // 팀 생성은 성공했으므로 경고만 기록
    console.error("관리자 팀원 추가 실패:", adminMemberError)
  }

  // 초대할 멤버 이메일로 profiles 조회 후 팀원 추가
  const addedMembers: string[] = []
  const failedEmails: string[] = []

  for (const email of memberEmails) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (!profile) {
      failedEmails.push(email)
      continue
    }

    const memberId = (profile as { id: string }).id

    const { error: memberError } = await supabase
      .from("team_members")
      .insert({ team_id: teamId, user_id: memberId, role: "member" })

    if (memberError) {
      failedEmails.push(email)
    } else {
      addedMembers.push(email)
    }
  }

  return NextResponse.json({
    team: { id: teamId, name: teamName },
    addedMembers,
    failedEmails,
    message: "팀이 생성되었습니다",
  })
}
