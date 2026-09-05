"use client"

import { useState } from "react"
import { MoreHorizontalIcon, SearchIcon, ShieldCheckIcon, UserRoundIcon } from "lucide-react"

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

export default function CustomerMessagesPage() {
  const { profile, contacts, messages, activeId, activeContact, loading, sending, selectContact, send } = useMessaging()
  const [search, setSearch] = useState("")
  const visibleContacts = contacts.filter((contact) => `${contact.name} ${contact.role} ${contact.email}`.toLowerCase().includes(search.toLowerCase()))
  const conversationRef = useChatScroll(`${activeId}-${messages.length}`)

  return (
    <main className="flex flex-1 flex-col bg-muted/20">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 p-4 md:p-6 lg:p-8">
        <header>
          <p className="text-sm font-medium text-primary">Customer support</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Messages</h1>
          <p className="mt-2 text-muted-foreground">Chat with the staff or admin team about your reservation.</p>
        </header>

        <div className="grid min-h-[620px] gap-6 lg:h-[calc(100vh-14rem)] lg:grid-cols-[280px_1fr]">
          <Card className="flex min-h-0 flex-col overflow-hidden bg-background">
            <CardHeader>
              <CardTitle className="text-base">Conversations</CardTitle>
              <div className="relative mt-2">
                <SearchIcon className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search conversations" className="pl-9" />
              </div>
            </CardHeader>
            <CardContent className="grid min-h-0 flex-1 content-start gap-2 overflow-y-auto">
              {visibleContacts.map((contact) => (
                <button key={contact.id} type="button" onClick={() => selectContact(contact.id)} className={`flex items-center gap-3 rounded-lg p-3 text-left transition-colors ${activeId === contact.id ? "bg-primary/10" : "hover:bg-muted"}`}>
                  <Avatar className="size-9"><AvatarFallback>{contact.initials}</AvatarFallback></Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium">{contact.name}</span>
                      {contact.unread > 0 && <Badge variant="secondary">{contact.unread}</Badge>}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">{contact.lastMessage || `${roleLabel(contact.role)} team`}</span>
                  </span>
                </button>
              ))}
              {!loading && visibleContacts.length === 0 && <p className="px-2 py-6 text-center text-sm text-muted-foreground">No staff or admin conversations found.</p>}
            </CardContent>
          </Card>

          <Card className="flex min-h-0 flex-col overflow-hidden bg-background">
            {activeContact ? (
              <>
                <CardHeader className="flex flex-row items-center justify-between border-b">
                  <div className="flex items-center gap-3">
                    <Avatar><AvatarFallback>{activeContact.initials}</AvatarFallback></Avatar>
                    <div>
                      <CardTitle className="text-base">{activeContact.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{roleLabel(activeContact.role)} · {activeContact.role === "staff" ? "Reservation support" : "Account and billing"}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" aria-label="More conversation actions"><MoreHorizontalIcon /></Button>
                </CardHeader>

                <CardContent className="flex min-h-0 flex-1 flex-col p-0">
                  <div ref={conversationRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
                    {messages.map((message) => {
                      const mine = message.senderId === profile?.id
                      return (
                        <Message key={message.id} align={mine ? "end" : "start"}>
                          <MessageAvatar className={mine ? "order-2 bg-muted text-foreground" : ""}>
                            {mine ? <UserRoundIcon className="size-4" /> : <ShieldCheckIcon className="size-4" />}
                          </MessageAvatar>
                          <MessageContent>
                            <MessageHeader>{mine ? "You" : activeContact.name}</MessageHeader>
                            <Bubble className={mine ? "bg-primary text-primary-foreground" : ""}>
                              <BubbleContent>{message.message}</BubbleContent>
                            </Bubble>
                            <MessageFooter>{formatMessageTime(message.createdAt)}</MessageFooter>
                          </MessageContent>
                        </Message>
                      )
                    })}
                    {!loading && messages.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No messages yet. Send a note to start this conversation.</p>}
                  </div>

                  <MessageComposer
                    placeholder={`Message ${activeContact.name}...`}
                    hint="Attach files, upload photos, or add emoji before sending."
                    disabled={sending}
                    onSend={send}
                  />
                </CardContent>
              </>
            ) : (
              <CardContent className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted-foreground">
                {loading ? "Loading conversations..." : "No staff or admin accounts are available to message yet."}
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </main>
  )
}
