"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { WorkLog, WorkItem, WorkTag, WorkStatus } from "@/types"

// ============================================================
// 헬퍼 함수
// ============================================================

/** 오늘 날짜를 "YYYY-MM-DD" 형식으로 반환 */
function getTodayDate(): string {
  return new Date().toISOString().split("T")[0]
}

/** nanoid 대신 간단한 ID 생성기 (외부 의존성 없이 사용) */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ============================================================
// 스토어 타입 정의
// ============================================================

interface WorkLogState {
  /** 날짜 → WorkLog 맵 */
  workLogs: Record<string, WorkLog>

  // ---- 조회 ----
  /** 특정 날짜의 워크로그 반환 (없으면 undefined) */
  getWorkLog: (date: string) => WorkLog | undefined
  /** 오늘의 워크로그 반환 (없으면 undefined) */
  getTodayWorkLog: () => WorkLog | undefined

  // ---- 워크로그 CRUD ----
  /** 날짜에 새 워크로그 생성 (이미 존재하면 기존 반환) */
  ensureWorkLog: (date: string) => WorkLog
  /** 워크로그 삭제 */
  deleteWorkLog: (date: string) => void

  // ---- 작업 항목 CRUD ----
  /** 특정 날짜 워크로그에 작업 항목 추가 */
  addWorkItem: (date: string, content: string, tag: WorkTag, status: WorkStatus) => void
  /** 작업 항목 내용 수정 */
  updateWorkItem: (date: string, itemId: string, updates: Partial<Omit<WorkItem, "id">>) => void
  /** 작업 항목 삭제 */
  deleteWorkItem: (date: string, itemId: string) => void
  /** 작업 항목 순서 변경 */
  reorderWorkItems: (date: string, items: WorkItem[]) => void
}

// ============================================================
// 스토어 구현
// ============================================================

export const useWorklogStore = create<WorkLogState>()(
  persist(
    (set, get) => ({
      workLogs: {},

      // ---- 조회 ----

      getWorkLog: (date) => {
        return get().workLogs[date]
      },

      getTodayWorkLog: () => {
        return get().workLogs[getTodayDate()]
      },

      // ---- 워크로그 CRUD ----

      ensureWorkLog: (date) => {
        const existing = get().workLogs[date]
        if (existing) return existing

        const newLog: WorkLog = {
          id: generateId(),
          date,
          items: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        set((state) => ({
          workLogs: { ...state.workLogs, [date]: newLog },
        }))

        return newLog
      },

      deleteWorkLog: (date) => {
        set((state) => {
          const next = { ...state.workLogs }
          delete next[date]
          return { workLogs: next }
        })
      },

      // ---- 작업 항목 CRUD ----

      addWorkItem: (date, content, tag, status) => {
        // 해당 날짜 워크로그가 없으면 생성
        get().ensureWorkLog(date)

        set((state) => {
          const log = state.workLogs[date]
          if (!log) return state

          const newItem: WorkItem = {
            id: generateId(),
            content,
            tag,
            status,
            order: log.items.length,
          }

          return {
            workLogs: {
              ...state.workLogs,
              [date]: {
                ...log,
                items: [...log.items, newItem],
                updatedAt: new Date(),
              },
            },
          }
        })
      },

      updateWorkItem: (date, itemId, updates) => {
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

      deleteWorkItem: (date, itemId) => {
        set((state) => {
          const log = state.workLogs[date]
          if (!log) return state

          const filtered = log.items
            .filter((item) => item.id !== itemId)
            // order 재정렬
            .map((item, index) => ({ ...item, order: index }))

          return {
            workLogs: {
              ...state.workLogs,
              [date]: {
                ...log,
                items: filtered,
                updatedAt: new Date(),
              },
            },
          }
        })
      },

      reorderWorkItems: (date, items) => {
        set((state) => {
          const log = state.workLogs[date]
          if (!log) return state

          return {
            workLogs: {
              ...state.workLogs,
              [date]: {
                ...log,
                items,
                updatedAt: new Date(),
              },
            },
          }
        })
      },
    }),
    {
      name: "daily-scrum-worklogs", // localStorage 키
    }
  )
)
