"use client"

import { useState } from "react"
import { BellIcon, CheckCircle2Icon, MoreHorizontalIcon, SearchIcon, UserRoundIcon } from "lucide-react"

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

type CustomerId = "juan" | "liza" | "maria"
type StaffMessage = { id: number; sender: "customer" | "staff"; text: string; time: string; attachments?: MessageAttachment[] }
type CustomerThread = { id: CustomerId; name: string; initials: string; order: string; event: string; unread: number; messages: StaffMessage[] }

const initialThreads: CustomerThread[] = [
  {
    id: "juan",
    name: "Juan Dela Cruz",
    initials: "JD",
    order: "Birthday Dessert Table",
    event: "Sep 07 · 30 guests",
    unread: 2,
    messages: [
      { id: 1, sender: "customer", text: "Hi, can we add two more dessert trays to our birthday order?", time: "9:42 AM" },
      { id: 2, sender: "staff", text: "I will check availability with the kitchen team and get back to you shortly.", time: "9:48 AM" },
      { id: 3, sender: "customer", text: "Thank you. We would also like the colors to match a blue and gold theme.", time: "9:51 AM" },
    ],
  },
  {
    id: "liza",
    name: "Liza Tan",
    initials: "LT",
    order: "Corporate Snack Boxes",
    event: "Sep 14 · 55 guests",
    unread: 1,
    messages: [{ id: 4, sender: "customer", text: "Could you confirm the delivery window for the snack boxes?", time: "Yesterday" }],
  },
  {
    id: "maria",
    name: "Maria Santos",
    initials: "MS",
    order: "Chocolate Dedication Cake",
    event: "Sep 06 · 12 guests",
    unread: 0,
    messages: [
      { id: 5, sender: "staff", text: "Your chocolate dedication cake is confirmed for tomorrow.", time: "Monday" },
      { id: 6, sender: "customer", text: "Perfect, thank you for confirming!", time: "Monday" },
    ],
  },
]

export default function StaffMessagesPage() {
  const [threads, setThreads] = useState(initialThreads)
  const [activeId, setActiveId] = useState<CustomerId>("juan")
  const [search, setSearch] = useState("")
  const activeThread = threads.find((thread) => thread.id === activeId) ?? threads[0]
  const visibleThreads = threads.filter((thread) => `${thread.name} ${thread.order} ${thread.event}`.toLowerCase().includes(search.toLowerCase()))
  const conversationRef = useChatScroll(`${activeId}-${activeThread.messages.length}`)

  function selectThread(id: CustomerId) {
    setActiveId(id)
    setThreads((current) => current.map((thread) => thread.id === id ? { ...thread, unread: 0 } : thread))
  }

  return (
    <main className="flex flex-1 flex-col bg-muted/20">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Operations desk</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Customer messages</h1>
            <p className="mt-2 text-muted-foreground">Reply to customers and keep every reservation moving.</p>
          </div>
          <Badge variant="secondary"><BellIcon /> {threads.reduce((total, thread) => total + thread.unread, 0)} unread</Badge>
        </header>

        <div className="grid min-h-[640px] gap-6 lg:h-[calc(100vh-14rem)] lg:grid-cols-[300px_1fr]">
          <Card className="flex min-h-0 flex-col overflow-hidden bg-background">
            <CardHeader>
              <CardTitle className="text-base">All conversations</CardTitle>
              <div className="relative mt-2">
                <SearchIcon className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customers" className="pl-9" />
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
                    <span className="mt-1 block truncate text-xs text-muted-foreground">{thread.order}</span>
                    <span className="mt-1 block truncate text-[11px] text-muted-foreground">{thread.event}</span>
                  </span>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="flex min-h-0 flex-col overflow-hidden bg-background">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar><AvatarFallback>{activeThread.initials}</AvatarFallback></Avatar>
                <div className="min-w-0">
                  <CardTitle className="truncate text-base">{activeThread.name}</CardTitle>
                  <p className="truncate text-xs text-muted-foreground">{activeThread.order} · {activeThread.event}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" aria-label="More customer actions"><MoreHorizontalIcon /></Button>
            </CardHeader>

            <CardContent className="flex min-h-0 flex-1 flex-col p-0">
              <div className="flex items-center gap-2 border-b bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                <CheckCircle2Icon className="size-4 text-emerald-600" /> Reservation context: {activeThread.order}
              </div>

              <div ref={conversationRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
                {activeThread.messages.map((message) => (
                  <Message key={message.id} align={message.sender === "staff" ? "end" : "start"}>
                    <MessageAvatar className={message.sender === "staff" ? "order-2 bg-primary" : "bg-muted text-foreground"}>
                      <UserRoundIcon className="size-4" />
                    </MessageAvatar>
                    <MessageContent>
                      <MessageHeader>{message.sender === "staff" ? "You · Staff" : activeThread.name}</MessageHeader>
                      <Bubble className={message.sender === "staff" ? "bg-primary text-primary-foreground" : ""}>
                        <BubbleContent>
                          {message.text}
                          <MessageAttachments attachments={message.attachments} inverted={message.sender === "staff"} />
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
                    ? { ...thread, messages: [...thread.messages, { id: Date.now(), sender: "staff", text, time: "Just now", attachments }] }
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
