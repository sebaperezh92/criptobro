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
      ? `\n\nCONTEXTO CONOCIDO DEL PERÍODO (úsalo si no tienes datos exactos): ${seed}`
      : ""

    const prompt = `Eres un analista de mercados financieros. Genera el briefing económico para un trader de criptomonedas en Binance para el día ${simDateISO} (${simDateLabel}).

REGLA ABSOLUTA: Solo menciona eventos, precios y noticias que ocurrieron ANTES O DURANTE el ${simDateISO}. Nunca reveles información del futuro. Operas como si fuera exactamente ese día — el trader no sabe lo que viene.

Usa Google Search para buscar noticias reales de esa fecha. Busca: "crypto news ${simDateISO}", "bitcoin price ${simDateISO}", "economy news ${simDateISO.substring(0, 7)}", "federal reserve ${simDateISO.substring(0, 7)}", "crypto regulation ${simDateISO.substring(0, 4)}"

Estructura del briefing (exactamente este formato, en español):
SENTIMIENTO: [FEAR|NEUTRAL|GREED]

· [Precio aproximado de BTC y ETH en esa fecha con contexto]
· [Estado del mercado crypto ese día: volumen, dominancia, tendencia]
· [Noticia económica macro más relevante: Fed, inflación, empleo, PIB]
· [Noticia geopolítica que pueda afectar mercados si la hay]
· [Evento específico de crypto ese período: hack, regulación, adopción, fork]
· [Correlación relevante: DXY, S&P500, Nasdaq vs BTC ese día]

Contexto adicional del período: ${eraLabel} — mercado ${eraType}.${seedContext}

Sé factual. Solo hechos verificables. Si no tienes datos exactos de ese día, da el contexto del período (esa semana o mes). Español.`

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      tools: [{ googleSearchRetrieval: {} }],
    })

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 800 },
    })

    const text = result.response.text()

    return NextResponse.json({ briefing: text })
  } catch (error) {
    console.error("Briefing error:", error)

    // Fallback: use seed directly
    const seed = getNewsSeed(simDateISO)
    const fallback = seed
      ? `SENTIMIENTO: NEUTRAL\n\n· ${seed}\n· Datos de mercado no disponibles para esta fecha exacta.\n· Usa el contexto del período para tu análisis.\n· Mantente cauteloso ante la incertidumbre.\n· Gestiona el riesgo con stops ajustados.\n· Mercado crypto volátil — adapta posiciones al contexto.`
      : `SENTIMIENTO: NEUTRAL\n\n· Datos de mercado no disponibles. Mercado crypto en rango habitual.\n· Volumen normal, sin eventos extremos conocidos.\n· Macro: condiciones estándar del período.\n· Sin noticias geopolíticas significativas.\n· Mercado en consolidación técnica.\n· BTC y altcoins siguiendo tendencia del período.`

    return NextResponse.json({ briefing: fallback })
  }
}
