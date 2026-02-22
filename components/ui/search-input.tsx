"use client"

import { forwardRef } from "react"
import { Search, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchInputProps
  extends Omit<React.ComponentProps<typeof Input>, "type"> {
  onClear?: () => void
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onClear, ...props }, ref) => {
    return (
      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          className={cn("pl-9 pr-9", className)}
          value={value}
          ref={ref}
          {...props}
        />
        {value && onClear && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
            onClick={onClear}
            tabIndex={-1}
          >
            <X className="size-4 text-muted-foreground" />
            <span className="sr-only">검색어 지우기</span>
          </Button>
        )}
      </div>
    )
  },
)
SearchInput.displayName = "SearchInput"

export { SearchInput }
