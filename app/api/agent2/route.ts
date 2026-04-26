import { NextRequest } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { mode, day, portfolio, simDateISO, simDateLabel, eraLabel, eraType, briefing, history, traderStrategy, marketData } = body

    const eraTypeLabel =
      eraType === "bull" ? "alcista" : eraType === "bear" ? "bajista" : "lateral"

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    let systemPrompt: string
    let userMessage: string

    if (mode === "ask") {
      systemPrompt = `Eres el AGENTE 2 — Oráculo del Mercado con acceso a datos históricos reales de Binance.
Fecha: ${simDateLabel}. Capital del trader: $${portfolio.toFixed(2)} USD.
Era: ${eraLabel} (${eraTypeLabel}).

Tienes el briefing de noticias del día:
${briefing}

Historial del trader:
${history || "Sin operaciones previas — es su primer día."}

Haz UNA sola pregunta concisa al Agente 1 sobre su estrategia de hoy.
La pregunta debe:
- Mencionar el contexto de las noticias más relevantes del día
- Plantear la tensión o dilema del mercado en ese momento
- Ser específica sobre qué par o sector le interesa conocer su posición
Máximo 3 oraciones. Español.`

      userMessage = `Es el día ${day}. ¿Qué pregunta le harías al Trader para este día?`
    } else {
      // mode === "evaluate"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const marketSection = marketData && marketData.length > 0
        ? `\nDATOS REALES DE BINANCE PARA ${simDateISO}:\n` +
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (marketData as any[]).map((d: any) =>
            `${d.symbol}: Apertura $${d.open.toLocaleString()} | Cierre $${d.close.toLocaleString()} | Máx $${d.high.toLocaleString()} | Mín $${d.low.toLocaleString()} | Cambio ${d.change >= 0 ? "+" : ""}${d.change}%`
          ).join("\n")
        : "\n(Datos de Binance no disponibles para esta fecha — usa el briefing para tu evaluación.)"

      systemPrompt = `Eres el AGENTE 2 — Oráculo del Mercado con datos históricos REALES de Binance.
Fecha: ${simDateLabel} (${simDateISO}). Capital: $${portfolio.toFixed(2)} USD.
Era: ${eraLabel} (${eraTypeLabel}).

BRIEFING DEL DÍA: ${briefing}
ESTRATEGIA DEL TRADER: ${traderStrategy}
${marketSection}

INSTRUCCIÓN CRÍTICA: Si tienes datos reales de Binance arriba, ÚSALOS para basar tu evaluación en los movimientos reales del par que eligió el trader. El P&L debe reflejar lo que REALMENTE ocurrió ese día según los datos de precio.

CÁLCULO DE P&L BASADO EN DATOS REALES:
- Identifica el par que usó el trader
- Si ese par está en los datos de Binance, usa el cambio % real del día
- Aplica ese cambio al capital que el trader declaró usar (si dijo "50% del capital", aplica sobre $${(portfolio * 0.5).toFixed(2)})
- Si eligió LONG y el precio subió → ganó. Si bajó → perdió. Para SHORT, al revés.
- Si no hay datos del par específico, usa el cambio de BTC como referencia del mercado.

Da feedback constructivo en 4-5 oraciones:
- Cita los precios reales del día (si tienes datos) para dar credibilidad
- Qué leyó bien el trader en las noticias
- Qué no consideró
- Qué habría sido la operación óptima para ese día

OBLIGATORIO — última línea del response, exactamente así:
RESULTADO_USD: [número con 2 decimales, positivo si ganó, negativo si perdió]

Español. Tono educativo y analítico.`

      userMessage = `Evalúa la estrategia del trader para el ${simDateLabel} usando los datos reales de Binance y calcula el resultado.`
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = anthropic.messages.stream({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 900,
            system: systemPrompt,
            messages: [{ role: "user", content: userMessage }],
          })
          for await (const chunk of response) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text))
            }
          }
        } catch (err) {
          console.error("Agent2 stream error:", JSON.stringify(err))
          controller.error(err)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  } catch (error) {
    console.error("Agent2 error:", error)
    return new Response("Error al procesar el Oráculo.\nRESULTADO_USD: 0.00", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  }
}
