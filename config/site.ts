import type { SiteConfig } from "@/types"

export const siteConfig: SiteConfig = {
  name: "데일리 스크럼",
  description: "워크로그를 기록하고 AI가 자동으로 스크럼 내용을 생성합니다",
  mainNav: [
    {
      title: "오늘의 워크로그",
      href: "/",
    },
    {
      title: "스크럼 생성",
      href: "/scrum",
    },
    {
      title: "기록 조회",
      href: "/history",
    },
  ],
  links: {
    github: "https://github.com",
  },
}
