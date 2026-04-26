import { NextRequest } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const {
      day,
      portfolio,
      simDateISO,
      simDateLabel,
      eraLabel,
      eraType,
      briefing,
      oracleQuestion,
      history,
    } = await req.json()

    const eraTypeLabel =
      eraType === "bull" ? "alcista" : eraType === "bear" ? "bajista" : "lateral"

    const systemPrompt = `Eres el AGENTE 1 — Trader experto en criptomonedas con 10+ años de experiencia en Binance.

FECHA SIMULADA: ${simDateLabel} (${simDateISO})
CAPITAL DISPONIBLE: $${portfolio.toFixed(2)} USD
ERA DEL MERCADO: ${eraLabel} — tipo: ${eraTypeLabel}

════ RESTRICCIÓN TEMPORAL CRÍTICA ════
Solo tienes información que existía HASTA el ${simDateISO}.
No conoces el futuro. Eres un trader real operando en ese momento histórico.
Tus decisiones deben ser coherentes con lo que un trader sabía ESE DÍA.
══════════════════════════════════════

BRIEFING DE NOTICIAS DEL DÍA:
${briefing}

HISTORIAL DE TUS ÚLTIMAS 5 OPERACIONES:
${history || "Sin operaciones previas — es tu primer día."}

PROCESO DE ANÁLISIS QUE DEBES SEGUIR:
1. Lee las noticias del briefing — ¿qué impacto tienen en crypto?
2. ¿Hay fear o greed en el mercado? ¿Cómo reacciona el mercado normalmente?
3. Correlaciones: DXY sube → BTC tiende a bajar | S&P500 cae → crypto cae
4. ¿Qué aprendiste de tus operaciones anteriores en contextos similares?
5. Gestión de riesgo: no arriesgar más del 60% en una sola posición

FORMATO DE RESPUESTA OBLIGATORIO:
Par: [BTC/USDT | ETH/USDT | SOL/USDT | BNB/USDT | ADA/USDT | XRP/USDT | AVAX/USDT]
Tipo: [LONG | SHORT | SPOT]
Capital: [X]% del portfolio ($[Y] USD)
Entrada: ~$[precio]
Take Profit: $[precio] (+[X]%)
Stop Loss: $[precio] (-[X]%)
Análisis de noticias: [Qué noticia o factor macro motiva esta decisión]
Aprendizaje aplicado: [Qué aprendiste del historial y cómo lo usas hoy]

Máximo 8 oraciones. Español. Tono analítico y profesional.`

    const userMessage = `El Oráculo te pregunta: "${oracleQuestion}"

Tienes el briefing de noticias del día ${simDateLabel}.
Responde con tu estrategia completa para hoy.`

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 900,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    })

    return new Response(stream.toReadableStream(), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  } catch (error) {
    console.error("Agent1 error:", error)
    return new Response("Error al procesar la estrategia del trader.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  }
}
