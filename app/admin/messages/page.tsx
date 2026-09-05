"use client"

import { useMemo, useState } from "react"
import { BellIcon, CheckCircle2Icon, MoreHorizontalIcon, SearchIcon, ShieldCheckIcon, UserRoundIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageHeader } from "@/components/ui/message"
import { MessageAttachments, type MessageAttachment } from "@/components/message-attachments"
import { MessageComposer } from "@/components/message-composer"
import { useChatScroll } from "@/hooks/use-chat-scroll"

type Sender = "admin" | "staff" | "customer"
type Channel = "customer" | "staff"
type Thread = {
  id: string
  name: string
  initials: string
  channel: Channel
  topic: string
  detail: string
  unread: number
  messages: { id: number; sender: Sender; name: string; text: string; time: string; attachments?: MessageAttachment[] }[]
}

const initialThreads: Thread[] = [
  {
    id: "juan",
    name: "Juan Dela Cruz",
    initials: "JD",
    channel: "customer",
    topic: "Birthday Dessert Table",
    detail: "Sep 07 · 30 guests",
    unread: 2,
    messages: [
      { id: 1, sender: "customer", name: "Juan Dela Cruz", text: "Hi, can we add two more dessert trays to our birthday order?", time: "9:42 AM" },
      { id: 2, sender: "staff", name: "Ana Reyes · Staff", text: "I will check availability with the kitchen team and get back to you shortly.", time: "9:48 AM" },
      { id: 3, sender: "customer", name: "Juan Dela Cruz", text: "Thank you. We would also like the colors to match a blue and gold theme.", time: "9:51 AM" },
    ],
  },
  {
    id: "liza",
    name: "Liza Tan",
    initials: "LT",
    channel: "customer",
    topic: "Corporate Snack Boxes",
    detail: "Sep 14 · 55 guests",
    unread: 1,
    messages: [
      { id: 4, sender: "customer", name: "Liza Tan", text: "Could you confirm the delivery window for the snack boxes?", time: "Yesterday" },
      { id: 5, sender: "staff", name: "Ana Reyes · Staff", text: "We can deliver between 10:00 AM and 12:00 NN. I will confirm the final window.", time: "Yesterday" },
    ],
  },
  {
    id: "maria",
    name: "Maria Santos",
    initials: "MS",
    channel: "customer",
    topic: "Chocolate Dedication Cake",
    detail: "Sep 06 · 12 guests",
    unread: 0,
    messages: [
      { id: 6, sender: "staff", name: "Ana Reyes · Staff", text: "Your chocolate dedication cake is confirmed for tomorrow.", time: "Monday" },
      { id: 7, sender: "customer", name: "Maria Santos", text: "Perfect, thank you for confirming!", time: "Monday" },
    ],
  },
  {
    id: "ana",
    name: "Ana Reyes",
    initials: "AR",
    channel: "staff",
    topic: "Kitchen availability",
    detail: "Needs approval for extra trays",
    unread: 1,
    messages: [
      { id: 8, sender: "staff", name: "Ana Reyes · Staff", text: "Juan asked for two more dessert trays. Can we approve the extra ingredients?", time: "10:05 AM" },
      { id: 9, sender: "admin", name: "You · Admin", text: "Yes. Use the weekend reserve and update the reservation notes.", time: "10:12 AM" },
    ],
  },
  {
    id: "carlo",
    name: "Carlo Garcia",
    initials: "CG",
    channel: "staff",
    topic: "Snack box delivery",
    detail: "Liza Tan · Sep 14",
    unread: 0,
    messages: [
      { id: 10, sender: "staff", name: "Carlo Garcia · Staff", text: "The van is free from 9:30 AM. Should I lock that window for Liza Tan?", time: "Yesterday" },
    ],
  },
]

function senderLabel(sender: Sender) {
  if (sender === "admin") return "Admin"
  if (sender === "staff") return "Staff"
  return "Customer"
}

