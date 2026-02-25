"use client"

import { create } from "zustand"
import type { WorkLog, WorkItem, WorkTag, WorkStatus } from "@/types"
import { getSupabaseClient } from "@/lib/supabase/client"

// ============================================================
// 헬퍼 함수
// ============================================================

/** 오늘 날짜를 "YYYY-MM-DD" 형식으로 반환 */
function getTodayDate(): string {
  return new Date().toISOString().split("T")[0]
}

// ============================================================
// Supabase 응답 타입
// ============================================================

interface WorkLogRow {
  id: string
  user_id: string
  date: string
  created_at: string
  updated_at: string
  work_items: WorkItemRow[]
}

interface WorkItemRow {
  id: string
  work_log_id: string
  content: string
  tag: string
  status: string
  item_order: number
}

// DB 레코드를 도메인 타입으로 변환
function rowToWorkLog(row: WorkLogRow): WorkLog {
  return {
    id: row.id,
    date: row.date,
    items: (row.work_items ?? [])
      .sort((a, b) => a.item_order - b.item_order)
      .map((item) => ({
        id: item.id,
        content: item.content,
        tag: item.tag as WorkTag,
        status: item.status as WorkStatus,
        order: item.item_order,
      })),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

// ============================================================
// 스토어 타입 정의
// ============================================================

interface WorkLogState {
  /** 날짜 → WorkLog 맵 */
  workLogs: Record<string, WorkLog>
  /** 로딩 상태 */
  isLoading: boolean
  /** 에러 메시지 */
  error: string | null

  // ---- 조회 ----
  getWorkLog: (date: string) => WorkLog | undefined
  getTodayWorkLog: () => WorkLog | undefined

  // ---- 서버 동기화 ----
  /** Supabase에서 전체 워크로그 목록 로드 */
  fetchWorkLogs: () => Promise<void>
  /** 특정 날짜 워크로그 로드 */
  fetchWorkLog: (date: string) => Promise<WorkLog | undefined>

  // ---- 워크로그 CRUD ----
  ensureWorkLog: (date: string) => Promise<WorkLog>
  deleteWorkLog: (date: string) => Promise<void>

  // ---- 작업 항목 CRUD ----
  addWorkItem: (date: string, content: string, tag: WorkTag, status: WorkStatus) => Promise<void>
  updateWorkItem: (date: string, itemId: string, updates: Partial<Omit<WorkItem, "id">>) => Promise<void>
  deleteWorkItem: (date: string, itemId: string) => Promise<void>
  reorderWorkItems: (date: string, items: WorkItem[]) => Promise<void>
}

// ============================================================
// 스토어 구현
// ============================================================

export const useWorklogStore = create<WorkLogState>()((set, get) => ({
  workLogs: {},
  isLoading: false,
  error: null,

  // ---- 조회 (로컬 캐시) ----

  getWorkLog: (date) => get().workLogs[date],

  getTodayWorkLog: () => get().workLogs[getTodayDate()],

  // ---- 서버 동기화 ----

  fetchWorkLogs: async () => {
    set({ isLoading: true, error: null })
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from("work_logs")
        .select("*, work_items(*)")
        .order("date", { ascending: false })

      if (error) throw new Error(error.message)

      const workLogs: Record<string, WorkLog> = {}
      for (const row of (data ?? []) as WorkLogRow[]) {
        const wl = rowToWorkLog(row)
        workLogs[wl.date] = wl
      }
      set({ workLogs, isLoading: false })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "불러오기 실패", isLoading: false })
    }
  },

  fetchWorkLog: async (date) => {
    set({ isLoading: true, error: null })
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from("work_logs")
        .select("*, work_items(*)")
        .eq("date", date)
        .maybeSingle()

      if (error) throw new Error(error.message)
      if (!data) {
        set({ isLoading: false })
        return undefined
      }

      const wl = rowToWorkLog(data as WorkLogRow)
      set((state) => ({
        workLogs: { ...state.workLogs, [date]: wl },
        isLoading: false,
      }))
      return wl
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "불러오기 실패", isLoading: false })
      return undefined
    }
  },

  // ---- 워크로그 CRUD ----

  ensureWorkLog: async (date) => {
    // 로컬 캐시 확인
    const existing = get().workLogs[date]
    if (existing) return existing

    const supabase = getSupabaseClient()
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id

    if (!userId) {
      // 비로그인: 로컬 임시 객체 반환 (로컬 스토리지 미사용, 메모리만)
      const tempLog: WorkLog = {
        id: `temp-${date}`,
        date,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      set((state) => ({
        workLogs: { ...state.workLogs, [date]: tempLog },
      }))
      return tempLog
    }

    // Supabase upsert
    const { data, error } = await supabase
      .from("work_logs")
      .upsert({ user_id: userId, date }, { onConflict: "user_id,date" })
      .select("*, work_items(*)")
      .single()

    if (error) throw new Error(error.message)

    const wl = rowToWorkLog(data as WorkLogRow)
    set((state) => ({
      workLogs: { ...state.workLogs, [date]: wl },
    }))
    return wl
  },

  deleteWorkLog: async (date) => {
    const supabase = getSupabaseClient()
    const workLog = get().workLogs[date]
    if (!workLog) return

    const { error } = await supabase
      .from("work_logs")
      .delete()
      .eq("id", workLog.id)

    if (error) throw new Error(error.message)

    set((state) => {
      const next = { ...state.workLogs }
      delete next[date]
      return { workLogs: next }
    })
  },

  // ---- 작업 항목 CRUD ----

  addWorkItem: async (date, content, tag, status) => {
    const supabase = getSupabaseClient()
    const workLog = await get().ensureWorkLog(date)

    const newOrder = workLog.items.length

    const { data, error } = await supabase
      .from("work_items")
      .insert({
        work_log_id: workLog.id,
        content,
        tag,
        status,
        item_order: newOrder,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    const newItem: WorkItem = {
      id: (data as WorkItemRow).id,
      content,
      tag,
      status,
      order: newOrder,
    }

    // updated_at 갱신
    await supabase
      .from("work_logs")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", workLog.id)

    set((state) => {
      const log = state.workLogs[date]
      if (!log) return state
      return {
        workLogs: {
          ...state.workLogs,
          [date]: { ...log, items: [...log.items, newItem], updatedAt: new Date() },
        },
      }
    })
  },

  updateWorkItem: async (date, itemId, updates) => {
    const supabase = getSupabaseClient()

    // DB 업데이트 페이로드 변환
    const dbUpdates: Partial<{ content: string; tag: string; status: string; item_order: number }> = {}
    if (updates.content !== undefined) dbUpdates.content = updates.content
    if (updates.tag !== undefined) dbUpdates.tag = updates.tag
    if (updates.status !== undefined) dbUpdates.status = updates.status
    if (updates.order !== undefined) dbUpdates.item_order = updates.order

    const { error } = await supabase
      .from("work_items")
      .update(dbUpdates)
      .eq("id", itemId)

    if (error) throw new Error(error.message)

    set((state) => {
      const log = state.workLogs[date]
      if (!log) return state
      return {
        workLogs: {
          ...state.workLogs,
          [date]: {
            ...log,
            items: log.items.map((item) =>
              item.id === itemId ? { ...item, ...updates } : item
            ),
            updatedAt: new Date(),
          },
        },
      }
    })
  },

  deleteWorkItem: async (date, itemId) => {
    const supabase = getSupabaseClient()

    const { error } = await supabase
      .from("work_items")
      .delete()
      .eq("id", itemId)

    if (error) throw new Error(error.message)

    set((state) => {
      const log = state.workLogs[date]
      if (!log) return state
      const filtered = log.items
        .filter((item) => item.id !== itemId)
        .map((item, index) => ({ ...item, order: index }))
      return {
        workLogs: {
          ...state.workLogs,
          [date]: { ...log, items: filtered, updatedAt: new Date() },
        },
      }
    })
  },

  reorderWorkItems: async (date, items) => {
    const supabase = getSupabaseClient()

    // 각 아이템의 order 업데이트 (병렬 처리)
    await Promise.all(
      items.map((item, index) =>
        supabase
          .from("work_items")
          .update({ item_order: index })
          .eq("id", item.id)
      )
    )

    set((state) => {
      const log = state.workLogs[date]
      if (!log) return state
      return {
        workLogs: {
          ...state.workLogs,
          [date]: {
            ...log,
            items: items.map((item, index) => ({ ...item, order: index })),
            updatedAt: new Date(),
          },
        },
      }
    })
  },
}))
