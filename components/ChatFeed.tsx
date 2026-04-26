"use client"

import { useEffect, useRef } from "react"
import { ChatMessage } from "@/lib/types"
import MessageBubble from "./MessageBubble"

interface Props {
  messages: ChatMessage[]
  autoRun?: boolean
  isRunning?: boolean
  onPause?: () => void
  onResume?: () => void
}

export default function ChatFeed({ messages, autoRun, isRunning, onPause, onResume }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header */}
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700">
        {/* Agente 1 */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-r border-gray-200 dark:border-gray-700 flex-1">
          <div className={`w-2 h-2 rounded-full ${isRunning ? "bg-blue-500 animate-pulse" : "bg-blue-500"}`} />
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
            ◆ Agente 1 — Trader
          </span>
        </div>

        {/* Botón pausa/continuar — solo si hay simulación activa */}
        {(onPause || onResume) && (
          <div className="px-3 flex-shrink-0">
            {isRunning ? (
              <button
                disabled
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 text-xs font-medium cursor-not-allowed"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-pulse" />
                Simulando...
              </button>
            ) : autoRun ? (
              <button
                onClick={onPause}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-semibold hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors"
              >
                ⏸ Pausar
              </button>
            ) : (
              <button
                onClick={onResume}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-semibold hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
              >
                ▶ Continuar
              </button>
            )}
          </div>
        )}

        {/* Agente 2 */}
        <div className="flex items-center justify-end gap-2 px-4 py-2.5 border-l border-gray-200 dark:border-gray-700 flex-1">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            Agente 2 — Oráculo ◆
          </span>
          <div className={`w-2 h-2 rounded-full ${isRunning ? "bg-emerald-500 animate-pulse" : "bg-emerald-500"}`} />
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
