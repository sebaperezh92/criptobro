import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getNewsSeed } from "@/lib/news-seeds"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST(req: NextRequest) {
  let simDateISO = ""
  let simDateLabel = ""
  let eraLabel = ""
  let eraType = ""

  try {
    const body = await req.json()
    simDateISO = body.simDateISO ?? ""
    simDateLabel = body.simDateLabel ?? ""
    eraLabel = body.eraLabel ?? ""
    eraType = body.eraType ?? ""

    if (!simDateISO) {
      return NextResponse.json({ error: "simDateISO required" }, { status: 400 })
    }

    const seed = getNewsSeed(simDateISO)
    const seedContext = seed
      ? `\n\nCONTEXTO CONOCIDO DEL PERÍODO: ${seed}`
      : ""

    const prompt = `Eres un analista de mercados financieros. Genera el briefing económico para un trader de criptomonedas en Binance para el día ${simDateISO} (${simDateLabel}).

REGLA ABSOLUTA: Solo menciona eventos, precios y noticias que ocurrieron ANTES O DURANTE el ${simDateISO}. Nunca reveles información del futuro.

Busca noticias reales de: "crypto news ${simDateISO}", "bitcoin price ${simDateISO.substring(0, 7)}", "economy news ${simDateISO.substring(0, 7)}", "federal reserve ${simDateISO.substring(0, 7)}"

Estructura exacta (en español):
SENTIMIENTO: [FEAR|NEUTRAL|GREED]

· [Precio de BTC y ETH en esa fecha con contexto]
· [Estado del mercado crypto ese día]
· [Noticia económica macro más relevante: Fed, inflación, empleo]
· [Evento específico de crypto: hack, regulación, adopción, fork]
· [Correlación: DXY, S&P500 vs BTC ese día]
· [Contexto geopolítico relevante si lo hay]

Período: ${eraLabel} — mercado ${eraType}.${seedContext}

Sé factual y específico con fechas y precios reales. Español.`

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

    // Intentar con Search Grounding primero
    try {
      const modelWithSearch = genAI.getGenerativeModel({
        model: "gemini-1.5-pro",
        tools: [{ googleSearchRetrieval: {} }],
      })
      const result = await modelWithSearch.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 800 },
      })
      const text = result.response.text()
      if (text && text.length > 50) {
        return NextResponse.json({ briefing: text })
      }
    } catch (searchError) {
      console.log("Search grounding falló, usando Gemini estándar:", searchError)
    }

    // Fallback: Gemini sin Search Grounding
    const modelStandard = genAI.getGenerativeModel({ model: "gemini-1.5-pro" })
    const result = await modelStandard.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 800 },
    })
    const text = result.response.text()
    return NextResponse.json({ briefing: text })

  } catch (error) {
    console.error("Briefing error:", error)

    // Último fallback: seed de noticias
    const seed = getNewsSeed(simDateISO)
    const fallback = seed
      ? `SENTIMIENTO: NEUTRAL\n\n· ${seed}\n· Datos adicionales de mercado en proceso de carga.\n· Usa el contexto del período para tu análisis.\n· Gestiona el riesgo con stops ajustados.\n· Mercado crypto volátil — adapta posiciones al contexto.\n· Correlaciones macro siguen tendencia del período.`
      : `SENTIMIENTO: NEUTRAL\n\n· Mercado crypto en rango habitual para el período.\n· Volumen normal, sin eventos extremos confirmados.\n· Condiciones macro estándar del período.\n· Sin noticias geopolíticas significativas confirmadas.\n· Mercado en consolidación técnica.\n· BTC y altcoins siguiendo tendencia histórica del período.`

    return NextResponse.json({ briefing: fallback })
  }
}
