import { NextResponse } from "next/server"
import { notion } from "@/lib/notion"
import type { WorkItem } from "@/types"
import { WORK_TAG_LABELS, WORK_STATUS_LABELS } from "@/types"

interface UploadRequestBody {
  date: string
  items: WorkItem[]
}

export async function POST(request: Request) {
  // 환경변수 유효성 체크
  if (!process.env.NOTION_API_KEY) {
    return NextResponse.json(
      { error: "NOTION_API_KEY 환경변수가 설정되지 않았습니다." },
      { status: 500 },
    )
  }
  if (!process.env.NOTION_DATABASE_ID) {
    return NextResponse.json(
      { error: "NOTION_DATABASE_ID 환경변수가 설정되지 않았습니다." },
      { status: 500 },
    )
  }

  let body: UploadRequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "요청 본문을 파싱할 수 없습니다." }, { status: 400 })
  }

  const { date, items } = body

  if (!date || !Array.isArray(items)) {
    return NextResponse.json(
      { error: "date와 items 필드가 필요합니다." },
      { status: 400 },
    )
  }

  const databaseId = process.env.NOTION_DATABASE_ID

  // 해당 날짜의 기존 항목 전체 조회 후 archive (upsert를 위한 replace-all 전략)
  try {
    const existingPages = await notion.dataSources.query({
      data_source_id: databaseId,
      filter: { property: "날짜", date: { equals: date } },
    })
    await Promise.allSettled(
      existingPages.results.map((page) =>
        notion.pages.update({ page_id: page.id, archived: true }),
      ),
    )
  } catch {
    // archive 실패 시 이후 생성은 계속 진행
  }

  // items가 없으면 archive만 수행하고 성공 반환
  if (items.length === 0) {
    const dbId = databaseId.replace(/-/g, "")
    return NextResponse.json({ url: `https://notion.so/${dbId}` })
  }

  /** WorkItem 1개를 데이터베이스 행(page)으로 생성 */
  const createRow = (item: WorkItem) =>
    notion.pages.create({
      parent: { type: "database_id", database_id: databaseId },
      properties: {
        이름: { title: [{ text: { content: item.content } }] },
        날짜: { date: { start: date } },
        태그: { select: { name: WORK_TAG_LABELS[item.tag] } },
        상태: { status: { name: WORK_STATUS_LABELS[item.status] } },
        순서: { number: item.order },
      },
    })

  // 모든 WorkItem을 병렬로 데이터베이스에 추가
  const results = await Promise.allSettled(items.map(createRow))

  const failed = results.filter((r): r is PromiseRejectedResult => r.status === "rejected")

  // 전체 실패 시 에러 반환
  if (failed.length === results.length) {
    const reason = failed[0].reason
    const message = reason instanceof Error ? reason.message : "모든 항목 업로드에 실패했습니다."
    return NextResponse.json({ error: message }, { status: 500 })
  }

  // 데이터베이스 URL 구성 (id는 dash 없는 32자 hex)
  const dbId = databaseId.replace(/-/g, "")
  const url = `https://notion.so/${dbId}`

  // 일부 실패 시 경고 포함 반환
  if (failed.length > 0) {
    return NextResponse.json({
      url,
      warning: `${results.length}개 중 ${failed.length}개 항목 업로드에 실패했습니다.`,
    })
  }

  return NextResponse.json({ url })
}
