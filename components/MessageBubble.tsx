"use client"

import { ChatMessage } from "@/lib/types"

interface Props {
  message: ChatMessage
}

const ROLE_STYLES = {
  trader: {
    bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
    avatar: "bg-blue-600",
    avatarText: "A1",
    name: "text-blue-700 dark:text-blue-400",
    align: "items-start",
  },
  oracle: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
    avatar: "bg-emerald-600",
    avatarText: "A2",
    name: "text-emerald-700 dark:text-emerald-400",
    align: "items-end",
  },
  news: {
    bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800",
    avatar: "bg-amber-500",
    avatarText: "ECO",
    name: "text-amber-700 dark:text-amber-400",
    align: "items-start",
  },
  system: {
    bg: "",
    avatar: "bg-gray-400",
    avatarText: "SYS",
    name: "text-gray-500",
    align: "items-center",
  },
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-0.5 h-4">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  )
}

export default function MessageBubble({ message }: Props) {
  const { role, name, text, type, isTyping } = message

  if (role === "system") {
    return (
      <div className="flex items-center justify-center my-2">
        <div className="px-4 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs text-gray-500 dark:text-gray-400 font-medium">
          {text}
        </div>
      </div>
    )
  }

  const styles = ROLE_STYLES[role]
  const isWin = type === "result-win"
  const isLoss = type === "result-loss"

  if (isWin || isLoss) {
    return (
      <div
        className={`flex items-start gap-2 px-3 py-3 rounded-xl border my-1 ${
          isWin
            ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700"
            : "bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-700"
        }`}
      >
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
            isWin ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {isWin ? "▲" : "▼"}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={`text-xs font-semibold mb-1 ${
              isWin ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"
            }`}
          >
            {isWin ? "✓ Resultado — Ganó" : "✗ Resultado — Perdió"}
          </p>
          <p className={`text-sm whitespace-pre-wrap leading-relaxed ${
            isWin ? "text-emerald-900 dark:text-emerald-200" : "text-red-900 dark:text-red-200"
          }`}>
            {isTyping && !text ? <TypingDots /> : text}
            {isTyping && text && <TypingDots />}
          </p>
        </div>
      </div>
    )
  }

  const isOracle = role === "oracle"

  return (
    <div className={`flex gap-2.5 my-1 ${isOracle ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${styles.avatar}`}
      >
        {styles.avatarText}
      </div>
      <div
        className={`max-w-[85%] rounded-xl border px-3 py-2.5 ${styles.bg}`}
      >
        <p className={`text-xs font-semibold mb-1 ${styles.name}`}>{name}</p>
        <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
          {isTyping && !text ? (
            <TypingDots />
          ) : (
            <>
              {text}
              {isTyping && <TypingDots />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
