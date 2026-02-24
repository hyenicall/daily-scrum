"use client"

import { useState, useEffect } from "react"
import { Share2 } from "lucide-react"
import { toast } from "sonner"
import { useCopyToClipboard } from "usehooks-ts"

import { Button } from "@/components/ui/button"
import { useScrumStore } from "@/stores/use-scrum-store"

interface ShareButtonProps {
  date: string
}

export function ShareButton({ date }: ShareButtonProps) {
  const [mounted, setMounted] = useState(false)
  const [, copy] = useCopyToClipboard()

  useEffect(() => setMounted(true), [])

  const scrum = useScrumStore((state) => state.getScrum(date))

  const handleShare = async () => {
    if (!scrum?.shareId) return

    const url = `${window.location.origin}/share/${scrum.shareId}`
    const success = await copy(url)
    if (success) {
      toast.success("공유 링크가 복사되었습니다")
    }
  }

  const isDisabled = !mounted || !scrum?.shareId

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleShare}
      disabled={isDisabled}
      className="gap-2"
      aria-label="공유 링크 복사"
    >
      <Share2 className="size-4" />
      공유
    </Button>
  )
}
