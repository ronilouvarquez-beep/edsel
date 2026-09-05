"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import {
  getMessagingProfile,
  listConversation,
  listMessageContacts,
  markConversationRead,
  sendMessage,
  toggleMessageReaction,
  type ConversationMessage,
  type MessageContact,
  type MessageRole,
  type MessagingProfile,
} from "@/app/actions/messages"
import type { MessageAttachment } from "@/components/message-attachments"
import { createClient } from "@/lib/supabase/client"

export function formatMessageTime(value: string | null) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()
  if (sameDay) return date.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })
  return date.toLocaleDateString("en-PH", { month: "short", day: "numeric" })
}

export function roleLabel(role: MessageRole) {
  if (role === "admin") return "Admin"
  if (role === "staff") return "Staff"
  return "Customer"
}

export function useMessaging() {
  const [profile, setProfile] = useState<MessagingProfile | null>(null)
  const [contacts, setContacts] = useState<MessageContact[]>([])
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [activeId, setActiveId] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const activeContact = contacts.find((contact) => contact.id === activeId) ?? contacts[0] ?? null

  const refreshContacts = useCallback(async (userId: string) => {
    const { data, error } = await listMessageContacts(userId)
    if (error) toast.error("Failed to load conversations.", { description: error })
    setContacts(data)
    return data
  }, [])

  const refreshConversation = useCallback(async (userId: string, otherUserId: string) => {
    const { data, error } = await listConversation(userId, otherUserId)
    if (error) toast.error("Failed to load messages.", { description: error })
    setMessages(data)
    return data
  }, [])

  useEffect(() => {
    let cancelled = false

    createClient().auth.getUser().then(async ({ data }) => {
      const userId = data.user?.id
      if (!userId) {
        setLoading(false)
        toast.error("Sign in to send messages.")
        return
      }

      const { data: current, error } = await getMessagingProfile(userId)
      if (cancelled) return
      if (error || !current) {
        setLoading(false)
        toast.error("Failed to load your account.", { description: error ?? undefined })
        return
      }

      setProfile(current)
      const nextContacts = await refreshContacts(current.id)
      if (cancelled) return
      setActiveId((currentId) => currentId || nextContacts[0]?.id || "")
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [refreshContacts])

  useEffect(() => {
    if (!profile || !activeId) {
      return
    }

    let cancelled = false
    Promise.all([
      // Conversation loading is an external async synchronization.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      refreshConversation(profile.id, activeId),
      markConversationRead(profile.id, activeId),
    ]).then(() => {
      if (!cancelled) refreshContacts(profile.id)
    })

    return () => {
      cancelled = true
    }
  }, [profile, activeId, refreshContacts, refreshConversation])

  useEffect(() => {
    if (!profile) return

    const timer = window.setInterval(() => {
      refreshContacts(profile.id)
      if (activeId) refreshConversation(profile.id, activeId)
    }, 12000)

    return () => window.clearInterval(timer)
  }, [profile, activeId, refreshContacts, refreshConversation])

  function selectContact(id: string) {
    setActiveId(id)
  }

  async function send({ text, attachments }: { text: string; attachments: MessageAttachment[] }) {
    if (!profile || !activeId) {
      toast.error("Choose someone to message.")
      throw new Error("No recipient selected")
    }

    const names = attachments.map((item) => item.name)
    const message = [text.trim(), names.length ? `Attachments: ${names.join(", ")}` : ""].filter(Boolean).join("\n")
    setSending(true)
    const { data, error } = await sendMessage(profile.id, activeId, message)
    setSending(false)

    if (error || !data) {
      toast.error("Failed to send message.", { description: error ?? undefined })
      throw new Error(error ?? "Failed to send message")
    }

    setMessages((current) => current.some((item) => item.id === data.id) ? current : [...current, data])
    await refreshContacts(profile.id)
  }

  async function toggleReaction(messageId: string, emoji: string) {
    if (!profile) return
    const { data, error } = await toggleMessageReaction(profile.id, messageId, emoji)
    if (error || !data) {
      toast.error("Failed to update reaction.", { description: error ?? undefined })
      return
    }
    setMessages((current) => current.map((message) => message.id === data.id ? data : message))
  }

  return {
    profile,
    contacts,
    messages,
    activeId: activeContact?.id ?? "",
    activeContact,
    loading,
    sending,
    selectContact,
    send,
    toggleReaction,
  }
}
