"use client"

import {
  AreaChart,
  Area,
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
  startPortfolio: number
}

interface ChartPoint {
  day: number
  portfolio: number
  date: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d: ChartPoint = payload[0].payload
  const isPositive = d.portfolio >= 100
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-gray-700 dark:text-gray-300">Día {d.day}</p>
      <p className="text-gray-500 dark:text-gray-400">{d.date}</p>
      <p className={`font-bold text-sm mt-0.5 ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
        {formatCurrency(d.portfolio)}
      </p>
    </div>
  )
}

export default function PortfolioChart({ history, startPortfolio }: Props) {
  const data: ChartPoint[] = [
    { day: 0, portfolio: startPortfolio, date: "Inicio" },
    ...history.map((r) => ({
      day: r.day,
      portfolio: r.portfolioAfter,
      date: r.date,
    })),
  ]

  const currentPortfolio = history.length > 0 ? history[history.length - 1].portfolioAfter : startPortfolio
  const isPositive = currentPortfolio >= startPortfolio
  const gradientId = isPositive ? "portfolioGreenGradient" : "portfolioRedGradient"
  const lineColor = isPositive ? "#10b981" : "#ef4444"

  const minVal = Math.min(...data.map((d) => d.portfolio)) * 0.95
  const maxVal = Math.max(...data.map((d) => d.portfolio)) * 1.05

  if (data.length < 2) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 h-[200px] flex items-center justify-center">
        <p className="text-sm text-gray-400 dark:text-gray-600">
          El gráfico aparecerá al completar el primer día
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        Evolución del Portfolio
      </h3>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="portfolioGreenGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="portfolioRedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#9ca3af" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v.toFixed(0)}`}
            domain={[minVal, maxVal]}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={startPortfolio}
            stroke="#9ca3af"
            strokeDasharray="4 4"
            strokeOpacity={0.7}
          />
          <Area
            type="monotone"
            dataKey="portfolio"
            stroke={lineColor}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 4, fill: lineColor }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
