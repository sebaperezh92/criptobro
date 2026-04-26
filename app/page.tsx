"use client"

import { useEffect, useRef, useState } from "react"
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
import DailyPnLChart from "@/components/DailyPnLChart"
import FinalSummary from "@/components/FinalSummary"

const AUTO_DELAY_MS = 1500 // pausa entre días en modo automático

export default function Home() {
  const { state, config, setConfig, startChallenge, runDay, reset } = useSimulation()

  const [autoRun, setAutoRun] = useState(false)
  const autoRunRef = useRef(false)
  const prevIsStarted = useRef(false)

  // Primer día: se dispara al iniciar (tanto auto como manual)
  useEffect(() => {
    if (state.isStarted && !prevIsStarted.current && !state.isRunning && state.day === 0) {
      prevIsStarted.current = true
      runDay()
    }
  }, [state.isStarted, state.isRunning, state.day, runDay])

  // Auto-run: cada vez que termina un día, programa el siguiente
  useEffect(() => {
    if (!autoRunRef.current) return
    if (!state.isStarted || state.isRunning || state.isFinished) return
    if (state.day === 0 || state.day >= config.duration) return

    const timer = setTimeout(() => {
      if (autoRunRef.current) runDay()
    }, AUTO_DELAY_MS)

    return () => clearTimeout(timer)
  }, [state.day, state.isRunning, state.isFinished, state.isStarted, config.duration, runDay])

  // Detener auto-run al terminar
  useEffect(() => {
    if (state.isFinished) {
      autoRunRef.current = false
      setAutoRun(false)
    }
  }, [state.isFinished])

  function handleStartAuto() {
    autoRunRef.current = true
    setAutoRun(true)
    prevIsStarted.current = false
    startChallenge()
  }

  function handleStartManual() {
    autoRunRef.current = false
    setAutoRun(false)
    prevIsStarted.current = false
    startChallenge()
  }

  function handlePause() {
    autoRunRef.current = false
    setAutoRun(false)
  }

  function handleResume() {
    autoRunRef.current = true
    setAutoRun(true)
    if (!state.isRunning && state.day < config.duration) {
      runDay()
    }
  }

  function handleReset() {
    autoRunRef.current = false
    setAutoRun(false)
    prevIsStarted.current = false
    reset()
  }

  const currentSimDate = state.isStarted
    ? addDays(config.startDate, Math.max(0, state.day - 1))
    : config.startDate
  const currentSimDateISO = toISO(currentSimDate)
  const era = getEra(state.isStarted ? currentSimDateISO : toISO(config.startDate))
  const nextDayNum = state.day + 1

  const canRunNextDay =
    state.isStarted && !state.isRunning && !state.isFinished && state.day < config.duration

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
                {autoRun && !state.isFinished && (
                  <span className="ml-2 text-blue-500 dark:text-blue-400 animate-pulse">
                    ● auto
                  </span>
                )}
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
        {/* Setup + Metrics + Buttons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1">
            <SetupPanel config={config} setConfig={setConfig} disabled={state.isStarted} />
          </div>
          <div className="lg:col-span-2 flex flex-col gap-4">
            <MetricsBar state={state} totalDays={config.duration} />

            {/* Botones de inicio */}
            {!state.isStarted && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleStartAuto}
                  className="py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors shadow-sm"
                >
                  ⚡ Auto — $100 USD
                </button>
                <button
                  onClick={handleStartManual}
                  className="py-3 rounded-xl border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-bold text-sm transition-colors"
                >
                  👆 Paso a paso
                </button>
              </div>
            )}

            {/* Controles durante la simulación */}
            {state.isStarted && !state.isFinished && (
              <div className="flex gap-3">
                {/* Modo auto: mostrar pausa/continuar */}
                {autoRun ? (
                  <button
                    onClick={handlePause}
                    className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-colors"
                  >
                    ⏸ Pausar
                  </button>
                ) : (
                  <button
                    onClick={handleResume}
                    disabled={state.isRunning}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-colors ${
                      state.isRunning
                        ? "bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {state.isRunning
                      ? "⏳ Simulando..."
                      : autoRun
                      ? "⚡ Continuar auto"
                      : `▶ Día ${nextDayNum} / ${config.duration}`}
                  </button>
                )}

                {/* Botón manual siempre disponible si no está corriendo */}
                {!autoRun && !state.isRunning && (
                  <button
                    onClick={handleResume}
                    title="Activar modo automático"
                    className="px-4 py-3 rounded-xl border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                  >
                    ⚡ Auto
                  </button>
                )}

                <button
                  onClick={handleReset}
                  className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-sm hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-400 transition-colors"
                >
                  ↺
                </button>
              </div>
            )}

            {state.isFinished && (
              <div className="flex gap-3">
                <button
                  disabled
                  className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 font-bold text-sm cursor-not-allowed"
                >
                  ✓ Desafío completado
                </button>
                <button
                  onClick={handleReset}
                  className="px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-sm hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  ↺ Nuevo
                </button>
              </div>
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

        {/* Chat + Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3">
            <ChatFeed messages={state.messages} />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <PortfolioChart
              history={state.history}
              startPortfolio={state.startPortfolio}
            />
            <DailyPnLChart history={state.history} />
          </div>
        </div>

        {/* Trade history */}
        <TradeHistory history={state.history} />

        {/* Final summary */}
        {state.isFinished && <FinalSummary state={state} onReset={handleReset} />}
      </main>
    </div>
  )
}
