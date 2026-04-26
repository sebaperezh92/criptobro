"use client"

import { PairData } from "@/lib/types"

interface Props {
  data: PairData[]
  simDateLabel: string
}

function formatPrice(n: number): string {
  if (n >= 1000) return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  if (n >= 1) return n.toFixed(2)
  return n.toFixed(4)
}

export default function MarketDataPanel({ data, simDateLabel }: Props) {
  if (data.length === 0) return null

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Precios Reales Binance
        </h3>
        <span className="text-[10px] text-gray-400 dark:text-gray-600">{simDateLabel}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-gray-400 dark:text-gray-600">
              <th className="text-left pb-1.5 font-medium">Par</th>
              <th className="text-right pb-1.5 font-medium">Apertura</th>
              <th className="text-right pb-1.5 font-medium">Cierre</th>
              <th className="text-right pb-1.5 font-medium">Máx</th>
              <th className="text-right pb-1.5 font-medium">Mín</th>
              <th className="text-right pb-1.5 font-medium">Cambio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.map((d) => {
              const isUp = d.change >= 0
              return (
                <tr key={d.symbol}>
                  <td className="py-1.5 font-semibold text-gray-700 dark:text-gray-300">
                    {d.symbol.replace("USDT", "")}
                    <span className="text-gray-400 dark:text-gray-600 font-normal">/USDT</span>
                  </td>
                  <td className="py-1.5 text-right text-gray-600 dark:text-gray-400">${formatPrice(d.open)}</td>
                  <td className="py-1.5 text-right font-medium text-gray-800 dark:text-gray-200">${formatPrice(d.close)}</td>
                  <td className="py-1.5 text-right text-emerald-600 dark:text-emerald-400">${formatPrice(d.high)}</td>
                  <td className="py-1.5 text-right text-red-600 dark:text-red-400">${formatPrice(d.low)}</td>
                  <td className={`py-1.5 text-right font-semibold ${isUp ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    {isUp ? "+" : ""}{d.change}%
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
