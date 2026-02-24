"use client"

import { useState, useEffect } from "react"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { useCopyToClipboard } from "usehooks-ts"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CopyButtonProps {
  text: string
  className?: string
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const [, copy] = useCopyToClipboard()

  // 2초 후 아이콘 원복
  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  const handleCopy = async () => {
    const success = await copy(text)
    if (success) {
      setCopied(true)
      toast.success("클립보드에 복사되었습니다")
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleCopy}
      disabled={!text}
      className={cn("gap-2", className)}
      aria-label="클립보드에 복사"
    >
      {copied ? (
        <>
          <Check className="size-4" />
          복사됨
        </>
      ) : (
        <>
          <Copy className="size-4" />
          복사
        </>
      )}
    </Button>
  )
}