export default function AdminMessagesPage() {
  const [threads, setThreads] = useState(initialThreads)
  const [activeId, setActiveId] = useState(initialThreads[0].id)
  const [search, setSearch] = useState("")
  const [channel, setChannel] = useState<"all" | Channel>("all")
  const activeThread = threads.find((thread) => thread.id === activeId) ?? threads[0]
  const visibleThreads = useMemo(() => threads.filter((thread) => {
    const matchesSearch = `${thread.name} ${thread.topic} ${thread.detail}`.toLowerCase().includes(search.toLowerCase())
    const matchesChannel = channel === "all" || thread.channel === channel
    return matchesSearch && matchesChannel
  }), [threads, search, channel])
  const conversationRef = useChatScroll(`${activeId}-${activeThread.messages.length}`)

  function selectThread(id: string) {
    setActiveId(id)
    setThreads((current) => current.map((thread) => thread.id === id ? { ...thread, unread: 0 } : thread))
  }

  return (
    <main className="flex flex-1 flex-col bg-muted/20">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Admin inbox</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Messages</h1>
            <p className="mt-2 text-muted-foreground">See staff and customer replies, then step in when a conversation needs you.</p>
          </div>
          <Badge variant="secondary"><BellIcon /> {threads.reduce((total, thread) => total + thread.unread, 0)} unread</Badge>
        </header>

        <div className="grid min-h-[640px] gap-6 lg:h-[calc(100vh-14rem)] lg:grid-cols-[300px_1fr]">
          <Card className="flex min-h-0 flex-col overflow-hidden bg-background">
            <CardHeader>
              <CardTitle className="text-base">All conversations</CardTitle>
              <div className="relative mt-2">
                <SearchIcon className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search staff or customers" className="pl-9" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
                {([
                  ["all", "All"],
                  ["customer", "Customers"],
                  ["staff", "Staff"],
                ] as const).map(([value, label]) => (
                  <button key={value} type="button" onClick={() => setChannel(value)} className={`rounded-md px-2 py-1.5 text-xs font-medium ${channel === value ? "bg-background shadow-sm" : "text-muted-foreground"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="grid min-h-0 flex-1 content-start gap-2 overflow-y-auto">
              {visibleThreads.map((thread) => (
                <button key={thread.id} type="button" onClick={() => selectThread(thread.id)} className={`flex items-start gap-3 rounded-lg p-3 text-left transition-colors ${activeId === thread.id ? "bg-primary/10" : "hover:bg-muted"}`}>
                  <Avatar className="size-9"><AvatarFallback>{thread.initials}</AvatarFallback></Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium">{thread.name}</span>
                      {thread.unread > 0 && <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">{thread.unread}</span>}
                    </span>
                    <span className="mt-1 block truncate text-xs text-muted-foreground">{thread.topic}</span>
                    <span className="mt-1 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                      <span className="truncate">{thread.detail}</span>
                      <Badge variant="outline" className="h-5 px-1.5 text-[10px]">{thread.channel === "staff" ? "Staff" : "Customer"}</Badge>
                    </span>
                  </span>
                </button>
              ))}
              {visibleThreads.length === 0 && <p className="px-2 py-6 text-center text-sm text-muted-foreground">No conversations found.</p>}
            </CardContent>
          </Card>

          <Card className="flex min-h-0 flex-col overflow-hidden bg-background">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar><AvatarFallback>{activeThread.initials}</AvatarFallback></Avatar>
                <div className="min-w-0">
                  <CardTitle className="truncate text-base">{activeThread.name}</CardTitle>
                  <p className="truncate text-xs text-muted-foreground">{activeThread.topic} · {activeThread.detail}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" aria-label="More conversation actions"><MoreHorizontalIcon /></Button>
            </CardHeader>

            <CardContent className="flex min-h-0 flex-1 flex-col p-0">
              <div className="flex items-center gap-2 border-b bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                <CheckCircle2Icon className="size-4 text-emerald-600" />
                {activeThread.channel === "staff" ? "Staff conversation" : "Customer conversation"}: {activeThread.topic}
              </div>

              <div ref={conversationRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
                {activeThread.messages.map((message) => (
                  <Message key={message.id} align={message.sender === "admin" ? "end" : "start"}>
                    <MessageAvatar className={message.sender === "admin" ? "order-2 bg-primary" : message.sender === "staff" ? "bg-amber-500/15 text-amber-700" : "bg-muted text-foreground"}>
                      {message.sender === "admin" ? <ShieldCheckIcon className="size-4" /> : <UserRoundIcon className="size-4" />}
                    </MessageAvatar>
                    <MessageContent>
                      <MessageHeader>{message.sender === "admin" ? "You · Admin" : `${message.name} · ${senderLabel(message.sender)}`}</MessageHeader>
                      <Bubble className={message.sender === "admin" ? "bg-primary text-primary-foreground" : message.sender === "staff" ? "border border-amber-500/20 bg-amber-500/10" : ""}>
                        <BubbleContent>
                          {message.text}
                          <MessageAttachments attachments={message.attachments} inverted={message.sender === "admin"} />
                        </BubbleContent>
                      </Bubble>
                      <MessageFooter>{message.time}</MessageFooter>
                    </MessageContent>
                  </Message>
                ))}
              </div>

              <MessageComposer
                placeholder={`Reply to ${activeThread.name}...`}
                hint="Attach files, upload photos, or add emoji before sending."
                onSend={({ text, attachments }) => {
                  setThreads((current) => current.map((thread) => thread.id === activeId
                    ? { ...thread, messages: [...thread.messages, { id: Date.now(), sender: "admin", name: "You · Admin", text, time: "Just now", attachments }] }
                    : thread))
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
