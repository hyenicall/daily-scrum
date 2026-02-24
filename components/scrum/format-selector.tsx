"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useScrumStore } from "@/stores/use-scrum-store"
import type { ScrumFormat } from "@/types"

interface FormatSelectorProps {
  date: string
}

export function FormatSelector({ date }: FormatSelectorProps) {
  const scrum = useScrumStore((state) => state.getScrum(date))
  const updateScrumField = useScrumStore((state) => state.updateScrumField)

  const currentFormat: ScrumFormat = scrum?.format ?? "slack"

  const handleFormatChange = (value: string) => {
    updateScrumField(date, "format", value as ScrumFormat)
  }

  return (
    <Tabs value={currentFormat} onValueChange={handleFormatChange}>
      <TabsList>
        <TabsTrigger value="slack">슬랙</TabsTrigger>
        <TabsTrigger value="markdown">마크다운</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
