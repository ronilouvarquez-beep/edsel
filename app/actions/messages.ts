"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export type MessageRole = "admin" | "staff" | "customer"

export type MessagingProfile = {
  id: string
  name: string
  initials: string
  role: MessageRole
  email: string
}

export type MessageContact = MessagingProfile & {
  lastMessage: string
  lastMessageAt: string | null
  unread: number
}

export type MessageReaction = {
  userId: string
  emoji: string
}

export type ConversationMessage = {
  id: string
  senderId: string
  receiverId: string
  message: string
  isRead: boolean
  createdAt: string
  reactions: MessageReaction[]
}

type UserRow = {
  id: string
  first_name: string | null
  middle_name: string | null
  last_name: string | null
  email: string | null
  role: string | null
}

type MessageRow = {
  id: string
  sender_id: string
  receiver_id: string
  message: string
  is_read: boolean
  created_at: string
  message_reactions: unknown
}

const USER_COLUMNS = "id, first_name, middle_name, last_name, email, role"
const MESSAGE_COLUMNS = "id, sender_id, receiver_id, message, is_read, created_at, message_reactions"
const ALLOWED_REACTIONS = new Set(["👍", "❤️", "😂", "🎉", "🙏"])

const CAN_MESSAGE: Record<MessageRole, MessageRole[]> = {
  customer: ["staff", "admin"],
  staff: ["customer", "admin"],
  admin: ["customer", "staff"],
}

function isRole(value: string | null | undefined): value is MessageRole {
  return value === "admin" || value === "staff" || value === "customer"
}

function displayName(row: UserRow) {
  const name = [row.first_name, row.middle_name, row.last_name].filter(Boolean).join(" ").replace(/\s+/g, " ").trim()
  return name || row.email || "Unknown user"
}

function initials(row: UserRow) {
  const first = row.first_name?.trim().charAt(0)
  const last = row.last_name?.trim().charAt(0)
  const fallback = row.email?.trim().charAt(0) ?? "?"
  return `${first || fallback}${last || ""}`.toUpperCase()
}

function toProfile(row: UserRow): MessagingProfile | null {
  if (!isRole(row.role)) return null
  return {
    id: row.id,
    name: displayName(row),
    initials: initials(row),
    role: row.role,
    email: row.email ?? "",
  }
}

function toMessage(row: MessageRow): ConversationMessage {
  const reactions = Array.isArray(row.message_reactions) ? row.message_reactions : []
  return {
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    message: row.message,
    isRead: row.is_read,
    createdAt: row.created_at,
    reactions: reactions.filter((reaction): reaction is MessageReaction => {
      if (!reaction || typeof reaction !== "object") return false
      const item = reaction as Record<string, unknown>
      return typeof item.userId === "string" && typeof item.emoji === "string" && ALLOWED_REACTIONS.has(item.emoji)
    }),
  }
}

function otherPartyId(row: MessageRow, userId: string) {
  return row.sender_id === userId ? row.receiver_id : row.sender_id
}

async function loadProfile(userId: string) {
  const { data, error } = await createAdminClient()
    .from("users")
    .select(USER_COLUMNS)
    .eq("id", userId)
    .maybeSingle()

  if (error) return { profile: null, error: error.message }
  if (!data) return { profile: null, error: "Your account was not found." }

  const profile = toProfile(data as UserRow)
  if (!profile) return { profile: null, error: "Your account role cannot send messages." }
  return { profile, error: null }
}

export async function getMessagingProfile(userId: string) {
  const { profile, error } = await loadProfile(userId)
  return { data: profile, error }
}

export async function listMessageContacts(userId: string) {
  const { profile, error: profileError } = await loadProfile(userId)
  if (!profile) return { data: [] as MessageContact[], error: profileError }

  const allowedRoles = CAN_MESSAGE[profile.role]
  const admin = createAdminClient()

  const [{ data: users, error: usersError }, { data: messages, error: messagesError }] = await Promise.all([
    admin.from("users").select(USER_COLUMNS).in("role", allowedRoles).neq("id", userId),
    admin.from("messages").select(MESSAGE_COLUMNS).or(`sender_id.eq.${userId},receiver_id.eq.${userId}`).order("created_at", { ascending: false }),
  ])

  if (usersError) return { data: [] as MessageContact[], error: usersError.message }
  if (messagesError) return { data: [] as MessageContact[], error: messagesError.message }

  const conversationMessages = (messages ?? []) as MessageRow[]

  const contacts = ((users ?? []) as UserRow[])
    .map((row) => toProfile(row))
    .filter((item): item is MessagingProfile => Boolean(item))
    .map((item) => {
      const thread = conversationMessages.filter((row) => otherPartyId(row, userId) === item.id)
      const latest = thread[0]
      return {
        ...item,
        lastMessage: latest?.message ?? "",
        lastMessageAt: latest?.created_at ?? null,
        unread: thread.filter((row) => row.receiver_id === userId && !row.is_read).length,
      } satisfies MessageContact
    })
    .sort((a, b) => {
      if (a.unread !== b.unread) return b.unread - a.unread
      return (b.lastMessageAt ?? "").localeCompare(a.lastMessageAt ?? "") || a.name.localeCompare(b.name)
    })

  return { data: contacts, error: null }
}

