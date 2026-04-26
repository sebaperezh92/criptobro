"use client"

import { useCallback, useReducer, useState } from "react"
import {
  ChatMessage,
  MessageRole,
  MessageType,
  PairData,
  Sentiment,
  SimConfig,
  SimState,
  TradeRecord,
} from "@/lib/types"
import { getEra } from "@/lib/market-eras"
import {
  addDays,
  clampResult,
  detectSentiment,
  durationLabel,
  extractPair,
  extractResultUSD,
  extractStrategy,
  extractTraderReasoning,
  formatDateLabel,
  generateId,
  stripResultUSD,
  toISO,
} from "@/lib/utils"

const INITIAL_PORTFOLIO = 100

const initialState: SimState = {
  day: 0,
  portfolio: INITIAL_PORTFOLIO,
  startPortfolio: INITIAL_PORTFOLIO,
  wins: 0,
  losses: 0,
  history: [],
  messages: [],
  currentBriefing: "",
  currentSentiment: "neutral",
  currentMarketData: [],
  isRunning: false,
  isStarted: false,
  isFinished: false,
  currentStep: 0,
}

type Action =
  | { type: "SET_RUNNING"; payload: boolean }
  | { type: "SET_STEP"; payload: 0 | 1 | 2 | 3 | 4 }
  | { type: "SET_BRIEFING"; payload: { briefing: string; sentiment: Sentiment } }
  | { type: "SET_MARKET_DATA"; payload: PairData[] }
  | { type: "ADD_MESSAGE"; payload: ChatMessage }
  | { type: "UPDATE_MESSAGE"; payload: { id: string; text: string; isTyping?: boolean } }
  | { type: "FINALIZE_MESSAGE"; payload: { id: string; type?: MessageType } }
  | { type: "DAY_COMPLETE"; payload: { pnl: number; record: TradeRecord } }
  | { type: "SET_STARTED" }
  | { type: "SET_FINISHED" }
  | { type: "RESET" }

function reducer(state: SimState, action: Action): SimState {
  switch (action.type) {
    case "SET_RUNNING":
      return { ...state, isRunning: action.payload }
    case "SET_STEP":
      return { ...state, currentStep: action.payload }
    case "SET_BRIEFING":
      return {
        ...state,
        currentBriefing: action.payload.briefing,
        currentSentiment: action.payload.sentiment,
      }
    case "SET_MARKET_DATA":
      return { ...state, currentMarketData: action.payload }
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] }
    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.payload.id
            ? {
                ...m,
                text: action.payload.text,
                isTyping: action.payload.isTyping ?? m.isTyping,
              }
            : m
        ),
      }
    case "FINALIZE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((m) =>
          m.id === action.payload.id
            ? { ...m, isTyping: false, type: action.payload.type ?? m.type }
            : m
        ),
      }
    case "DAY_COMPLETE": {
      const newPortfolio = Math.max(1, state.portfolio + action.payload.pnl)
      return {
        ...state,
        day: state.day + 1,
        portfolio: newPortfolio,
        wins: action.payload.pnl >= 0 ? state.wins + 1 : state.wins,
        losses: action.payload.pnl < 0 ? state.losses + 1 : state.losses,
        history: [...state.history, action.payload.record],
        currentStep: 4,
      }
    }
    case "SET_STARTED":
      return { ...state, isStarted: true, day: 0 }
    case "SET_FINISHED":
      return { ...state, isFinished: true, isRunning: false }
    case "RESET":
      return { ...initialState }
    default:
      return state
  }
}

function buildHistory(history: TradeRecord[]): string {
  if (history.length === 0) return ""
  const last5 = history.slice(-5)
  return last5
    .map(
      (r) =>
        `Día ${r.day} (${r.date}): ${r.pair} | ${r.strategy} | P&L: ${r.pnlUSD >= 0 ? "+" : ""}$${r.pnlUSD.toFixed(2)} | Portfolio: $${r.portfolioAfter.toFixed(2)}\n  Noticia del día: ${r.briefingSummary}\n  Mi razonamiento: ${r.traderReasoning}`
    )
    .join("\n\n")
}

