"use client"

import { useState, useCallback } from "react"
import type { ReactNode } from "react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface UseConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "default" | "destructive"
}

export function useConfirm({
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant,
}: UseConfirmOptions): [ReactNode, () => Promise<boolean>] {
  const [promise, setPromise] = useState<{
    resolve: (value: boolean) => void
  } | null>(null)

  const confirm = useCallback(
    () =>
      new Promise<boolean>((resolve) => {
        setPromise({ resolve })
      }),
    [],
  )

  const handleConfirm = useCallback(() => {
    promise?.resolve(true)
    setPromise(null)
  }, [promise])

  const handleCancel = useCallback(() => {
    promise?.resolve(false)
    setPromise(null)
  }, [promise])

  const dialog = (
    <ConfirmDialog
      open={promise !== null}
      onOpenChange={(open) => {
        if (!open) handleCancel()
      }}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      variant={variant}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  )

  return [dialog, confirm]
}
