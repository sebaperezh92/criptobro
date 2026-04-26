import { Sentiment } from "./types"

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function toISO(date: Date): string {
  return date.toISOString().split("T")[0]
}

export function formatDateLabel(date: Date): string {
  return date.toLocaleDateString("es-CL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPct(value: number): string {
  const sign = value >= 0 ? "+" : ""
  return `${sign}${value.toFixed(2)}%`
}

export function detectSentiment(briefing: string): Sentiment {
  const upper = briefing.toUpperCase()
  if (upper.includes("SENTIMIENTO: FEAR")) return "fear"
  if (upper.includes("SENTIMIENTO: GREED")) return "greed"
  return "neutral"
}

export function clampResult(raw: number, portfolio: number): number {
  return Math.max(-portfolio * 0.4, Math.min(portfolio * 0.3, raw))
}

export function extractResultUSD(text: string): number {
  const match = text.match(/RESULTADO_USD:\s*([-+]?\d+\.?\d*)/i)
  return match ? parseFloat(match[1]) : 0
}

export function stripResultUSD(text: string): string {
  return text.replace(/RESULTADO_USD:\s*([-+]?\d+\.?\d*)/i, "").trim()
}

export function extractPair(text: string): string {
  const match = text.match(/\b(BTC|ETH|SOL|BNB|ADA|XRP|AVAX|MATIC|DOGE)\b/i)
  if (!match) return "BTC/USDT"
  return `${match[1].toUpperCase()}/USDT`
}

export function extractStrategy(text: string): string {
  const match = text.match(/\b(LONG|SHORT|SPOT|compra|venta)\b/i)
  if (!match) return "SPOT"
  const s = match[1].toUpperCase()
  if (s === "COMPRA") return "LONG"
  if (s === "VENTA") return "SHORT"
  return s
}

export function extractTraderReasoning(text: string): string {
  const lineMatch = text.match(/Análisis de noticias:\s*(.+)/i)
  if (lineMatch) return lineMatch[1].trim().substring(0, 150)
  // fallback: first 120 chars
  return text.trim().substring(0, 120)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

export function durationLabel(days: number): string {
  if (days === 7) return "1 semana"
  if (days === 14) return "2 semanas"
  if (days === 30) return "1 mes"
  if (days === 90) return "3 meses"
  if (days === 180) return "6 meses"
  if (days === 365) return "1 año"
  return `${days} días`
}
