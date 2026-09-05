"use client"

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react"
import { FileIcon, ImagePlusIcon, MessageCircleIcon, PaperclipIcon, SendIcon, SmileIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { MessageAttachment } from "@/components/message-attachments"

const EMOJIS = ["😀", "😁", "😂", "🥰", "😍", "😉", "😊", "😇", "🙂", "🤗", "🤩", "😎", "🥳", "😅", "😭", "😤", "👍", "👎", "👏", "🙏", "🔥", "✨", "💯", "🎉", "🎂", "🍰", "🧁", "🍩", "☕", "💐", "❤️", "✅", "❗", "❓"]

function filesToAttachments(files: FileList | null, kind: MessageAttachment["kind"]) {
  if (!files?.length) return []
  return Array.from(files).map((file) => ({
    id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
    name: file.name,
    type: file.type,
    url: URL.createObjectURL(file),
    kind: kind === "image" || file.type.startsWith("image/") ? "image" as const : "file" as const,
  }))
}

export function MessageComposer({
  placeholder,
  hint,
  onSend,
  disabled = false,
}: {
  placeholder: string
  hint: string
  disabled?: boolean
  onSend: (payload: { text: string; attachments: MessageAttachment[] }) => void | Promise<void>
}) {
  const [draft, setDraft] = useState("")
  const [attachments, setAttachments] = useState<MessageAttachment[]>([])
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const emojiRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    function closeEmoji(event: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
        setEmojiOpen(false)
      }
    }
    document.addEventListener("mousedown", closeEmoji)
    return () => document.removeEventListener("mousedown", closeEmoji)
  }, [])

  function addFiles(event: ChangeEvent<HTMLInputElement>, kind: MessageAttachment["kind"]) {
    const next = filesToAttachments(event.target.files, kind)
    if (next.length) setAttachments((current) => [...current, ...next])
    event.target.value = ""
  }

  function removeAttachment(id: string) {
    setAttachments((current) => {
      const match = current.find((item) => item.id === id)
      if (match) URL.revokeObjectURL(match.url)
      return current.filter((item) => item.id !== id)
    })
  }

  function insertEmoji(emoji: string) {
    const field = textareaRef.current
    if (!field) {
      setDraft((current) => current + emoji)
      return
    }
    const start = field.selectionStart ?? draft.length
    const end = field.selectionEnd ?? draft.length
    setDraft(`${draft.slice(0, start)}${emoji}${draft.slice(end)}`)
    requestAnimationFrame(() => {
      field.focus()
      const cursor = start + emoji.length
      field.setSelectionRange(cursor, cursor)
    })
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const text = draft.trim()
    if (disabled || sending || (!text && attachments.length === 0)) return
    setSending(true)
    try {
      await onSend({ text, attachments })
      setDraft("")
      setAttachments([])
      setEmojiOpen(false)
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={submit} className="border-t p-4">
      {attachments.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {attachments.map((item) => (
            <div key={item.id} className="relative overflow-hidden rounded-lg border bg-muted/40">
              {item.kind === "image" ? (
                <img src={item.url} alt={item.name} className="h-20 w-20 object-cover" />
              ) : (
                <div className="flex h-20 w-40 items-center gap-2 px-3">
                  <FileIcon className="size-4 shrink-0" />
                  <span className="truncate text-xs">{item.name}</span>
                </div>
              )}
              <button type="button" onClick={() => removeAttachment(item.id)} className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-black/70 text-white" aria-label={`Remove ${item.name}`}>
                <XIcon className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <input ref={fileInputRef} type="file" multiple className="sr-only" onChange={(event) => addFiles(event, "file")} />
        <input ref={imageInputRef} type="file" accept="image/*" multiple className="sr-only" onChange={(event) => addFiles(event, "image")} />

        <Button type="button" variant="ghost" size="icon" aria-label="Attach a file" onPress={() => fileInputRef.current?.click()}>
          <PaperclipIcon />
        </Button>
        <Button type="button" variant="ghost" size="icon" aria-label="Upload an image" onPress={() => imageInputRef.current?.click()}>
          <ImagePlusIcon />
        </Button>

        <div ref={emojiRef} className="relative">
          <Button type="button" variant="ghost" size="icon" aria-label="Add emoji" aria-expanded={emojiOpen} onPress={() => setEmojiOpen((open) => !open)}>
            <SmileIcon />
          </Button>
          {emojiOpen && (
            <div className="absolute bottom-11 left-0 z-20 grid w-64 grid-cols-8 gap-1 rounded-xl border bg-popover p-2 shadow-lg">
              {EMOJIS.map((emoji) => (
                <button key={emoji} type="button" className="flex size-7 items-center justify-center rounded-md text-base hover:bg-muted" onClick={() => insertEmoji(emoji)} aria-label={`Insert ${emoji}`}>
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        <Textarea
          ref={textareaRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={placeholder}
          className="min-h-10 resize-none"
          rows={1}
        />
        <Button type="submit" size="icon" aria-label="Send message" isDisabled={disabled || sending || (!draft.trim() && attachments.length === 0)}>
          <SendIcon />
        </Button>
      </div>
      <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground"><MessageCircleIcon className="size-3" /> {hint}</p>
    </form>
  )
}
