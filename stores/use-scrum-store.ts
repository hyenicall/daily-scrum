"use client"

import { create } from "zustand"
import type { DailyScrum, ScrumFormat } from "@/types"
import { getSupabaseClient } from "@/lib/supabase/client"

// ============================================================
// Supabase 응답 타입
// ============================================================

interface DailyScrumRow {
  id: string
  user_id: string
  date: string
  yesterday: string[]
  today: string[]
  blocker: string
  format: string
  share_id: string
  is_team_scrum: boolean
  created_at: string
}

// DB 레코드를 도메인 타입으로 변환
function rowToScrum(row: DailyScrumRow): DailyScrum {
  return {
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

// ============================================================
// 스토어 타입 정의
// ============================================================

interface ScrumState {
  /** 날짜 → DailyScrum 맵 */
  scrums: Record<string, DailyScrum>
  /** AI 생성 로딩 상태 */
  isGenerating: boolean
  /** AI 생성 에러 메시지 */
  generateError: string | null
  /** 데이터 로딩 상태 */
  isLoading: boolean

  // ---- 조회 ----
  getScrum: (date: string) => DailyScrum | undefined
  getScrumByShareId: (shareId: string) => DailyScrum | undefined

  // ---- 서버 동기화 ----
  fetchScrums: () => Promise<void>
  fetchScrumByShareId: (shareId: string) => Promise<DailyScrum | null>

  // ---- 스크럼 CRUD ----
  saveScrum: (
    date: string,
    data: Pick<DailyScrum, "yesterday" | "today" | "blocker" | "format">
  ) => Promise<DailyScrum>
  deleteScrum: (date: string) => Promise<void>
  updateScrumField: (
    date: string,
    field: keyof Pick<DailyScrum, "yesterday" | "today" | "blocker" | "format">,
    value: DailyScrum[keyof Pick<DailyScrum, "yesterday" | "today" | "blocker" | "format">]
  ) => Promise<void>

  // ---- AI 생성 상태 ----
  setGenerating: (isGenerating: boolean) => void
  setGenerateError: (error: string | null) => void

  // ---- AI 생성 결과 적용 ----
  applyGeneratedScrum: (
    date: string,
    yesterday: string[],
    today: string[],
    blocker: string,
    format: ScrumFormat
  ) => Promise<DailyScrum>
}

// ============================================================
// 스토어 구현
// ============================================================

export const useScrumStore = create<ScrumState>()((set, get) => ({
  scrums: {},
  isGenerating: false,
  generateError: null,
  isLoading: false,

  // ---- 조회 (로컬 캐시) ----

  getScrum: (date) => get().scrums[date],

  getScrumByShareId: (shareId) =>
    Object.values(get().scrums).find((s) => s.shareId === shareId),

  // ---- 서버 동기화 ----

  fetchScrums: async () => {
    set({ isLoading: true })
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from("daily_scrums")
        .select("*")
        .order("date", { ascending: false })

      if (error) throw new Error(error.message)

      const scrums: Record<string, DailyScrum> = {}
      for (const row of (data ?? []) as DailyScrumRow[]) {
        const s = rowToScrum(row)
        scrums[s.date] = s
      }
      set({ scrums, isLoading: false })
    } catch {
      set({ isLoading: false })
    }
  },

  fetchScrumByShareId: async (shareId) => {
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from("daily_scrums")
        .select("*")
        .eq("share_id", shareId)
        .maybeSingle()

      if (error || !data) return null

      const scrum = rowToScrum(data as DailyScrumRow)
      set((state) => ({
        scrums: { ...state.scrums, [scrum.date]: scrum },
      }))
      return scrum
    } catch {
      return null
    }
  },

  // ---- 스크럼 CRUD ----

  saveScrum: async (date, data) => {
    const supabase = getSupabaseClient()
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id

    if (!userId) {
      // 비로그인 상태: 로컬 메모리만 사용
      const existing = get().scrums[date]
      const scrum: DailyScrum = {
        id: existing?.id ?? `temp-${date}`,
        date,
        ...data,
        shareId: existing?.shareId ?? Math.random().toString(36).slice(2, 10),
        createdAt: existing?.createdAt ?? new Date(),
      }
      set((state) => ({ scrums: { ...state.scrums, [date]: scrum } }))
      return scrum
    }

    // Supabase upsert
    const { data: row, error } = await supabase
      .from("daily_scrums")
      .upsert(
        {
          user_id: userId,
          date,
          yesterday: data.yesterday,
          today: data.today,
          blocker: data.blocker,
          format: data.format,
        },
        { onConflict: "user_id,date" }
      )
      .select()
      .single()

    if (error) throw new Error(error.message)

    const scrum = rowToScrum(row as DailyScrumRow)
    set((state) => ({ scrums: { ...state.scrums, [date]: scrum } }))
    return scrum
  },

  deleteScrum: async (date) => {
    const scrum = get().scrums[date]
    if (!scrum) return

    const supabase = getSupabaseClient()
    const { error } = await supabase
      .from("daily_scrums")
      .delete()
      .eq("id", scrum.id)

    if (error) throw new Error(error.message)

    set((state) => {
      const next = { ...state.scrums }
      delete next[date]
      return { scrums: next }
    })
  },

  updateScrumField: async (date, field, value) => {
    const scrum = get().scrums[date]
    if (!scrum) return

    const supabase = getSupabaseClient()

    // 필드명 변환 (도메인 → DB 컬럼)
    const dbField = field === "format" ? "format" : field

    const { error } = await supabase
      .from("daily_scrums")
      .update({ [dbField]: value })
      .eq("id", scrum.id)

    if (error) throw new Error(error.message)

    set((state) => {
      const s = state.scrums[date]
      if (!s) return state
      return {
        scrums: { ...state.scrums, [date]: { ...s, [field]: value } },
      }
    })
  },

  // ---- AI 생성 상태 ----

  setGenerating: (isGenerating) => set({ isGenerating }),
  setGenerateError: (error) => set({ generateError: error }),

  // ---- AI 생성 결과 적용 ----

  applyGeneratedScrum: async (date, yesterday, today, blocker, format) => {
    return get().saveScrum(date, { yesterday, today, blocker, format })
  },
}))
