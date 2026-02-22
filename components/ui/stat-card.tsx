import type { LucideIcon } from "lucide-react"
import { TrendingDown, TrendingUp } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  trend?: {
    value: number
    label?: string
  }
  className?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  const isPositive = trend && trend.value >= 0

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="size-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className="mt-1 flex items-center gap-1 text-xs">
            {isPositive ? (
              <TrendingUp className="size-3 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="size-3 text-red-600 dark:text-red-400" />
            )}
            <span
              className={cn(
                "font-medium",
                isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
              )}
            >
              {isPositive ? "+" : ""}
              {trend.value}%
            </span>
            {trend.label && (
              <span className="text-muted-foreground">{trend.label}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
