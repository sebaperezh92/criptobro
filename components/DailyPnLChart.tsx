"use client"

import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts"
import { TradeRecord } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"

interface Props {
  history: TradeRecord[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const isPositive = d.pnl >= 0
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-700 dark:text-gray-300">Día {d.day}</p>
      <p className="text-gray-500 dark:text-gray-400 text-[10px]">{d.date}</p>
      <p className="font-semibold">{d.pair} · {d.strategy}</p>
      <p className={`font-bold text-sm mt-0.5 ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
        {isPositive ? "+" : ""}{formatCurrency(d.pnl)}
      </p>
    </div>
  )
}

export default function DailyPnLChart({ history }: Props) {
  if (history.length === 0) return null

  const data = history.map((r) => ({
    day: r.day,
    date: r.date,
    pnl: parseFloat(r.pnlUSD.toFixed(2)),
    pair: r.pair,
    strategy: r.strategy,
  }))

  const maxAbs = Math.max(...data.map((d) => Math.abs(d.pnl)), 1)

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        P&L por Día
      </h3>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.4} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 9, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v.toFixed(0)}`}
            domain={[-maxAbs * 1.1, maxAbs * 1.1]}
            width={38}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#9ca3af" strokeOpacity={0.6} />
          <Bar dataKey="pnl" radius={[3, 3, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.pnl >= 0 ? "#10b981" : "#ef4444"}
                fillOpacity={0.85}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
