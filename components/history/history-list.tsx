"use client"

import { useState, useEffect } from "react"
import { History } from "lucide-react"
import Link from "next/link"

import { useWorklogStore } from "@/stores/use-worklog-store"
import { useScrumStore } from "@/stores/use-scrum-store"
import { EmptyState } from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { Accordion } from "@/components/ui/accordion"
import { HistoryDayCard } from "./history-day-card"

export function HistoryList() {
  const [mounted, setMounted] = useState(false)
  const { workLogs } = useWorklogStore()
  const { getScrum } = useScrumStore()

  // Zustand persist + SSR hydration mismatch 방지
  useEffect(() => setMounted(true), [])

  // 날짜 내림차순 정렬 (최신 날짜가 위로)
  const sortedDates = mounted
    ? Object.keys(workLogs).sort().reverse()
    : []

  if (!mounted) {
    return null
  }

  if (sortedDates.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="아직 기록이 없습니다"
        description="워크로그를 작성하면 날짜별로 이곳에 기록이 쌓입니다"
        action={
          <Button asChild>
            <Link href="/">오늘 워크로그 작성하기</Link>
          </Button>
        }
      />
    )
  }

  return (
    <Accordion type="multiple" className="w-full">
      {sortedDates.map((date) => (
        <HistoryDayCard
          key={date}
          log={workLogs[date]}
          hasScrumGenerated={!!getScrum(date)}
        />
      ))}
    </Accordion>
  )
}
