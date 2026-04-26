"use client"

import { EraType } from "@/lib/types"

interface Props {
  eraLabel: string
  eraType: EraType
  day: number
  totalDays: number
}

const ERA_STYLES: Record<EraType, string> = {
  bull: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700",
  bear: "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700",
  flat: "bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700",
}

const ERA_ICON: Record<EraType, string> = {
  bull: "📈",
  bear: "📉",
  flat: "↔️",
}

export default function TimelineBadge({ eraLabel, eraType, day, totalDays }: Props) {
  const progress = totalDays > 0 ? Math.min(100, (day / totalDays) * 100) : 0

  return (
    <div className="flex items-center gap-3">
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${ERA_STYLES[eraType]}`}
      >
        {ERA_ICON[eraType]} {eraLabel}
      </span>
      {totalDays > 0 && (
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-24 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{day}/{totalDays}</span>
        </div>
      )}
    </div>
  )
}
