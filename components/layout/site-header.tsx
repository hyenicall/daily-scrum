import Link from "next/link"

import { siteConfig } from "@/config/site"
import { Container } from "@/components/layout/container"
import { MainNav } from "@/components/layout/main-nav"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-bold">
              {siteConfig.name}
            </Link>
            <MainNav items={siteConfig.mainNav} />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <MobileNav
              items={siteConfig.mainNav}
              siteName={siteConfig.name}
            />
          </div>
        </div>
      </Container>
    </header>
  )
}
