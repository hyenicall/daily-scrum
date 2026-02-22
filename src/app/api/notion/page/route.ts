import { NextResponse } from "next/server"
import { notion, extractPageId } from "@/lib/notion"
import type {
  BlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints"

/** RichTextItem 배열을 하나의 문자열로 합침 */
function richTextToString(richText: RichTextItemResponse[]): string {
  return richText.map((t) => t.plain_text).join("")
}

/** 블록 타입별 텍스트 추출 */
function blockToText(block: BlockObjectResponse): string | null {
  switch (block.type) {
    case "paragraph":
      return richTextToString(block.paragraph.rich_text) || null

    case "heading_1":
      return `# ${richTextToString(block.heading_1.rich_text)}`

    case "heading_2":
      return `## ${richTextToString(block.heading_2.rich_text)}`

    case "heading_3":
      return `### ${richTextToString(block.heading_3.rich_text)}`

    case "bulleted_list_item":
      return `• ${richTextToString(block.bulleted_list_item.rich_text)}`

    case "numbered_list_item":
      return richTextToString(block.numbered_list_item.rich_text)

    case "to_do": {
      const checked = block.to_do.checked ? "☑" : "☐"
      return `${checked} ${richTextToString(block.to_do.rich_text)}`
    }

    default:
      return null
  }
}

export async function GET(request: Request) {
  if (!process.env.NOTION_API_KEY) {
    return NextResponse.json(
      { error: "NOTION_API_KEY 환경변수가 설정되지 않았습니다." },
      { status: 500 },
    )
  }

  const { searchParams } = new URL(request.url)
  const rawPageId = searchParams.get("pageId")

  if (!rawPageId) {
    return NextResponse.json(
      { error: "pageId 파라미터가 필요합니다." },
      { status: 400 },
    )
  }

  const pageId = extractPageId(rawPageId)

  try {
    // 페이지 메타데이터 조회 (제목 추출)
    const page = await notion.pages.retrieve({ page_id: pageId })

    let title = "Notion 페이지"
    if ("properties" in page) {
      const titleProp = Object.values(page.properties).find(
        (p) => p.type === "title",
      )
      if (titleProp && titleProp.type === "title" && titleProp.title.length > 0) {
        title = richTextToString(titleProp.title)
      }
    }

    // 페이지 블록 목록 조회
    const blocksResponse = await notion.blocks.children.list({
      block_id: pageId,
    })

    const content: string[] = blocksResponse.results
      .filter((b): b is BlockObjectResponse => "type" in b)
      .map(blockToText)
      .filter((text): text is string => text !== null && text.trim() !== "")

    return NextResponse.json({ title, content })
  } catch (error) {
    const message = error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
