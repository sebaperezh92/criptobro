import { NextRequest } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { mode, day, portfolio, simDateISO, simDateLabel, eraLabel, eraType, briefing, history, traderStrategy } = body

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
      systemPrompt = `Eres el AGENTE 2 — Oráculo del Mercado con datos históricos REALES de Binance.
Fecha: ${simDateLabel} (${simDateISO}). Capital: $${portfolio.toFixed(2)} USD.
Era: ${eraLabel} (${eraTypeLabel}).

BRIEFING DEL DÍA: ${briefing}
ESTRATEGIA DEL TRADER: ${traderStrategy}

EVALUACIÓN CON DATOS HISTÓRICOS REALES:
1. ¿Qué pasó realmente en ${simDateISO} con el par que eligió el trader?
2. ¿Cómo movió el mercado ese día dado el contexto de noticias?
3. ¿La lectura del trader de las noticias fue correcta?
4. ¿Qué señal del briefing fue la más predictiva del resultado?

CÁLCULO DE P&L (proporcional al capital usado, no al total):
Si el trader usó X% del capital, el P&L se calcula sobre ese X%.

RANGOS DE VOLATILIDAD REALISTAS:
Bull market + noticias positivas: long puede dar +8% a +25% del capital usado
Bull market + noticias mixtas: long da +2% a +10%, short da -5% a -15%
Bear market + noticias negativas: short puede dar +5% a +20%, long da -8% a -30%
Bear market + rebote técnico: puede haber sorpresas alcistas del +5% a +15%
Lateral + sin noticias clave: ±2% a ±8% del capital usado
Eventos extremos (halving, ETF aprobado, crash): hasta ±35%

Da feedback constructivo en 4-5 oraciones:
- Qué leyó bien el trader en las noticias
- Qué no consideró
- Qué habría sido la operación óptima para ese día

OBLIGATORIO — última línea del response, exactamente así:
RESULTADO_USD: [número con 2 decimales, positivo si ganó, negativo si perdió]

Español. Tono educativo y analítico.`

      userMessage = `Evalúa la estrategia del trader para el ${simDateLabel} y calcula el resultado.`
    }

    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 900,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    })

    return new Response(stream.toReadableStream(), {
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
