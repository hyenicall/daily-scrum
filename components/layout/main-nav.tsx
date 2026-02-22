"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import type { NavItem } from "@/types"
import { cn } from "@/lib/utils"

interface MainNavProps {
  items: NavItem[]
}

export function MainNav({ items }: MainNavProps) {
  const pathname = usePathname()

  return (
    <nav className="hidden items-center gap-1 md:flex">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-foreground",
            pathname === item.href
              ? "text-foreground"
              : "text-muted-foreground",
            item.disabled && "pointer-events-none opacity-60",
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
