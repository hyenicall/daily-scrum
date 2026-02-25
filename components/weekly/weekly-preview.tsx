import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CopyButton } from "@/components/scrum/copy-button"
import type { GenerateWeeklyResponse } from "@/lib/validations/scrum"

interface WeeklyPreviewProps {
  result: GenerateWeeklyResponse
  weekStart: string
  weekEnd: string
}

// 주간 회고 결과를 마크다운으로 변환
function formatWeeklyAsMarkdown(
  result: GenerateWeeklyResponse,
  weekStart: string,
  weekEnd: string
): string {
  const lines: string[] = [
    `# 주간 회고 (${weekStart} ~ ${weekEnd})`,
    "",
    "## 이번 주 성과",
    ...result.summary.map((item) => `- ${item}`),
    "",
    "## 주요 하이라이트",
    ...result.highlights.map((item) => `- ${item}`),
    "",
    "## 개선 사항",
    ...result.improvements.map((item) => `- ${item}`),
    "",
    "## 다음 주 목표",
    ...result.nextWeekGoals.map((item) => `- ${item}`),
  ]

  return lines.join("\n")
}

// 주간 회고 미리보기 컴포넌트
export function WeeklyPreview({ result, weekStart, weekEnd }: WeeklyPreviewProps) {
  const markdownText = formatWeeklyAsMarkdown(result, weekStart, weekEnd)

  return (
    <div className="space-y-4">
      {/* 헤더 + 복사 버튼 */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {weekStart} ~ {weekEnd} 주간 회고
        </h2>
        <CopyButton text={markdownText} />
      </div>

      {/* 이번 주 성과 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">이번 주 성과</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {result.summary.map((item, idx) => (
              <li key={idx} className="text-sm text-muted-foreground">
                • {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* 주요 하이라이트 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">주요 하이라이트</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {result.highlights.map((item, idx) => (
              <li key={idx} className="text-sm text-muted-foreground">
                • {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* 개선 사항 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">개선 사항</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {result.improvements.map((item, idx) => (
              <li key={idx} className="text-sm text-muted-foreground">
                • {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* 다음 주 목표 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">다음 주 목표</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {result.nextWeekGoals.map((item, idx) => (
              <li key={idx} className="text-sm text-muted-foreground">
                • {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* 마크다운 원문 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">마크다운 원문</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-sm font-mono">
            {markdownText}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
