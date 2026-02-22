import OpenAI from "openai"
import { NextResponse } from "next/server"
import {
  generateScrumRequestSchema,
  generateScrumResponseSchema,
} from "@/lib/validations/scrum"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: Request) {
  // 환경변수 유효성 체크
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY 환경변수가 설정되지 않았습니다" },
      { status: 500 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "요청 본문을 파싱할 수 없습니다" },
      { status: 400 },
    )
  }

  // 요청 유효성 검사
  const parsed = generateScrumRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 })
  }

  const { workItems } = parsed.data

  if (workItems.length === 0) {
    return NextResponse.json(
      { error: "작업 항목이 없습니다" },
      { status: 400 },
    )
  }

  // 작업 항목 목록을 텍스트로 변환
  const itemList = workItems
    .map((i) => `- [${i.tag}/${i.status}] ${i.content}`)
    .join("\n")

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "당신은 개발자의 워크로그를 데일리 스크럼 형식으로 요약하는 도우미입니다. " +
            "반드시 JSON 형식으로만 응답하세요. " +
            "yesterday(배열), today(배열), blocker(문자열) 키를 포함해야 합니다. " +
            "yesterday는 어제 완료한 작업, today는 오늘 진행할 작업, blocker는 방해 요소를 의미합니다. " +
            "blocker가 없으면 '없음'으로 작성하세요.",
        },
        {
          role: "user",
          content:
            `다음 작업 항목을 바탕으로 어제 한 일(yesterday), 오늘 할 일(today), 블로커(blocker)를 JSON 형식으로 작성해주세요.\n\n${itemList}`,
        },
      ],
    })

    const content = completion.choices[0].message.content ?? "{}"
    const result = generateScrumResponseSchema.parse(JSON.parse(content))
    return NextResponse.json(result)
  } catch (error) {
    console.error("스크럼 생성 오류:", error)
    return NextResponse.json(
      { error: "스크럼 생성에 실패했습니다" },
      { status: 500 },
    )
  }
}
