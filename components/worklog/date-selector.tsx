"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DateSelectorProps {
  value: string
  onChange: (date: string) => void
}

export function DateSelector({ value, onChange }: DateSelectorProps) {
  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={value}
        max={today}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-9 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs",
          "outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      />
      {value !== today && (
        <Button variant="outline" size="sm" onClick={() => onChange(today)}>
          오늘
        </Button>
      )}
    </div>
  )
}
