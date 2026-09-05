"use client"

import { useEffect, useRef } from "react"

export function useChatScroll(resetKey: string | number) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    node.scrollTo({ top: node.scrollHeight, behavior: "smooth" })
  }, [resetKey])

  return ref
}
