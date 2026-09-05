"use client"

import { useMemo, useState } from "react"
import { BellIcon, CheckCircle2Icon, MoreHorizontalIcon, SearchIcon, ShieldCheckIcon, UserRoundIcon } from "lucide-react"

import { formatMessageTime, roleLabel, useMessaging } from "@/hooks/use-messaging"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageHeader } from "@/components/ui/message"
import { MessageComposer } from "@/components/message-composer"
import { useChatScroll } from "@/hooks/use-chat-scroll"
import type { MessageRole } from "@/app/actions/messages"

type Channel = "all" | "customer" | "staff"

export default function AdminMessagesPage() {
  const { profile, contacts, messages, activeId, activeContact, loading, sending, selectContact, send } = useMessaging()
  const [search, setSearch] = useState("")
  const [channel, setChannel] = useState<Channel>("all")
  const visibleContacts = useMemo(() => contacts.filter((contact) => {
    const matchesSearch = `${contact.name} ${contact.email} ${contact.lastMessage}`.toLowerCase().includes(search.toLowerCase())
    const matchesChannel = channel === "all" || contact.role === channel
    return matchesSearch && matchesChannel
  }), [contacts, search, channel])
  const unread = contacts.reduce((total, contact) => total + contact.unread, 0)
  const conversationRef = useChatScroll(`${activeId}-${messages.length}`)

  function senderName(mine: boolean, role: MessageRole) {
    if (mine) return "You · Admin"
    return `${activeContact?.name ?? "Unknown"} · ${roleLabel(role)}`
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
          <Badge variant="secondary"><BellIcon /> {unread} unread</Badge>
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
              {visibleContacts.map((contact) => (
                <button key={contact.id} type="button" onClick={() => selectContact(contact.id)} className={`flex items-start gap-3 rounded-lg p-3 text-left transition-colors ${activeId === contact.id ? "bg-primary/10" : "hover:bg-muted"}`}>
                  <Avatar className="size-9"><AvatarFallback>{contact.initials}</AvatarFallback></Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium">{contact.name}</span>
                      {contact.unread > 0 && <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">{contact.unread}</span>}
                    </span>
                    <span className="mt-1 block truncate text-xs text-muted-foreground">{contact.lastMessage || "No messages yet"}</span>
                    <span className="mt-1 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
                      <span className="truncate">{formatMessageTime(contact.lastMessageAt) || contact.email}</span>
                      <Badge variant="outline" className="h-5 px-1.5 text-[10px]">{roleLabel(contact.role)}</Badge>
                    </span>
                  </span>
                </button>
              ))}
              {!loading && visibleContacts.length === 0 && <p className="px-2 py-6 text-center text-sm text-muted-foreground">No conversations found.</p>}
            </CardContent>
          </Card>

          <Card className="flex min-h-0 flex-col overflow-hidden bg-background">
            {activeContact ? (
              <>
                <CardHeader className="flex flex-row items-center justify-between border-b">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar><AvatarFallback>{activeContact.initials}</AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <CardTitle className="truncate text-base">{activeContact.name}</CardTitle>
                      <p className="truncate text-xs text-muted-foreground">{roleLabel(activeContact.role)} · {activeContact.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" aria-label="More conversation actions"><MoreHorizontalIcon /></Button>
                </CardHeader>

                <CardContent className="flex min-h-0 flex-1 flex-col p-0">
                  <div className="flex items-center gap-2 border-b bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
                    <CheckCircle2Icon className="size-4 text-emerald-600" />
                    {activeContact.role === "staff" ? "Staff conversation" : "Customer conversation"}: {activeContact.name}
                  </div>

                  <div ref={conversationRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
                    {messages.map((message) => {
                      const mine = message.senderId === profile?.id
                      return (
                        <Message key={message.id} align={mine ? "end" : "start"}>
                          <MessageAvatar className={mine ? "order-2 bg-primary" : activeContact.role === "staff" ? "bg-amber-500/15 text-amber-700" : "bg-muted text-foreground"}>
                            {mine ? <ShieldCheckIcon className="size-4" /> : <UserRoundIcon className="size-4" />}
                          </MessageAvatar>
                          <MessageContent>
                            <MessageHeader>{senderName(mine, activeContact.role)}</MessageHeader>
                            <Bubble className={mine ? "bg-primary text-primary-foreground" : activeContact.role === "staff" ? "border border-amber-500/20 bg-amber-500/10" : ""}>
                              <BubbleContent>{message.message}</BubbleContent>
                            </Bubble>
                            <MessageFooter>{formatMessageTime(message.createdAt)}</MessageFooter>
                          </MessageContent>
                        </Message>
                      )
                    })}
                    {!loading && messages.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No messages yet. Send a reply to start this conversation.</p>}
                  </div>

                  <MessageComposer
                    placeholder={`Reply to ${activeContact.name}...`}
                    hint="Attach files, upload photos, or add emoji before sending."
                    disabled={sending}
                    onSend={send}
                  />
                </CardContent>
              </>
            ) : (
              <CardContent className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
                {loading ? "Loading conversations..." : "No staff or customer accounts are available to message yet."}
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </main>
  )
}
