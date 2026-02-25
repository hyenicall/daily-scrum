"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useScrumStore } from "@/stores/use-scrum-store"
import { formatAsSlack } from "@/lib/scrum-formatter"

interface SlackSendButtonProps {
  date: string
}

// 슬랙 웹훅으로 스크럼 전송 버튼 — Client Component
export function SlackSendButton({ date }: SlackSendButtonProps) {
  const [webhookUrl, setWebhookUrl] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const scrum = useScrumStore((state) => state.getScrum(date))

  const handleSend = async () => {
    if (!scrum) {
      toast.error("스크럼 데이터가 없습니다")
      return
    }

    if (!webhookUrl.trim()) {
      toast.error("슬랙 웹훅 URL을 입력해주세요")
      return
    }

    setIsSending(true)
    try {
      const text = formatAsSlack(scrum)
      const response = await fetch("/api/send-slack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, webhookUrl }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error((err as { error?: string }).error ?? "전송에 실패했습니다")
      }

      toast.success("슬랙으로 전송되었습니다")
      setDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "전송에 실패했습니다")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={!scrum}
        >
          <Send className="h-4 w-4" />
          슬랙 전송
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>슬랙으로 스크럼 전송</DialogTitle>
          <DialogDescription>
            슬랙 인커밍 웹훅 URL을 입력하면 스크럼을 직접 전송합니다.
            웹훅 URL은 슬랙 앱 설정에서 발급받을 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">슬랙 웹훅 URL</Label>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://hooks.slack.com/services/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              disabled={isSending}
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={isSending || !webhookUrl.trim()}
            className="w-full"
          >
            {isSending ? (
              <>
                <Spinner size="sm" className="mr-2" />
                전송 중...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                전송
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
