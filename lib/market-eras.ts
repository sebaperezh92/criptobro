import { Era } from "./types"

export const MARKET_ERAS: Era[] = [
  { from: "2020-01-01", to: "2020-03-12", label: "Pre-crash COVID",      type: "flat" },
  { from: "2020-03-13", to: "2020-12-31", label: "Recuperación 2020",    type: "bull" },
  { from: "2021-01-01", to: "2021-04-13", label: "Bull run 2021 Q1",     type: "bull" },
  { from: "2021-04-14", to: "2021-07-20", label: "Corrección mayo 2021", type: "bear" },
  { from: "2021-07-21", to: "2021-11-09", label: "Bull run ATH 2021",    type: "bull" },
  { from: "2021-11-10", to: "2022-06-17", label: "Bear market 2022",     type: "bear" },
  { from: "2022-06-18", to: "2022-11-07", label: "Recuperación parcial", type: "flat" },
  { from: "2022-11-08", to: "2022-12-31", label: "Colapso FTX",          type: "bear" },
  { from: "2023-01-01", to: "2023-12-31", label: "Recuperación 2023",    type: "bull" },
  { from: "2024-01-01", to: "2024-03-14", label: "Pre-halving 2024",     type: "bull" },
  { from: "2024-03-15", to: "2024-08-31", label: "Post-halving lateral", type: "flat" },
  { from: "2024-09-01", to: "2024-12-31", label: "Bull run electoral",   type: "bull" },
  { from: "2025-01-01", to: "2025-03-31", label: "Consolidación 2025",   type: "flat" },
  { from: "2025-04-01", to: "2025-06-30", label: "Corrección Q2 2025",   type: "bear" },
  { from: "2025-07-01", to: "2025-12-31", label: "Recuperación 2025",    type: "bull" },
  { from: "2026-01-01", to: "2026-06-30", label: "Bull run 2026",        type: "bull" },
]

export function getEra(dateISO: string): Era {
  return (
    MARKET_ERAS.find((e) => dateISO >= e.from && dateISO <= e.to) ?? {
      label: "Mercado crypto",
      type: "flat" as const,
      from: dateISO,
      to: dateISO,
    }
  )
}
