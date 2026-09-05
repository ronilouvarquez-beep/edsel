"use client"

import { useEffect, useRef, useState } from "react"

import type { MessageReaction } from "@/app/actions/messages"
import { Button } from "@/components/ui/button"
import { BubbleContent, BubbleReactions } from "@/components/ui/bubble"

const REACTIONS = ["👍", "❤️", "😂", "🎉", "🙏"] as const

type MessageReactionsProps = {
  messageId: string
  userId: string
  reactions: MessageReaction[]
  align: "start" | "end"
  onToggle: (messageId: string, emoji: string) => void
  children: React.ReactNode
}

export function MessageReactions({ messageId, userId, reactions, align, onToggle, children }: MessageReactionsProps) {
  const [open, setOpen] = useState(false)
  const holdTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const selected = reactions.filter((reaction) => reaction.userId === userId).map((reaction) => reaction.emoji)
  const reactionCounts = reactions.reduce<Record<string, number>>((counts, reaction) => {
    counts[reaction.emoji] = (counts[reaction.emoji] ?? 0) + 1
    return counts
  }, {})

  useEffect(() => () => {
    if (holdTimeout.current) clearTimeout(holdTimeout.current)
  }, [])

  function startHold() {
    if (holdTimeout.current) clearTimeout(holdTimeout.current)
    holdTimeout.current = setTimeout(() => {
      setOpen(true)
      holdTimeout.current = null
    }, 500)
  }

  function cancelHold() {
    if (holdTimeout.current) {
      clearTimeout(holdTimeout.current)
      holdTimeout.current = null
    }
  }

  function toggle(emoji: string) {
    onToggle(messageId, emoji)
    setOpen(false)
  }

  return (
    <>
      <BubbleContent onPointerDown={startHold} onPointerUp={cancelHold} onPointerCancel={cancelHold} onPointerLeave={cancelHold}>
        {children}
      </BubbleContent>
      {open ? (
        <BubbleReactions side="bottom" align={align} aria-label="Add a reaction">
          {REACTIONS.map((emoji) => (
            <Button key={emoji} type="button" variant={selected.includes(emoji) ? "secondary" : "ghost"} size="icon-xs" aria-label={`React with ${emoji}`} aria-pressed={selected.includes(emoji)} onPress={() => toggle(emoji)}>
              {emoji}
            </Button>
          ))}
        </BubbleReactions>
      ) : reactions.length > 0 && (
        <BubbleReactions side="bottom" align={align} aria-label="Message reactions">
          {Object.entries(reactionCounts).map(([emoji, count]) => (
            <Button key={emoji} type="button" variant={selected.includes(emoji) ? "secondary" : "ghost"} size="sm" className="gap-1 px-2" aria-label={`${selected.includes(emoji) ? "Remove" : "Add"} reaction ${emoji}. ${count} user${count === 1 ? "" : "s"} reacted.`} aria-pressed={selected.includes(emoji)} onPress={() => toggle(emoji)}>
              {emoji}
              <span className="text-xs">{count}</span>
            </Button>
          ))}
        </BubbleReactions>
      )}
    </>
  )
}