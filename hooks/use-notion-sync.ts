"use client"

import { useEffect, useRef, useState } from "react"
import type { WorkItem } from "@/types"

export type NotionSyncStatus = "idle" | "syncing" | "synced" | "error"

/**
 * items가 변경될 때마다 1.5초 디바운스 후 Notion에 자동 동기화.
 * 첫 마운트 시에는 동기화 건너뜀.
 */
export function useNotionSync(date: string, items: WorkItem[]): NotionSyncStatus {
  const [status, setStatus] = useState<NotionSyncStatus>("idle")
  const isMounted = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // 첫 마운트 시에는 동기화 건너뜀
    if (!isMounted.current) {
      isMounted.current = true
      return
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(async () => {
      setStatus("syncing")
      try {
        const res = await fetch("/api/notion/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date, items }),
        })
        if (res.ok) {
          setStatus("synced")
        } else {
          setStatus("error")
        }
      } catch {
        setStatus("error")
      }
    }, 1500)

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  // items 참조 안정성을 위해 JSON 직렬화로 비교
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, JSON.stringify(items)])

  return status
}
