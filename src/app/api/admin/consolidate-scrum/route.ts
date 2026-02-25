import OpenAI from "openai"
import { NextResponse } from "next/server"
import {
  consolidateScrumRequestSchema,
  generateScrumResponseSchema,
} from "@/lib/validations/scrum"
import { createSupabaseServerClient } from "@/lib/supabase/server"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  // 환경변수 유효성 체크
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY 환경변수가 설정되지 않았습니다" },
      { status: 500 }
    )
  }

  // 인증 확인
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "요청 본문을 파싱할 수 없습니다" }, { status: 400 })
  }

  const parsed = consolidateScrumRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 })
  }

  const { date, scrums, format } = parsed.data

  if (scrums.length === 0) {
    return NextResponse.json({ error: "스크럼 데이터가 없습니다" }, { status: 400 })
  }

  // 팀원 스크럼을 텍스트로 변환
  const scrumText = scrums
    .map((s, idx) => {
      const yesterday = s.yesterday.join(", ") || "없음"
      const today = s.today.join(", ") || "없음"
      const blocker = s.blocker || "없음"
      return `[팀원 ${idx + 1}]\n어제: ${yesterday}\n오늘: ${today}\n블로커: ${blocker}`
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
            "당신은 여러 팀원의 데일리 스크럼을 통합하여 팀 스크럼 보고서를 작성하는 도우미입니다.\n" +
            "반드시 JSON 형식으로만 응답하세요.\n" +
            "yesterday(배열), today(배열), blocker(문자열) 키를 포함해야 합니다.\n\n" +
            "작성 규칙:\n" +
            "- 중복 내용은 하나로 통합하세요\n" +
            "- 각 항목은 팀 전체의 관점에서 서술하세요\n" +
            "- blocker: 팀 전체의 블로킹 이슈, 없으면 \"없음\"\n" +
            "- 각 항목은 완성된 한 문장으로 서술하세요",
        },
        {
          role: "user",
          content: `다음 ${scrums.length}명의 팀원 스크럼을 통합하여 팀 데일리 스크럼 보고서를 작성해주세요.\n\n${scrumText}`,
        },
      ],
    })

    const content = completion.choices[0].message.content ?? "{}"
    const result = generateScrumResponseSchema.parse(JSON.parse(content))
    return NextResponse.json({ ...result, date, format })
  } catch (error) {
    console.error("팀 스크럼 통합 오류:", error)
    return NextResponse.json({ error: "팀 스크럼 통합에 실패했습니다" }, { status: 500 })
  }
}
