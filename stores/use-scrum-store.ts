"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { DailyScrum, ScrumFormat } from "@/types"

// ============================================================
// 헬퍼 함수
// ============================================================

/** 간단한 ID 생성기 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** 공유용 짧은 ID 생성기 */
function generateShareId(): string {
  return Math.random().toString(36).slice(2, 10)
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

  // ---- 조회 ----
  /** 특정 날짜의 스크럼 반환 */
  getScrum: (date: string) => DailyScrum | undefined
  /** 공유 ID로 스크럼 검색 */
  getScrumByShareId: (shareId: string) => DailyScrum | undefined

  // ---- 스크럼 CRUD ----
  /** 스크럼 저장 (신규 생성 또는 업데이트) */
  saveScrum: (
    date: string,
    data: Pick<DailyScrum, "yesterday" | "today" | "blocker" | "format">
  ) => DailyScrum
  /** 스크럼 삭제 */
  deleteScrum: (date: string) => void
  /** 스크럼 항목 수정 */
  updateScrumField: (
    date: string,
    field: keyof Pick<DailyScrum, "yesterday" | "today" | "blocker" | "format">,
    value: DailyScrum[keyof Pick<DailyScrum, "yesterday" | "today" | "blocker" | "format">]
  ) => void

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
  ) => DailyScrum
}

// ============================================================
// 스토어 구현
// ============================================================

export const useScrumStore = create<ScrumState>()(
  persist(
    (set, get) => ({
      scrums: {},
      isGenerating: false,
      generateError: null,

      // ---- 조회 ----

      getScrum: (date) => {
        return get().scrums[date]
      },

      getScrumByShareId: (shareId) => {
        return Object.values(get().scrums).find(
          (scrum) => scrum.shareId === shareId
        )
      },

      // ---- 스크럼 CRUD ----

      saveScrum: (date, data) => {
        const existing = get().scrums[date]

        if (existing) {
          // 기존 스크럼 업데이트 (shareId 유지)
          const updated: DailyScrum = {
            ...existing,
            ...data,
          }
          set((state) => ({
            scrums: { ...state.scrums, [date]: updated },
          }))
          return updated
        }

        // 신규 스크럼 생성
        const newScrum: DailyScrum = {
          id: generateId(),
          date,
          ...data,
          shareId: generateShareId(),
          createdAt: new Date(),
        }

        set((state) => ({
          scrums: { ...state.scrums, [date]: newScrum },
        }))

        return newScrum
      },

      deleteScrum: (date) => {
        set((state) => {
          const next = { ...state.scrums }
          delete next[date]
          return { scrums: next }
        })
      },

      updateScrumField: (date, field, value) => {
        set((state) => {
          const scrum = state.scrums[date]
          if (!scrum) return state

          return {
            scrums: {
              ...state.scrums,
              [date]: { ...scrum, [field]: value },
            },
          }
        })
      },

      // ---- AI 생성 상태 ----

      setGenerating: (isGenerating) => set({ isGenerating }),

      setGenerateError: (error) => set({ generateError: error }),

      // ---- AI 생성 결과 적용 ----

      applyGeneratedScrum: (date, yesterday, today, blocker, format) => {
        return get().saveScrum(date, { yesterday, today, blocker, format })
      },
    }),
    {
      name: "daily-scrum-scrums", // localStorage 키
    }
  )
)
