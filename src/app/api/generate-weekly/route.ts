import OpenAI from "openai"
import { NextResponse } from "next/server"
import {
  generateWeeklyRequestSchema,
  generateWeeklyResponseSchema,
} from "@/lib/validations/scrum"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY 환경변수가 설정되지 않았습니다" },
      { status: 500 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "요청 본문을 파싱할 수 없습니다" }, { status: 400 })
  }

  const parsed = generateWeeklyRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 })
  }

  const { weekStart, weekEnd, scrums } = parsed.data

  if (scrums.length === 0) {
    return NextResponse.json({ error: "이번 주 스크럼 데이터가 없습니다" }, { status: 400 })
  }

  // 스크럼을 날짜별로 텍스트 변환
  const scrumText = scrums
    .map((s) => {
      const yesterday = s.yesterday.join(", ") || "없음"
      const blocker = s.blocker || "없음"
      return `[${s.date}]\n작업: ${yesterday}\n블로커: ${blocker}`
    })
    .join("\n\n")

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "당신은 개발자의 주간 업무를 분석하여 주간 회고 보고서를 작성하는 도우미입니다.\n" +
            "반드시 JSON 형식으로만 응답하세요.\n" +
            "summary(주간 성과 요약, 배열), highlights(주요 하이라이트, 배열), " +
            "improvements(개선 사항, 배열), nextWeekGoals(다음 주 목표, 배열) 키를 포함해야 합니다.\n\n" +
            "작성 규칙:\n" +
            "- summary: 이번 주에 완료한 주요 작업 목록 (3-5개)\n" +
            "- highlights: 특히 잘 된 점이나 성과 (2-3개)\n" +
            "- improvements: 다음에 개선할 사항 (2-3개)\n" +
            "- nextWeekGoals: 다음 주 목표 및 계획 (3-5개)\n" +
            "- 각 항목은 완성된 한 문장으로 서술하세요",
        },
        {
          role: "user",
          content:
            `${weekStart} ~ ${weekEnd} 주간 데일리 스크럼 기록을 바탕으로 주간 회고 보고서를 작성해주세요.\n\n${scrumText}`,
        },
      ],
    })

    const content = completion.choices[0].message.content ?? "{}"
    const result = generateWeeklyResponseSchema.parse(JSON.parse(content))
    return NextResponse.json(result)
  } catch (error) {
    console.error("주간 회고 생성 오류:", error)
    return NextResponse.json({ error: "주간 회고 생성에 실패했습니다" }, { status: 500 })
  }
}
