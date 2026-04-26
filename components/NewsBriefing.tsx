"use client"

import { Sentiment } from "@/lib/types"
import { formatDateLabel } from "@/lib/utils"

interface Props {
  briefing: string
  sentiment: Sentiment
  simDate: Date
  visible: boolean
}

const SENTIMENT_STYLES: Record<Sentiment, { badge: string; dot: string }> = {
  fear: {
    badge: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700",
    dot: "bg-red-500",
  },
  neutral: {
    badge: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600",
    dot: "bg-gray-400",
  },
  greed: {
    badge: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700",
    dot: "bg-emerald-500",
  },
}

const SENTIMENT_LABELS: Record<Sentiment, string> = {
  fear: "FEAR",
  neutral: "NEUTRAL",
  greed: "GREED",
}

function parseBriefingLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("·") || (l.startsWith("-") && l.length > 3))
    .map((l) => l.replace(/^[·\-]\s*/, ""))
}

export default function NewsBriefing({ briefing, sentiment, simDate, visible }: Props) {
  if (!visible || !briefing) return null

  const styles = SENTIMENT_STYLES[sentiment]
  const lines = parseBriefingLines(briefing)
  const dateLabel = formatDateLabel(simDate)

  return (
    <div
      className="rounded-xl border-l-4 border-l-amber-400 border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/20 p-4 animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full animate-pulse ${styles.dot}`} />
          <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
            Briefing económico — {dateLabel}
          </h3>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${styles.badge}`}>
          {SENTIMENT_LABELS[sentiment]}
        </span>
      </div>

      {lines.length > 0 ? (
        <ul className="space-y-1.5">
          {lines.map((line, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-amber-900 dark:text-amber-200 animate-in fade-in duration-300"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className="text-amber-400 mt-0.5 flex-shrink-0">·</span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-amber-800 dark:text-amber-300 whitespace-pre-wrap leading-relaxed">
          {briefing}
        </p>
      )}
    </div>
  )
}
