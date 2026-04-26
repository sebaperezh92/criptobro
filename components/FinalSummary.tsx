"use client"

import { SimState } from "@/lib/types"
import { formatCurrency, formatPct } from "@/lib/utils"

interface Props {
  state: SimState
  onReset: () => void
}

export default function FinalSummary({ state, onReset }: Props) {
  const pnl = state.portfolio - state.startPortfolio
  const pctReturn = ((state.portfolio - state.startPortfolio) / state.startPortfolio) * 100
  const isPositive = pnl >= 0

  const bestDay = state.history.reduce(
    (best, r) => (r.pnlUSD > best.pnlUSD ? r : best),
    state.history[0]
  )
  const worstDay = state.history.reduce(
    (worst, r) => (r.pnlUSD < worst.pnlUSD ? r : worst),
    state.history[0]
  )

  const pairCounts: Record<string, number> = {}
  state.history.forEach((r) => {
    pairCounts[r.pair] = (pairCounts[r.pair] ?? 0) + 1
  })
  const topPair = Object.entries(pairCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—"

  return (
    <div
      className={`rounded-xl border-2 p-5 ${
        isPositive
          ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/20"
          : "border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20"
      }`}
    >
      <div className="text-center mb-4">
        <div className="text-3xl mb-1">{isPositive ? "🏆" : "📉"}</div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Desafío Completado
        </h2>
        <p
          className={`text-2xl font-bold mt-1 ${
            isPositive
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {isPositive ? "+" : ""}
          {formatCurrency(pnl)} ({formatPct(pctReturn)})
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <Stat label="Portfolio final" value={formatCurrency(state.portfolio)} />
        <Stat label="Capital inicial" value={formatCurrency(state.startPortfolio)} />
        <Stat label="Trades totales" value={`${state.history.length}`} />
        <Stat label="Ganados" value={`${state.wins}`} color="text-emerald-600 dark:text-emerald-400" />
        <Stat label="Perdidos" value={`${state.losses}`} color="text-red-600 dark:text-red-400" />
        <Stat label="Par favorito" value={topPair} />
        {bestDay && (
          <Stat
            label="Mejor día"
            value={`+${formatCurrency(bestDay.pnlUSD)}`}
            sub={`Día ${bestDay.day}`}
            color="text-emerald-600 dark:text-emerald-400"
          />
        )}
        {worstDay && (
          <Stat
            label="Peor día"
            value={formatCurrency(worstDay.pnlUSD)}
            sub={`Día ${worstDay.day}`}
            color="text-red-600 dark:text-red-400"
          />
        )}
      </div>

      <button
        onClick={onReset}
        className="w-full py-2.5 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        ↺ Nuevo desafío
      </button>
    </div>
  )
}

function Stat({
  label,
  value,
  sub,
  color,
}: {
  label: string
  value: string
  sub?: string
  color?: string
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-2.5 text-center border border-gray-200 dark:border-gray-700">
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
      <p className={`text-base font-bold ${color ?? "text-gray-900 dark:text-gray-100"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 dark:text-gray-500">{sub}</p>}
    </div>
  )
}
