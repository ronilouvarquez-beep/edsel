import { FileIcon } from "lucide-react"

export type MessageAttachment = {
  id: string
  name: string
  type: string
  url: string
  kind: "image" | "file"
}

export function MessageAttachments({
  attachments,
  inverted = false,
}: {
  attachments?: MessageAttachment[]
  inverted?: boolean
}) {
  if (!attachments?.length) return null

  return (
    <div className={attachments.some((item) => item.kind === "image") || attachments.length > 1 ? "mt-3 grid gap-2" : "mt-3"}>
      {attachments.map((item) => item.kind === "image" ? (
        <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl">
          <img src={item.url} alt={item.name} className="max-h-56 w-full object-cover" />
        </a>
      ) : (
        <a key={item.id} href={item.url} download={item.name} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${inverted ? "bg-white/15" : "bg-background"}`}>
          <FileIcon className="size-3.5" />
          <span className="truncate">{item.name}</span>
        </a>
      ))}
    </div>
  )
}
