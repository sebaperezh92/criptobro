"use client"

interface Props {
  currentStep: 0 | 1 | 2 | 3 | 4
}

const STEPS = [
  { n: 1, label: "Briefing", sub: "Noticias del día" },
  { n: 2, label: "Oráculo pregunta", sub: "Consulta al trader" },
  { n: 3, label: "Trader decide", sub: "Estrategia del día" },
  { n: 4, label: "Resultado", sub: "Evaluación histórica" },
]

export default function StepIndicator({ currentStep }: Props) {
  return (
    <div className="flex items-start justify-between gap-1">
      {STEPS.map((step, i) => {
        const isCompleted = currentStep > step.n
        const isActive = currentStep === step.n
        const isPending = currentStep < step.n && currentStep !== 0

        return (
          <div key={step.n} className="flex flex-col items-center flex-1 min-w-0">
            {/* connector + circle */}
            <div className="flex items-center w-full">
              {i > 0 && (
                <div
                  className={`flex-1 h-0.5 transition-colors ${
                    isCompleted || (currentStep >= step.n)
                      ? "bg-emerald-400"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              )}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                  isCompleted
                    ? "bg-emerald-500 text-white"
                    : isActive
                    ? "bg-blue-500 text-white animate-pulse"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                }`}
              >
                {isCompleted ? "✓" : step.n}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 transition-colors ${
                    currentStep > step.n ? "bg-emerald-400" : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              )}
            </div>
            {/* labels */}
            <div className="mt-1.5 text-center">
              <p
                className={`text-xs font-semibold leading-tight ${
                  isCompleted
                    ? "text-emerald-600 dark:text-emerald-400"
                    : isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {step.label}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-600 hidden sm:block">{step.sub}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
