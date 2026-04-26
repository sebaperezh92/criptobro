import { NextRequest, NextResponse } from "next/server"
import { PairData } from "@/lib/types"

export const runtime = "nodejs"
export const maxDuration = 30

const PAIRS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT"]

async function fetchKline(symbol: string, dateISO: string): Promise<PairData | null> {
  const startMs = new Date(dateISO + "T00:00:00Z").getTime()
  const endMs = startMs + 86400000 // +1 day

  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&startTime=${startMs}&endTime=${endMs}&limit=1`

  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) return null

  const data = await res.json()
  if (!data || data.length === 0) return null

  const [, open, high, low, close, volume] = data[0]
  const o = parseFloat(open)
  const c = parseFloat(close)

  return {
    symbol,
    open: o,
    high: parseFloat(high),
    low: parseFloat(low),
    close: c,
    volume: parseFloat(volume),
    change: parseFloat((((c - o) / o) * 100).toFixed(2)),
  }
}

export async function POST(req: NextRequest) {
  try {
    const { simDateISO } = await req.json()
    if (!simDateISO) {
      return NextResponse.json({ error: "simDateISO required" }, { status: 400 })
    }

    const results = await Promise.allSettled(PAIRS.map((p) => fetchKline(p, simDateISO)))

    const marketData: PairData[] = results
      .map((r) => (r.status === "fulfilled" ? r.value : null))
      .filter((d): d is PairData => d !== null)

    return NextResponse.json({ marketData })
  } catch (error) {
    console.error("Market route error:", error)
    return NextResponse.json({ marketData: [] })
  }
}
