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

  // 태그/상태 한국어 매핑
  const TAG_LABELS: Record<string, string> = {
    feature: "기능 개발",
    bugfix: "버그 수정",
    meeting: "회의",
    review: "코드 리뷰",
    etc: "기타",
  }
  const STATUS_LABELS: Record<string, string> = {
    done: "완료",
    "in-progress": "진행 중",
    blocked: "블로킹",
  }

  // 작업 항목 목록을 한국어 레이블로 변환
  const itemList = workItems
    .map(
      (i) =>
        `- [${TAG_LABELS[i.tag] ?? i.tag} / ${STATUS_LABELS[i.status] ?? i.status}] ${i.content}`,
    )
    .join("\n")

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "당신은 개발자의 워크로그를 데일리 스크럼 형식으로 작성하는 도우미입니다.\n" +
            "반드시 JSON 형식으로만 응답하세요.\n" +
            "yesterday(배열), today(배열), blocker(문자열) 키를 포함해야 합니다.\n\n" +
            "작성 규칙:\n" +
            "- yesterday: 어제 완료하거나 진행한 작업. 각 항목은 무엇을 했고 어떤 결과를 얻었는지 구체적인 문장으로 서술하세요.\n" +
            "- today: 오늘 진행할 작업 계획. 어제 진행 중인 작업의 연장선이나 다음 단계를 구체적으로 서술하세요.\n" +
            "- blocker: 작업을 방해하는 요소. 없으면 \"없음\"으로 작성하세요.\n\n" +
            "각 항목은 단순 반복이 아닌 완성된 한 문장으로 서술하고, 작업의 목적·구현 내용·결과를 포함하세요.\n" +
            "예시: \"로그인 구현\" → \"JWT 기반 로그인 기능을 구현하고 세션 유지 로직을 추가했습니다.\"",
        },
        {
          role: "user",
          content: `다음 작업 항목을 바탕으로 어제 한 일(yesterday), 오늘 할 일(today), 블로커(blocker)를 JSON 형식으로 작성해주세요.\n\n${itemList}`,
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
