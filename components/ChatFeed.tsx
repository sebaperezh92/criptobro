"use client"

import { useEffect, useRef } from "react"
import { ChatMessage } from "@/lib/types"
import MessageBubble from "./MessageBubble"

interface Props {
  messages: ChatMessage[]
}

export default function ChatFeed({ messages }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 px-4 py-2.5 border-r border-gray-200 dark:border-gray-700">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
            ◆ Agente 1 — Trader
          </span>
        </div>
        <div className="flex items-center justify-end gap-2 px-4 py-2.5">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            Agente 2 — Oráculo ◆
          </span>
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
      </div>

      {/* Messages */}
      <div className="h-[420px] overflow-y-auto p-4 space-y-1">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400 dark:text-gray-600 text-center">
              El Trader y el Oráculo conversarán aquí.<br />
              <span className="text-xs">Inicia el desafío para comenzar.</span>
            </p>
          </div>
        ) : (
          messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
