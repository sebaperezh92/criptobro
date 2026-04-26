"use client"

import { TradeRecord } from "@/lib/types"
import { formatCurrency, formatPct } from "@/lib/utils"

interface Props {
  history: TradeRecord[]
}

const SENTIMENT_COLORS = {
  fear: "text-red-500",
  neutral: "text-gray-400",
  greed: "text-emerald-500",
}

export default function TradeHistory({ history }: Props) {
  if (history.length === 0) return null

  const sorted = [...history].reverse()

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Historial de operaciones
        </h3>
      </div>
      <div className="max-h-44 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800/80">
            <tr>
              <th className="text-left px-3 py-2 text-gray-500 dark:text-gray-400 font-medium">Día</th>
              <th className="text-left px-3 py-2 text-gray-500 dark:text-gray-400 font-medium hidden sm:table-cell">Fecha</th>
              <th className="text-left px-3 py-2 text-gray-500 dark:text-gray-400 font-medium">Par</th>
              <th className="text-left px-3 py-2 text-gray-500 dark:text-gray-400 font-medium">Tipo</th>
              <th className="text-right px-3 py-2 text-gray-500 dark:text-gray-400 font-medium">P&L</th>
              <th className="text-right px-3 py-2 text-gray-500 dark:text-gray-400 font-medium hidden md:table-cell">Portfolio</th>
              <th className="text-left px-3 py-2 text-gray-500 dark:text-gray-400 font-medium hidden lg:table-cell">Noticia clave</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => {
              const isWin = r.pnlUSD >= 0
              return (
                <tr
                  key={`${r.day}-${r.simDateISO}`}
                  className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-3 py-1.5 font-medium text-gray-700 dark:text-gray-300">
                    #{r.day}
                  </td>
                  <td className="px-3 py-1.5 text-gray-500 dark:text-gray-400 hidden sm:table-cell whitespace-nowrap">
                    {r.date}
                  </td>
                  <td className="px-3 py-1.5 font-mono text-blue-600 dark:text-blue-400">
                    {r.pair}
                  </td>
                  <td className="px-3 py-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        r.strategy === "LONG"
                          ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
                          : r.strategy === "SHORT"
                          ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400"
                          : "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400"
                      }`}
                    >
                      {r.strategy}
                    </span>
                  </td>
                  <td
                    className={`px-3 py-1.5 text-right font-semibold tabular-nums ${
                      isWin
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {isWin ? "+" : ""}
                    {formatCurrency(r.pnlUSD)}
                  </td>
                  <td className="px-3 py-1.5 text-right text-gray-600 dark:text-gray-400 tabular-nums hidden md:table-cell">
                    {formatCurrency(r.portfolioAfter)}
                  </td>
                  <td className="px-3 py-1.5 hidden lg:table-cell">
                    <span
                      className="text-gray-500 dark:text-gray-400 cursor-help truncate max-w-[200px] block"
                      title={r.briefingSummary}
                    >
                      <span className={`mr-1 ${SENTIMENT_COLORS[r.sentiment]}`}>●</span>
                      {r.newsContext.substring(0, 60)}…
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