async function fetchStream(
  url: string,
  body: Record<string, unknown>,
  onChunk: (text: string) => void
): Promise<string> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!res.ok || !res.body) {
    throw new Error(`HTTP ${res.status}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let full = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    full += chunk
    onChunk(full)
  }

  return full
}

export function useSimulation() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [config, setConfigState] = useState<SimConfig>({
    startDate: new Date("2024-01-11"),
    duration: 30,
    durationLabel: "1 mes",
  })

  const setConfig = useCallback((partial: Partial<SimConfig>) => {
    setConfigState((prev) => {
      const next = { ...prev, ...partial }
      if (partial.duration) {
        next.durationLabel = durationLabel(partial.duration)
      }
      return next
    })
  }, [])

  const startChallenge = useCallback(() => {
    dispatch({ type: "SET_STARTED" })
  }, [])

  const reset = useCallback(() => {
    dispatch({ type: "RESET" })
  }, [])

  const addTypingMessage = useCallback(
    (role: MessageRole, name: string): string => {
      const id = generateId()
      dispatch({
        type: "ADD_MESSAGE",
        payload: {
          id,
          role,
          name,
          text: "",
          isTyping: true,
          timestamp: new Date(),
        },
      })
      return id
    },
    []
  )

  const addSystemMessage = useCallback((text: string) => {
    dispatch({
      type: "ADD_MESSAGE",
      payload: {
        id: generateId(),
        role: "system",
        name: "Sistema",
        text,
        isTyping: false,
        timestamp: new Date(),
      },
    })
  }, [])

  const runDay = useCallback(async () => {
    if (state.isRunning || state.isFinished) return

    dispatch({ type: "SET_RUNNING", payload: true })

    const dayNumber = state.day + 1
    const simDate = addDays(config.startDate, state.day)
    const simDateISO = toISO(simDate)
    const simDateLabel = formatDateLabel(simDate)
    const era = getEra(simDateISO)

    addSystemMessage(`─── Día ${dayNumber}/${config.duration} · ${simDateLabel} ───`)

    try {
      // ── STEP 1: Briefing ──────────────────────────────────────────────────
      dispatch({ type: "SET_STEP", payload: 1 })

      const briefingRes = await fetch("/api/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          simDateISO,
          simDateLabel,
          eraLabel: era.label,
          eraType: era.type,
        }),
      })
      const briefingJson = await briefingRes.json()
      const briefing: string = briefingJson.briefing ?? ""
      const sentiment = detectSentiment(briefing)

      dispatch({ type: "SET_BRIEFING", payload: { briefing, sentiment } })

      // ── STEP 1.5: Market data from Binance ───────────────────────────────
      let marketData: PairData[] = []
      try {
        const marketRes = await fetch("/api/market", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ simDateISO }),
        })
        const marketJson = await marketRes.json()
        marketData = marketJson.marketData ?? []
        dispatch({ type: "SET_MARKET_DATA", payload: marketData })
      } catch {
        // Binance data is best-effort; simulation continues without it
      }

      // ── STEP 2: Oracle asks ───────────────────────────────────────────────
      dispatch({ type: "SET_STEP", payload: 2 })

      const oracleMsgId = addTypingMessage("oracle", "Oráculo")
      let oracleQuestion = ""

      await fetchStream(
        "/api/agent2",
        {
          mode: "ask",
          day: dayNumber,
          portfolio: state.portfolio,
          simDateISO,
          simDateLabel,
          eraLabel: era.label,
          eraType: era.type,
          briefing,
          history: buildHistory(state.history),
        },
        (text) => {
          oracleQuestion = text
          dispatch({ type: "UPDATE_MESSAGE", payload: { id: oracleMsgId, text, isTyping: true } })
        }
      )
      dispatch({ type: "FINALIZE_MESSAGE", payload: { id: oracleMsgId } })

      // ── STEP 3: Trader responds ───────────────────────────────────────────
      dispatch({ type: "SET_STEP", payload: 3 })

      const traderMsgId = addTypingMessage("trader", "Trader")
      let traderStrategy = ""

      await fetchStream(
        "/api/agent1",
        {
          day: dayNumber,
          portfolio: state.portfolio,
          simDateISO,
          simDateLabel,
          eraLabel: era.label,
          eraType: era.type,
          briefing,
          oracleQuestion,
          history: buildHistory(state.history),
        },
        (text) => {
          traderStrategy = text
          dispatch({ type: "UPDATE_MESSAGE", payload: { id: traderMsgId, text, isTyping: true } })
        }
      )
      dispatch({ type: "FINALIZE_MESSAGE", payload: { id: traderMsgId } })

      // ── STEP 4: Oracle evaluates ──────────────────────────────────────────
      dispatch({ type: "SET_STEP", payload: 4 })

      const evalMsgId = addTypingMessage("oracle", "Oráculo — Resultado")
      let evalFull = ""

      await fetchStream(
        "/api/agent2",
        {
          mode: "evaluate",
          day: dayNumber,
          portfolio: state.portfolio,
          simDateISO,
          simDateLabel,
          eraLabel: era.label,
          eraType: era.type,
          briefing,
          traderStrategy,
          marketData,
        },
        (text) => {
          evalFull = text
          dispatch({ type: "UPDATE_MESSAGE", payload: { id: evalMsgId, text, isTyping: true } })
        }
      )

      const rawPnl = extractResultUSD(evalFull)
      const pnl = clampResult(rawPnl, state.portfolio)
      const displayText = stripResultUSD(evalFull)

      dispatch({
        type: "FINALIZE_MESSAGE",
        payload: {
          id: evalMsgId,
          type: pnl >= 0 ? "result-win" : "result-loss",
        },
      })
      dispatch({
        type: "UPDATE_MESSAGE",
        payload: { id: evalMsgId, text: displayText, isTyping: false },
      })

      // Build trade record
      const pair = extractPair(traderStrategy)
      const strategy = extractStrategy(traderStrategy)
      const newPortfolio = Math.max(1, state.portfolio + pnl)
      const pctReturn = (pnl / state.portfolio) * 100
      const briefingSummary = briefing.substring(0, 80)
      const newsContext = briefing.split("\n").find((l) => l.startsWith("·")) ?? briefingSummary
      const traderReasoning = extractTraderReasoning(traderStrategy)

      const record: TradeRecord = {
        day: dayNumber,
        date: simDateLabel,
        simDateISO,
        pair,
        strategy,
        pnlUSD: pnl,
        pctReturn,
        portfolioAfter: newPortfolio,
        eraLabel: era.label,
        briefingSummary,
        newsContext,
        traderReasoning,
        sentiment,
      }

      dispatch({ type: "DAY_COMPLETE", payload: { pnl, record } })

      if (dayNumber >= config.duration) {
        dispatch({ type: "SET_FINISHED" })
      }
    } catch (err) {
      console.error("runDay error:", err)
      addSystemMessage(`Error en el día ${dayNumber}. Intenta de nuevo.`)
    } finally {
      dispatch({ type: "SET_RUNNING", payload: false })
      dispatch({ type: "SET_STEP", payload: 0 })
    }
  }, [state, config, addTypingMessage, addSystemMessage])

  return { state, config, setConfig, startChallenge, runDay, reset }
}
