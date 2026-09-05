import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils"

export function Bubble({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("max-w-[min(32rem,85%)] rounded-2xl bg-muted px-4 py-3 text-sm", className)} {...props} />
}

export function BubbleContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("whitespace-pre-wrap", className)} {...props} />
}