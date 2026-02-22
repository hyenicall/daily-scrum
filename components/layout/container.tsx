import { cn } from "@/lib/utils"

const sizeClasses = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
} as const

interface ContainerProps {
  size?: keyof typeof sizeClasses
  className?: string
  children: React.ReactNode
}

export function Container({
  size = "xl",
  className,
  children,
}: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizeClasses[size], className)}>
      {children}
    </div>
  )
}
