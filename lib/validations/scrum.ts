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
