"use client"

import { SimState } from "@/lib/types"
import { formatCurrency, formatPct } from "@/lib/utils"

interface Props {
  state: SimState
  totalDays: number
}

interface MetricCard {
  label: string
  value: string
  sub?: string
  color?: string
}

export default function MetricsBar({ state, totalDays }: Props) {
  const pnl = state.portfolio - state.startPortfolio
  const pctReturn = ((state.portfolio - state.startPortfolio) / state.startPortfolio) * 100
  const isPositive = pnl >= 0

  const metrics: MetricCard[] = [
    {
      label: "Portfolio",
      value: formatCurrency(state.portfolio),
      sub: "capital actual",
    },
    {
      label: "P&L Total",
      value: `${isPositive ? "+" : ""}${formatCurrency(pnl)}`,
      sub: "ganancia/pérdida",
      color: isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
    },
    {
      label: "Retorno",
      value: formatPct(pctReturn),
      sub: "desde inicio",
      color: isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400",
    },
    {
      label: "Progreso",
      value: `${state.day}/${totalDays}`,
      sub: "días completados",
    },
    {
      label: "Trades",
      value: `${state.wins}W / ${state.losses}L`,
      sub: state.wins + state.losses > 0
        ? `${Math.round((state.wins / (state.wins + state.losses)) * 100)}% win rate`
        : "sin trades",
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-3 text-center"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide mb-1">
            {m.label}
          </p>
          <p className={`text-lg font-bold ${m.color ?? "text-gray-900 dark:text-gray-100"}`}>
            {m.value}
          </p>
          {m.sub && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{m.sub}</p>
          )}
        </div>
      ))}
    </div>
  )
}
