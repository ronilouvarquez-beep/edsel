"use client"

import { useState } from "react"
import { useChatScroll } from "@/hooks/use-chat-scroll"
import { MoreHorizontalIcon, SearchIcon, ShieldCheckIcon, UserRoundIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Message, MessageAvatar, MessageContent, MessageFooter, MessageHeader } from "@/components/ui/message"
import { MessageAttachments, type MessageAttachment } from "@/components/message-attachments"
import { MessageComposer } from "@/components/message-composer"

type Contact = "Staff" | "Admin"
type ChatMessage = { id: number; sender: "customer" | "team"; text: string; time: string; attachments?: MessageAttachment[] }

const initialMessages: Record<Contact, ChatMessage[]> = {
  Staff: [
    { id: 1, sender: "team", text: "Hi! How can we help with your celebration plans?", time: "10:24 AM" },
    { id: 2, sender: "customer", text: "Can you confirm if the wedding venue styling is available for September 7?", time: "10:26 AM" },
    { id: 3, sender: "team", text: "Yes, it is available. We are checking the final setup details with our coordinator.", time: "10:30 AM" },
  ],
  Admin: [
    { id: 4, sender: "team", text: "Hello! This is the Edsel's Cake Shop admin team. How can we assist?", time: "Yesterday" },
  ],
}

export default function CustomerMessagesPage() {
  const [activeContact, setActiveContact] = useState<Contact>("Staff")
  const [messages, setMessages] = useState(initialMessages)
  const [search, setSearch] = useState("")
  const activeMessages = messages[activeContact]
  const contacts = (["Staff", "Admin"] as Contact[]).filter((contact) => contact.toLowerCase().includes(search.toLowerCase()))
  const conversationRef = useChatScroll(`${activeContact}-${activeMessages.length}`)

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
              {contacts.map((contact) => (
                <button key={contact} type="button" onClick={() => setActiveContact(contact)} className={`flex items-center gap-3 rounded-lg p-3 text-left transition-colors ${activeContact === contact ? "bg-primary/10" : "hover:bg-muted"}`}>
                  <Avatar className="size-9"><AvatarFallback>{contact === "Staff" ? "ST" : "AD"}</AvatarFallback></Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{contact} team</span>
                    <span className="block truncate text-xs text-muted-foreground">{contact === "Staff" ? "Reservation support" : "Account and billing"}</span>
                  </span>
                  {contact === "Staff" && <Badge variant="secondary">New</Badge>}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card className="flex min-h-0 flex-col overflow-hidden bg-background">
            <CardHeader className="flex flex-row items-center justify-between border-b">
              <div className="flex items-center gap-3">
                <Avatar><AvatarFallback>{activeContact === "Staff" ? "ST" : "AD"}</AvatarFallback></Avatar>
                <div>
                  <CardTitle className="text-base">{activeContact} team</CardTitle>
                  <p className="text-xs text-muted-foreground">{activeContact === "Staff" ? "Usually replies within a few minutes" : "Account and reservation support"}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" aria-label="More conversation actions"><MoreHorizontalIcon /></Button>
            </CardHeader>

            <CardContent className="flex min-h-0 flex-1 flex-col p-0">
              <div ref={conversationRef} className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
                {activeMessages.map((message) => (
                  <Message key={message.id} align={message.sender === "customer" ? "end" : "start"}>
                    <MessageAvatar className={message.sender === "customer" ? "order-2 bg-muted text-foreground" : ""}>
                      {message.sender === "customer" ? <UserRoundIcon className="size-4" /> : <ShieldCheckIcon className="size-4" />}
                    </MessageAvatar>
                    <MessageContent>
                      <MessageHeader>{message.sender === "customer" ? "You" : `${activeContact} team`}</MessageHeader>
                      <Bubble className={message.sender === "customer" ? "bg-primary text-primary-foreground" : ""}>
                        <BubbleContent>
                          {message.text}
                          <MessageAttachments attachments={message.attachments} inverted={message.sender === "customer"} />
                        </BubbleContent>
                      </Bubble>
                      <MessageFooter>{message.time}</MessageFooter>
                    </MessageContent>
                  </Message>
                ))}
              </div>

              <MessageComposer
                placeholder={`Message the ${activeContact.toLowerCase()} team...`}
                hint="Attach files, upload photos, or add emoji before sending."
                onSend={({ text, attachments }) => {
                  setMessages((current) => ({
                    ...current,
                    [activeContact]: [...current[activeContact], { id: Date.now(), sender: "customer", text, time: "Just now", attachments }],
                  }))
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
