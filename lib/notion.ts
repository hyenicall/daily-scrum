import { Client } from "@notionhq/client"

/**
 * Notion API 클라이언트 싱글톤 (서버사이드 전용)
 * 반드시 API Route에서만 import하고, 클라이언트 컴포넌트에서 직접 사용 금지
 */
export const notion = new Client({ auth: process.env.NOTION_API_KEY })

/**
 * Notion 페이지 URL 또는 ID에서 순수 pageId(32자 hex) 추출
 *
 * @example
 * extractPageId("https://www.notion.so/My-Page-abc123def456...") → "abc123def456..."
 * extractPageId("abc123def456...")                                → "abc123def456..."
 */
export function extractPageId(urlOrId: string): string {
  const trimmed = urlOrId.trim()

  // URL 형태인 경우: 마지막 세그먼트에서 "-" 뒤 32자 hex ID 추출
  if (trimmed.startsWith("http")) {
    // notion.so URL 패턴: .../[페이지명]-[32자ID] 또는 .../[32자ID]
    const match = trimmed.match(/([a-f0-9]{32})(?:\?|$|#)/)
    if (match) return match[1]

    // URL에서 마지막 path 세그먼트의 마지막 "-" 이후 ID 추출
    const pathSegment = trimmed.split("/").pop()?.split("?")[0] ?? ""
    const segments = pathSegment.split("-")
    const lastSegment = segments[segments.length - 1]

    // 32자 hex 형태면 반환, 아니면 dash 제거 후 반환
    if (/^[a-f0-9]{32}$/i.test(lastSegment)) return lastSegment

    // dash 포함 UUID 형태 (8-4-4-4-12) 처리
    const withoutDashes = lastSegment.replace(/-/g, "")
    if (/^[a-f0-9]{32}$/i.test(withoutDashes)) return withoutDashes
  }

  // 이미 ID 형태(32자 hex)인 경우 그대로 반환
  if (/^[a-f0-9]{32}$/i.test(trimmed)) return trimmed

  // UUID 형태 (8-4-4-4-12)인 경우 dash 제거 후 반환
  const withoutDashes = trimmed.replace(/-/g, "")
  if (/^[a-f0-9]{32}$/i.test(withoutDashes)) return withoutDashes

  return trimmed
}
