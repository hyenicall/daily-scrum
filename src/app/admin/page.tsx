import type { Metadata } from "next"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { AdminMemberList } from "@/components/admin/admin-member-list"
import { AdminScrumTimeline } from "@/components/admin/admin-scrum-timeline"
import type { TeamMember, UserProfile, DailyScrum, ScrumFormat } from "@/types"

export const metadata: Metadata = {
  title: "관리자 대시보드 | 데일리 스크럼",
  description: "팀 스크럼 현황과 팀원 관리를 확인하세요",
}

// Supabase DB 레코드 타입
interface TeamRow {
  id: string
  name: string
  admin_user_id: string
}

interface TeamMemberRow {
  team_id: string
  user_id: string
  role: string
  profiles: {
    id: string
    email: string | null
    display_name: string | null
    created_at: string
  } | null
}

interface DailyScrumRow {
  id: string
  user_id: string
  date: string
  yesterday: string[]
  today: string[]
  blocker: string
  format: string
  share_id: string
  created_at: string
}

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // 내가 관리자인 팀 조회
  const { data: teams } = await supabase
    .from("teams")
    .select("*")
    .eq("admin_user_id", user.id)

  const myTeam = teams && teams.length > 0 ? (teams[0] as TeamRow) : null

  // 팀원 목록 조회 (profiles 조인)
  let members: TeamMember[] = []
  let teamScrums: DailyScrum[] = []

  if (myTeam) {
    const { data: memberRows } = await supabase
      .from("team_members")
      .select("*, profiles(*)")
      .eq("team_id", myTeam.id)

    members = (memberRows ?? []).map((row: TeamMemberRow) => ({
      teamId: row.team_id,
      userId: row.user_id,
      role: row.role as "admin" | "member",
      profile: row.profiles
        ? {
            id: row.profiles.id,
            email: row.profiles.email,
            displayName: row.profiles.display_name,
            createdAt: new Date(row.profiles.created_at),
          }
        : undefined,
    }))

    // 팀원들의 최근 7일 스크럼 조회
    const memberUserIds = members.map((m) => m.userId)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0]

    const { data: scrumRows } = await supabase
      .from("daily_scrums")
      .select("*")
      .in("user_id", memberUserIds)
      .gte("date", sevenDaysAgoStr)
      .order("date", { ascending: false })

    teamScrums = (scrumRows ?? []).map((row: DailyScrumRow) => ({
      id: row.id,
      userId: row.user_id,
      date: row.date,
      yesterday: row.yesterday ?? [],
      today: row.today ?? [],
      blocker: row.blocker ?? "",
      format: row.format as ScrumFormat,
      shareId: row.share_id,
      createdAt: new Date(row.created_at),
    }))
  }

  return (
    <div className="space-y-10">
      {/* 팀이 없는 경우 */}
      {!myTeam ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            아직 팀이 없습니다. API를 통해 팀을 생성하세요.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            <code className="rounded bg-muted px-1 py-0.5">
              POST /api/admin/init-team
            </code>
          </p>
        </div>
      ) : (
        <>
          {/* 팀원 목록 */}
          <section>
            <h2 className="mb-4 text-xl font-semibold">
              {myTeam.name} 팀원 목록
            </h2>
            <AdminMemberList members={members} />
          </section>

          {/* 스크럼 타임라인 */}
          <section>
            <h2 className="mb-4 text-xl font-semibold">최근 7일 팀 스크럼</h2>
            <AdminScrumTimeline
              scrums={teamScrums}
              members={members}
            />
          </section>
        </>
      )}
    </div>
  )
}
