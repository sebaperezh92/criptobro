"use client"

import { useEffect, useRef } from "react"
import { useSimulation } from "@/hooks/useSimulation"
import { getEra } from "@/lib/market-eras"
import { addDays, formatDateLabel, toISO } from "@/lib/utils"
import SetupPanel from "@/components/SetupPanel"
import TimelineBadge from "@/components/TimelineBadge"
import MetricsBar from "@/components/MetricsBar"
import StepIndicator from "@/components/StepIndicator"
import NewsBriefing from "@/components/NewsBriefing"
import ChatFeed from "@/components/ChatFeed"
import TradeHistory from "@/components/TradeHistory"
import PortfolioChart from "@/components/PortfolioChart"
import FinalSummary from "@/components/FinalSummary"

export default function Home() {
  const { state, config, setConfig, startChallenge, runDay, reset } = useSimulation()

  const prevIsStarted = useRef(false)

  // Auto-run first day after challenge starts
  useEffect(() => {
    if (state.isStarted && !prevIsStarted.current && !state.isRunning && state.day === 0) {
      prevIsStarted.current = true
      runDay()
    }
  }, [state.isStarted, state.isRunning, state.day, runDay])

  const currentSimDate = state.isStarted
    ? addDays(config.startDate, Math.max(0, state.day - 1))
    : config.startDate
  const currentSimDateISO = toISO(currentSimDate)
  const era = getEra(state.isStarted ? currentSimDateISO : toISO(config.startDate))
  const nextDayNum = state.day + 1

  const canRunNextDay =
    state.isStarted &&
    !state.isRunning &&
    !state.isFinished &&
    state.day < config.duration

  const headerDateLabel = state.isStarted
    ? formatDateLabel(currentSimDate)
    : formatDateLabel(config.startDate)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              <span className="text-blue-600 dark:text-blue-400">Cripto</span>
              <span className="text-emerald-600 dark:text-emerald-400">bro</span>
              <span className="text-gray-400 dark:text-gray-600 font-normal text-sm ml-2">
                · Agente vs Oráculo
              </span>
            </h1>
            {state.isStarted && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Día {state.day}/{config.duration} · {headerDateLabel} · 08:00 CLT
              </p>
            )}
          </div>
          <TimelineBadge
            eraLabel={era.label}
            eraType={era.type}
            day={state.day}
            totalDays={config.duration}
          />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* Setup + Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1">
            <SetupPanel
              config={config}
              setConfig={setConfig}
              disabled={state.isStarted}
            />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-4">
            <MetricsBar state={state} totalDays={config.duration} />

            {!state.isStarted && (
              <button
                onClick={startChallenge}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-colors shadow-sm"
              >
                ▶ Iniciar Desafío — $100 USD
              </button>
            )}

            {state.isStarted && !state.isFinished && (
              <button
                onClick={runDay}
                disabled={!canRunNextDay}
                className={`w-full py-3 rounded-xl font-bold text-base transition-all shadow-sm ${
                  canRunNextDay
                    ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                }`}
              >
                {state.isRunning
                  ? "⏳ Simulando día..."
                  : `▶ Día ${nextDayNum} / ${config.duration}`}
              </button>
            )}

            {state.isFinished && (
              <button
                disabled
                className="w-full py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 font-bold text-base cursor-not-allowed"
              >
                ✓ Desafío completado
              </button>
            )}
          </div>
        </div>

        {/* Step indicator */}
        {state.isStarted && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
            <StepIndicator currentStep={state.currentStep} />
          </div>
        )}

        {/* News Briefing */}
        {state.isStarted && (
          <NewsBriefing
            briefing={state.currentBriefing}
            sentiment={state.currentSentiment}
            simDate={currentSimDate}
            visible={!!state.currentBriefing}
          />
        )}

        {/* Chat + Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3">
            <ChatFeed messages={state.messages} />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <PortfolioChart
              history={state.history}
              startPortfolio={state.startPortfolio}
            />
            {state.isStarted && (
              <button
                onClick={reset}
                className="w-full py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
              >
                ↺ Reiniciar
              </button>
            )}
          </div>
        </div>

        {/* Trade history */}
        <TradeHistory history={state.history} />

        {/* Final summary */}
        {state.isFinished && (
          <FinalSummary state={state} onReset={reset} />
        )}
      </main>
    </div>
  )
}
