import { z } from "zod/v4"

/** API 요청: /api/generate-scrum */
export const generateScrumRequestSchema = z.object({
  workItems: z.array(
    z.object({
      id: z.string(),
      content: z.string(),
      tag: z.string(),
      status: z.string(),
      order: z.number(),
    }),
  ),
  format: z.enum(["slack", "markdown"]),
})

/** API 응답: OpenAI 생성 결과 */
export const generateScrumResponseSchema = z.object({
  yesterday: z.array(z.string()),
  today: z.array(z.string()),
  blocker: z.string(),
})

export type GenerateScrumRequest = z.infer<typeof generateScrumRequestSchema>
export type GenerateScrumResponse = z.infer<typeof generateScrumResponseSchema>

/** API 요청: /api/admin/consolidate-scrum */
export const consolidateScrumRequestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식이어야 합니다"),
  scrums: z.array(
    z.object({
      userId: z.string(),
      yesterday: z.array(z.string()),
      today: z.array(z.string()),
      blocker: z.string(),
    })
  ),
  format: z.enum(["slack", "markdown"]),
})

export type ConsolidateScrumRequest = z.infer<typeof consolidateScrumRequestSchema>

/** API 요청: /api/admin/save-team-scrum */
export const saveTeamScrumRequestSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식이어야 합니다"),
  yesterday: z.array(z.string()),
  today: z.array(z.string()),
  blocker: z.string(),
  format: z.enum(["slack", "markdown"]),
})

export type SaveTeamScrumRequest = z.infer<typeof saveTeamScrumRequestSchema>

/** API 요청: /api/send-slack */
export const sendSlackSchema = z.object({
  text: z.string().min(1, "전송할 내용이 없습니다"),
  webhookUrl: z.string().url("올바른 웹훅 URL이어야 합니다"),
})

export type SendSlackRequest = z.infer<typeof sendSlackSchema>

/** API 요청: /api/generate-weekly */
export const generateWeeklyRequestSchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식이어야 합니다"),
  weekEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD 형식이어야 합니다"),
  scrums: z.array(
    z.object({
      date: z.string(),
      yesterday: z.array(z.string()),
      today: z.array(z.string()),
      blocker: z.string(),
    })
  ),
})

/** API 응답: 주간 회고 생성 결과 */
export const generateWeeklyResponseSchema = z.object({
  summary: z.array(z.string()),
  highlights: z.array(z.string()),
  improvements: z.array(z.string()),
  nextWeekGoals: z.array(z.string()),
})

export type GenerateWeeklyRequest = z.infer<typeof generateWeeklyRequestSchema>
export type GenerateWeeklyResponse = z.infer<typeof generateWeeklyResponseSchema>
