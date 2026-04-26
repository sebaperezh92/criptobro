export type EraType = "bull" | "bear" | "flat"
export type Sentiment = "fear" | "neutral" | "greed"
export type MessageRole = "trader" | "oracle" | "news" | "system"
export type MessageType = "normal" | "result-win" | "result-loss"

export interface Era {
  from: string
  to: string
  label: string
  type: EraType
}

export interface TradeRecord {
  day: number
  date: string
  simDateISO: string
  pair: string
  strategy: string
  pnlUSD: number
  pctReturn: number
  portfolioAfter: number
  eraLabel: string
  briefingSummary: string
  newsContext: string
  traderReasoning: string
  sentiment: Sentiment
}

export interface ChatMessage {
  id: string
  role: MessageRole
  name: string
  text: string
  type?: MessageType
  isTyping?: boolean
  timestamp: Date
}

export interface SimConfig {
  startDate: Date
  duration: number
  durationLabel: string
}

export interface PairData {
  symbol: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  change: number
}

export interface SimState {
  day: number
  portfolio: number
  startPortfolio: number
  wins: number
  losses: number
  history: TradeRecord[]
  messages: ChatMessage[]
  currentBriefing: string
  currentSentiment: Sentiment
  currentMarketData: PairData[]
  isRunning: boolean
  isStarted: boolean
  isFinished: boolean
  currentStep: 0 | 1 | 2 | 3 | 4
}
