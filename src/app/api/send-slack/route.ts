import { NextResponse } from "next/server"
import { sendSlackSchema } from "@/lib/validations/scrum"

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "요청 본문을 파싱할 수 없습니다" }, { status: 400 })
  }

  const parsed = sendSlackSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 요청입니다", details: parsed.error.issues }, { status: 400 })
  }

  const { text, webhookUrl } = parsed.data

  // 슬랙 웹훅 전송
  const slackResponse = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  })

  if (!slackResponse.ok) {
    let slackError = "슬랙 전송에 실패했습니다"
    try {
      const errText = await slackResponse.text()
      if (errText) slackError = errText
    } catch {
      // 에러 텍스트 파싱 실패 무시
    }
    return NextResponse.json({ error: slackError }, { status: 502 })
  }

  return NextResponse.json({ message: "슬랙으로 전송되었습니다" })
}
