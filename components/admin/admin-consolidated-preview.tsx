import { Save } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import type { GenerateScrumResponse } from "@/lib/validations/scrum"

interface AdminConsolidatedPreviewProps {
  result: GenerateScrumResponse
  onSave: () => Promise<void>
  isSaving: boolean
}

// 통합 스크럼 미리보기 + 저장 버튼 — Server-compatible (props only)
export function AdminConsolidatedPreview({
  result,
  onSave,
  isSaving,
}: AdminConsolidatedPreviewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">통합 스크럼 미리보기</h3>
        <Button
          onClick={onSave}
          disabled={isSaving}
          size="sm"
          className="gap-2"
        >
          {isSaving ? (
            <>
              <Spinner size="sm" />
              저장 중...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              저장
            </>
          )}
        </Button>
      </div>

      {/* 어제 한 일 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">어제 한 일 (팀)</CardTitle>
        </CardHeader>
        <CardContent>
          {result.yesterday.length > 0 ? (
            <ul className="space-y-1">
              {result.yesterday.map((item, idx) => (
                <li key={idx} className="text-sm text-muted-foreground">
                  • {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">• (없음)</p>
          )}
        </CardContent>
      </Card>

      {/* 오늘 할 일 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">오늘 할 일 (팀)</CardTitle>
        </CardHeader>
        <CardContent>
          {result.today.length > 0 ? (
            <ul className="space-y-1">
              {result.today.map((item, idx) => (
                <li key={idx} className="text-sm text-muted-foreground">
                  • {item}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">• (없음)</p>
          )}
        </CardContent>
      </Card>

      {/* 블로커 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">블로커 (팀)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            • {result.blocker.trim() || "없음"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
