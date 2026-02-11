"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Heart,
  X,
  Send,
  Loader2,
  MessageCircle,
} from "lucide-react"

interface FloatingAromiProps {
  profile?: {
    full_name?: string
    fitness_goal?: string
    activity_level?: string
    dietary_preference?: string
  } | null
}

function getMessageText(parts: { type: string; text?: string }[]): string {
  if (!parts || !Array.isArray(parts)) return ""
  return parts
    .filter(
      (p): p is { type: "text"; text: string } => p.type === "text"
    )
    .map((p) => p.text)
    .join("")
}

export function FloatingAromi({ profile }: FloatingAromiProps) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ id, messages: msgs }) => ({
        body: {
          messages: msgs,
          id,
          context: { profile },
        },
      }),
    }),
  })

  const isLoading = status === "streaming" || status === "submitted"

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput("")
  }

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg transition-transform hover:scale-105 active:scale-95"
          aria-label="Open AROMI assistant"
        >
          <MessageCircle className="h-6 w-6 text-primary-foreground" />
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[28rem] w-80 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20">
                <Heart className="h-4 w-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-primary-foreground">AROMI</p>
                <p className="text-xs text-primary-foreground/70">AI Health Coach</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-primary-foreground/70 hover:text-primary-foreground"
              aria-label="Close assistant"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-3" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  {"Hi! I'm AROMI"}
                </p>
                <p className="mt-1 text-center text-xs text-muted-foreground">
                  Ask me about fitness, workouts, nutrition & wellness
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((message) => {
                  const text = getMessageText(
                    message.parts as { type: string; text?: string }[]
                  )
                  const isUser = message.role === "user"

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${isUser ? "flex-row-reverse" : ""}`}
                    >
                      {!isUser && (
                        <Avatar className="h-6 w-6 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-xs text-primary">
                            <Heart className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-xs leading-relaxed ${
                          isUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{text}</p>
                      </div>
                    </div>
                  )
                })}

                {isLoading &&
                  messages[messages.length - 1]?.role === "user" && (
                    <div className="flex gap-2">
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">
                          <Heart className="h-3 w-3" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="rounded-lg bg-muted px-3 py-2">
                        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  )}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="border-t border-border p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AROMI..."
                disabled={isLoading}
                className="h-9 flex-1 text-xs"
              />
              <Button
                type="submit"
                size="icon"
                className="h-9 w-9"
                disabled={!input.trim() || isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