export async function listConversation(userId: string, otherUserId: string) {
  if (!userId || !otherUserId || userId === otherUserId) {
    return { data: [] as ConversationMessage[], error: "Choose someone to message." }
  }

  const { error: profileError } = await loadProfile(userId)
  if (profileError) return { data: [] as ConversationMessage[], error: profileError }

  const { data, error } = await createAdminClient()
    .from("messages")
    .select(MESSAGE_COLUMNS)
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
    .order("created_at", { ascending: true })

  if (error) return { data: [] as ConversationMessage[], error: error.message }
  return { data: ((data ?? []) as MessageRow[]).map(toMessage), error: null }
}

export async function markConversationRead(userId: string, otherUserId: string) {
  if (!userId || !otherUserId || userId === otherUserId) {
    return { error: "Choose a conversation to mark as read." }
  }

  const { error } = await createAdminClient()
    .from("messages")
    .update({ is_read: true })
    .eq("receiver_id", userId)
    .eq("sender_id", otherUserId)
    .eq("is_read", false)

  return { error: error?.message ?? null }
}

export async function sendMessage(senderId: string, receiverId: string, message: string) {
  const text = message.trim()
  if (!text) return { data: null, error: "Message cannot be empty." }
  if (!senderId || !receiverId) return { data: null, error: "Choose someone to message." }
  if (senderId === receiverId) return { data: null, error: "You cannot message yourself." }

  const [sender, receiver] = await Promise.all([loadProfile(senderId), loadProfile(receiverId)])
  if (!sender.profile) return { data: null, error: sender.error ?? "Your account was not found." }
  if (!receiver.profile) return { data: null, error: receiver.error ?? "That recipient was not found." }

  if (!CAN_MESSAGE[sender.profile.role].includes(receiver.profile.role)) {
    return { data: null, error: "You cannot message this account." }
  }

  const { data, error } = await createAdminClient()
    .from("messages")
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      message: text,
    })
    .select(MESSAGE_COLUMNS)
    .single()

  if (error || !data) {
    return { data: null, error: error?.message ?? "Failed to send the message." }
  }

  return { data: toMessage(data as MessageRow), error: null }
}

export async function toggleMessageReaction(userId: string, messageId: string, emoji: string) {
  if (!userId || !messageId || !ALLOWED_REACTIONS.has(emoji)) {
    return { data: null, error: "That reaction is not available." }
  }

  const { profile, error: profileError } = await loadProfile(userId)
  if (!profile) return { data: null, error: profileError ?? "Your account was not found." }

  const admin = createAdminClient()
  const { data: existing, error: messageError } = await admin
    .from("messages")
    .select(MESSAGE_COLUMNS)
    .eq("id", messageId)
    .maybeSingle()

  if (messageError) return { data: null, error: messageError.message }
  if (!existing) return { data: null, error: "That message was not found." }

  const message = existing as MessageRow
  if (message.sender_id !== userId && message.receiver_id !== userId) {
    return { data: null, error: "You cannot react to this message." }
  }

  const reactions = Array.isArray(message.message_reactions) ? message.message_reactions.filter((reaction): reaction is MessageReaction => {
    if (!reaction || typeof reaction !== "object") return false
    const item = reaction as Record<string, unknown>
    return typeof item.userId === "string" && typeof item.emoji === "string" && ALLOWED_REACTIONS.has(item.emoji)
  }) : []
  const reactionIndex = reactions.findIndex((reaction) => reaction.userId === userId && reaction.emoji === emoji)
  const nextReactions = reactionIndex >= 0
    ? reactions.filter((_, index) => index !== reactionIndex)
    : [...reactions, { userId, emoji }]

  const { data, error } = await admin
    .from("messages")
    .update({ message_reactions: nextReactions })
    .eq("id", messageId)
    .select(MESSAGE_COLUMNS)
    .single()

  if (error || !data) return { data: null, error: error?.message ?? "Failed to update the reaction." }
  return { data: toMessage(data as MessageRow), error: null }
}
