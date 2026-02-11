"use client"

import { useState, useRef, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Send,
  Loader2,
  Heart,
  Sparkles,
  Dumbbell,
  Salad,
  Moon,
} from "lucide-react"

interface CoachViewProps {
  userId: string
  profile: {
    full_name?: string
    age?: number
    weight_kg?: number
    height_cm?: number
    fitness_goal?: string
    activity_level?: string
    dietary_preference?: string
  } | null
  assessment: {
    bmi?: number
    bmi_category?: string
    health_conditions?: string[]
    injuries?: string[]
    sleep_hours?: number
    stress_level?: string
  } | null
  chatSessions: { id: string; title: string }[]
}

const quickPrompts = [
  { icon: Dumbbell, text: "Suggest a workout for today" },
  { icon: Salad, text: "What should I eat for lunch?" },
  { icon: Moon, text: "How can I improve my sleep?" },
  { icon: Heart, text: "Tips to reduce stress" },
]

function getMessageText(parts: { type: string; text?: string }[]): string {
  if (!parts || !Array.isArray(parts)) return ""
  return parts
    .filter(
      (p): p is { type: "text"; text: string } => p.type === "text"
    )
    .map((p) => p.text)
    .join("")
}

export function CoachView({
  userId,
  profile,
  assessment,
}: CoachViewProps) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ id, messages: msgs }) => ({
        body: {
          messages: msgs,
          id,
          context: { profile, assessment },
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

  const handleSend = (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText || isLoading) return
    sendMessage({ text: messageText })
    setInput("")
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">
          AROMI - AI Health Coach
        </h2>
        <p className="text-sm text-muted-foreground">
          Your personal AI-powered fitness and wellness assistant
        </p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                Hello{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!
              </h3>
              <p className="mt-1 max-w-sm text-center text-sm text-muted-foreground">
                {"I'm AROMI, your AI health coach. Ask me about workouts, nutrition, sleep, or any wellness topic."}
              </p>

              {/* Quick prompts */}
              <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt.text}
                    onClick={() => handleSend(prompt.text)}
                    className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    <prompt.icon className="h-4 w-4 text-primary" />
                    {prompt.text}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((message) => {
                const text = getMessageText(message.parts as { type: string; text?: string }[])
                const isUser = message.role === "user"

                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback
                        className={
                          isUser
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-primary/10 text-primary"
                        }
                      >
                        {isUser ? (
                          (profile?.full_name?.[0] || "U").toUpperCase()
                        ) : (
                          <Heart className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
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
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Heart className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-xl bg-muted px-4 py-2.5">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <CardContent className="border-t border-border p-4">
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
              placeholder="Ask AROMI anything about fitness, nutrition, or wellness..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </form>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            AROMI provides general wellness guidance. Always consult a healthcare professional for medical advice.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
