import type { SupabaseClient } from "@supabase/supabase-js"
import type { WorkLog, WorkItem, DailyScrum } from "@/types"

// localStorage 키 상수
const WORKLOG_STORAGE_KEY = "daily-scrum-worklogs"
const SCRUM_STORAGE_KEY = "daily-scrum-scrums"

// localStorage에서 워크로그 데이터 읽기
function readLocalWorkLogs(): Record<string, WorkLog> {
  try {
    const raw = localStorage.getItem(WORKLOG_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as { state?: { workLogs?: Record<string, WorkLog> } }
    return parsed?.state?.workLogs ?? {}
  } catch {
    return {}
  }
}

// localStorage에서 스크럼 데이터 읽기
function readLocalScrums(): Record<string, DailyScrum> {
  try {
    const raw = localStorage.getItem(SCRUM_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as { state?: { scrums?: Record<string, DailyScrum> } }
    return parsed?.state?.scrums ?? {}
  } catch {
    return {}
  }
}

/**
 * localStorage 워크로그 데이터를 Supabase로 마이그레이션
 * 로그인 후 최초 1회 실행
 */
export async function migrateWorkLogsToSupabase(
  supabase: SupabaseClient,
  userId: string
): Promise<{ migrated: number; errors: number }> {
  const localWorkLogs = readLocalWorkLogs()
  const dates = Object.keys(localWorkLogs)

  if (dates.length === 0) return { migrated: 0, errors: 0 }

  let migrated = 0
  let errors = 0

  for (const date of dates) {
    const workLog = localWorkLogs[date]
    if (!workLog || workLog.items.length === 0) continue

    try {
      // work_logs 레코드 upsert (user_id + date 유니크)
      const { data: logData, error: logError } = await supabase
        .from("work_logs")
        .upsert(
          { user_id: userId, date },
          { onConflict: "user_id,date", ignoreDuplicates: true }
        )
        .select("id")
        .single()

      if (logError || !logData) {
        errors++
        continue
      }

      const workLogId = logData.id as string

      // work_items 일괄 삽입
      const items = workLog.items.map((item: WorkItem) => ({
        work_log_id: workLogId,
        content: item.content,
        tag: item.tag,
        status: item.status,
        item_order: item.order,
      }))

      const { error: itemsError } = await supabase
        .from("work_items")
        .insert(items)

      if (itemsError) {
        errors++
        continue
      }

      migrated++
    } catch {
      errors++
    }
  }

  return { migrated, errors }
}

/**
 * localStorage 스크럼 데이터를 Supabase로 마이그레이션
 * 로그인 후 최초 1회 실행
 */
export async function migrateScrumsToSupabase(
  supabase: SupabaseClient,
  userId: string
): Promise<{ migrated: number; errors: number }> {
  const localScrums = readLocalScrums()
  const dates = Object.keys(localScrums)

  if (dates.length === 0) return { migrated: 0, errors: 0 }

  let migrated = 0
  let errors = 0

  for (const date of dates) {
    const scrum = localScrums[date]
    if (!scrum) continue

    try {
      const { error } = await supabase.from("daily_scrums").upsert(
        {
          user_id: userId,
          date,
          yesterday: scrum.yesterday,
          today: scrum.today,
          blocker: scrum.blocker,
          format: scrum.format,
          share_id: scrum.shareId,
        },
        { onConflict: "user_id,date", ignoreDuplicates: true }
      )

      if (error) {
        errors++
        continue
      }

      migrated++
    } catch {
      errors++
    }
  }

  return { migrated, errors }
}

/**
 * 마이그레이션 완료 후 localStorage 데이터 정리
 * 마이그레이션 성공 후에만 호출
 */
export function clearLocalStorageMigrationData(): void {
  try {
    localStorage.removeItem(WORKLOG_STORAGE_KEY)
    localStorage.removeItem(SCRUM_STORAGE_KEY)
    localStorage.setItem("daily-scrum-migration-done", "true")
  } catch {
    // localStorage 접근 실패 무시
  }
}

/** 마이그레이션 이미 완료됐는지 확인 */
export function isMigrationDone(): boolean {
  try {
    return localStorage.getItem("daily-scrum-migration-done") === "true"
  } catch {
    return false
  }
}
