import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils"

export function Message({ align = "start", className, ...props }: HTMLAttributes<HTMLDivElement> & { align?: "start" | "end" }) {
  return <div className={cn("flex w-full items-end gap-3", align === "end" ? "justify-end" : "justify-start", className)} {...props} />
}

export function MessageAvatar({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground", className)} {...props} />
}

export function MessageContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex min-w-0 max-w-full flex-col gap-1", className)} {...props} />
}

export function MessageHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-1 text-xs font-medium text-muted-foreground", className)} {...props} />
}

export function MessageFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-1 text-[11px] text-muted-foreground", className)} {...props} />
}

export function MessageGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("grid gap-3", className)} {...props} />
}