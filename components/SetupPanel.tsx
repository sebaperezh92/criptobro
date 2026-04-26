"use client"

import { SimConfig } from "@/lib/types"
import { getEra } from "@/lib/market-eras"
import { addDays, formatDateLabel, toISO } from "@/lib/utils"

interface Props {
  config: SimConfig
  setConfig: (partial: Partial<SimConfig>) => void
  disabled: boolean
}

const DURATIONS = [
  { days: 7, label: "7 días" },
  { days: 14, label: "14 días" },
  { days: 30, label: "1 mes" },
  { days: 90, label: "3 meses" },
  { days: 180, label: "6 meses" },
  { days: 365, label: "1 año" },
]

const ERA_COLORS: Record<string, string> = {
  bull: "text-emerald-700 dark:text-emerald-400",
  bear: "text-red-700 dark:text-red-400",
  flat: "text-amber-700 dark:text-amber-400",
}

export default function SetupPanel({ config, setConfig, disabled }: Props) {
  const startISO = toISO(config.startDate)
  const endDate = addDays(config.startDate, config.duration - 1)
  const endISO = toISO(endDate)
  const era = getEra(startISO)
  const eraColor = ERA_COLORS[era.type]

  const progressPct = 0
  const todayISO = toISO(addDays(new Date(), -1))

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const d = new Date(e.target.value + "T12:00:00")
    if (!isNaN(d.getTime())) setConfig({ startDate: d })
  }

  return (
    <div
      className={`rounded-xl border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 p-5 space-y-5 transition-opacity ${
        disabled ? "opacity-50 pointer-events-none select-none" : ""
      }`}
    >
      <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        Configuración del desafío
      </h2>

      {/* Date input */}
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">
          Fecha de inicio
        </label>
        <input
          type="date"
          min="2020-01-01"
          max={todayISO}
          value={startISO}
          onChange={handleDateChange}
          disabled={disabled}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {era && (
          <p className={`mt-1.5 text-xs font-medium ${eraColor}`}>
            {era.label} —{" "}
            {era.type === "bull"
              ? "mercado alcista 📈"
              : era.type === "bear"
              ? "mercado bajista 📉"
              : "mercado lateral ↔️"}
          </p>
        )}
      </div>

      {/* Duration pills */}
      <div>
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">
          Duración
        </label>
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d.days}
              onClick={() => setConfig({ duration: d.days })}
              disabled={disabled}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                config.duration === d.days
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
          <span>{formatDateLabel(config.startDate)}</span>
          <span>{formatDateLabel(endDate)}</span>
        </div>
        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
          <div
            className="absolute left-0 top-0 h-2 bg-blue-500 rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-gray-900" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900" />
        </div>
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400 text-center">
          {config.duration} días de trading · Capital inicial: <span className="font-semibold text-gray-700 dark:text-gray-200">$100 USD</span>
        </p>
      </div>
    </div>
  )
}
