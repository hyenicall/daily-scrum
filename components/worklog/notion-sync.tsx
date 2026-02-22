"use client"

import { useState } from "react"
import { Upload, Download, Copy, Check, RefreshCw, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

import type { WorkItem } from "@/types"
import type { NotionSyncStatus } from "@/hooks/use-notion-sync"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface NotionSyncProps {
  date: string     // "YYYY-MM-DD"
  items: WorkItem[]
  syncStatus: NotionSyncStatus
}

export function NotionSync({ date, items, syncStatus }: NotionSyncProps) {
  // 수동 동기화 상태
  const [uploadLoading, setUploadLoading] = useState(false)

  // 가져오기 Dialog 상태
  const [dialogOpen, setDialogOpen] = useState(false)
  const [notionUrl, setNotionUrl] = useState("")
  const [fetchLoading, setFetchLoading] = useState(false)
  const [fetchResult, setFetchResult] = useState<{
    title: string
    content: string[]
  } | null>(null)
  const [copied, setCopied] = useState(false)

  /** Notion에 워크로그 업로드 */
  const handleUpload = async () => {
    setUploadLoading(true)
    try {
      const res = await fetch("/api/notion/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, items }),
      })
      const data: { url?: string; error?: string; warning?: string } = await res.json()

      if (!res.ok || data.error) {
        toast.error(data.error ?? "업로드에 실패했습니다.")
        return
      }

      if (data.warning) {
        toast.warning(data.warning, {
          action: {
            label: "열기",
            onClick: () => window.open(data.url, "_blank"),
          },
        })
        return
      }

      toast.success(`Notion 데이터베이스에 ${items.length}개 항목이 추가되었습니다`, {
        action: {
          label: "열기",
          onClick: () => window.open(data.url, "_blank"),
        },
      })
    } catch {
      toast.error("네트워크 오류가 발생했습니다.")
    } finally {
      setUploadLoading(false)
    }
  }

  /** Notion 페이지 내용 가져오기 */
  const handleFetch = async () => {
    if (!notionUrl.trim()) return

    setFetchLoading(true)
    setFetchResult(null)
    try {
      const params = new URLSearchParams({ pageId: notionUrl.trim() })
      const res = await fetch(`/api/notion/page?${params}`)
      const data: { title?: string; content?: string[]; error?: string } =
        await res.json()

      if (!res.ok || data.error) {
        toast.error(data.error ?? "페이지를 가져오는 데 실패했습니다.")
        return
      }

      setFetchResult({
        title: data.title ?? "Notion 페이지",
        content: data.content ?? [],
      })
    } catch {
      toast.error("네트워크 오류가 발생했습니다.")
    } finally {
      setFetchLoading(false)
    }
  }

  /** 가져온 내용 클립보드 복사 */
  const handleCopy = async () => {
    if (!fetchResult) return
    const text = [fetchResult.title, "", ...fetchResult.content].join("\n")
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /** Dialog 닫힐 때 상태 초기화 */
  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setNotionUrl("")
      setFetchResult(null)
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* 자동 동기화 상태 인디케이터 */}
      {syncStatus === "syncing" && (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <RefreshCw className="size-3.5 animate-spin" />
          Notion 동기화 중...
        </span>
      )}
      {syncStatus === "synced" && (
        <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
          <Check className="size-3.5" />
          Notion 동기화됨
        </span>
      )}
      {syncStatus === "error" && (
        <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="size-3.5" />
          동기화 실패 — 수동 업로드
        </span>
      )}

      {/* 수동 동기화 버튼 */}
      <Button
        variant="outline"
        size="sm"
        disabled={items.length === 0 || uploadLoading}
        onClick={handleUpload}
      >
        {uploadLoading ? (
          <Spinner size="sm" className="mr-2" />
        ) : (
          <Upload className="mr-2 size-4" />
        )}
        수동 동기화
      </Button>

      {/* 가져오기 버튼 */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setDialogOpen(true)}
      >
        <Download className="mr-2 size-4" />
        Notion 가져오기
      </Button>

      {/* 가져오기 Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Notion 페이지 가져오기</DialogTitle>
          </DialogHeader>

          {/* URL 입력 영역 */}
          <div className="flex gap-2">
            <Input
              placeholder="Notion 페이지 URL 또는 ID 입력"
              value={notionUrl}
              onChange={(e) => setNotionUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleFetch()
              }}
              className="flex-1"
            />
            <Button
              size="sm"
              disabled={!notionUrl.trim() || fetchLoading}
              onClick={handleFetch}
            >
              {fetchLoading ? <Spinner size="sm" /> : "가져오기"}
            </Button>
          </div>

          {/* 가져온 결과 */}
          {fetchResult && (
            <div className="mt-2 rounded-md border bg-muted/40 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold text-sm">{fetchResult.title}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={handleCopy}
                  title="내용 복사"
                >
                  {copied ? (
                    <Check className="size-3.5 text-green-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </Button>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {fetchResult.content.length > 0 ? (
                  fetchResult.content.map((line, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {line}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">내용이 없습니다.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
