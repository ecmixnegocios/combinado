"use client";

import React from "react";

export type ThermometerLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface LevelConfig {
  level: ThermometerLevel;
  label: string;
  shortLabel: string;
  description: string;
  bgClass: string;
  textClass: string;
  arrowColorClass: string;
  badgeClass: string;
}

export const THERMOMETER_LEVELS: Record<ThermometerLevel, LevelConfig> = {
  0: {
    level: 0,
    label: "Novo",
    shortLabel: "Novo no catálogo",
    description: "Sem histórico suficiente",
    bgClass: "bg-slate-300",
    textClass: "text-slate-600",
    arrowColorClass: "border-t-slate-400",
    badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
  },
  1: {
    level: 1,
    label: "Péssimo",
    shortLabel: "Reputação crítica",
    description: "Muitas reclamações",
    bgClass: "bg-[#dc2626]",
    textClass: "text-[#b91c1c]",
    arrowColorClass: "border-t-[#dc2626]",
    badgeClass: "bg-red-50 text-[#b91c1c] border-red-200",
  },
  2: {
    level: 2,
    label: "Ruim",
    shortLabel: "Precisa melhorar",
    description: "Abaixo do esperado",
    bgClass: "bg-[#f97316]",
    textClass: "text-[#c2410c]",
    arrowColorClass: "border-t-[#f97316]",
    badgeClass: "bg-orange-50 text-[#c2410c] border-orange-200",
  },
  3: {
    level: 3,
    label: "Regular",
    shortLabel: "Em evolução",
    description: "Entregas regulares",
    bgClass: "bg-[#eab308]",
    textClass: "text-[#a16207]",
    arrowColorClass: "border-t-[#eab308]",
    badgeClass: "bg-amber-50 text-[#a16207] border-amber-200",
  },
  4: {
    level: 4,
    label: "Bom",
    shortLabel: "Bom profissional",
    description: "Bom atendimento",
    bgClass: "bg-[#84cc16]",
    textClass: "text-[#4d7c0f]",
    arrowColorClass: "border-t-[#84cc16]",
    badgeClass: "bg-lime-50 text-[#4d7c0f] border-lime-200",
  },
  5: {
    level: 5,
    label: "Excelente",
    shortLabel: "Excelente profissional",
    description: "Excelente histórico",
    bgClass: "bg-[#00A650]",
    textClass: "text-[#006e2a]",
    arrowColorClass: "border-t-[#00A650]",
    badgeClass: "bg-[#00B048]/12 text-[#006e2a] border-[#00B048]/30",
  },
};

const STEPS: ThermometerLevel[] = [1, 2, 3, 4, 5];

export function getThermometerLevel(
  ratingAvg: number,
  reviewsCount: number
): ThermometerLevel {
  if (reviewsCount <= 0) return 0;
  if (ratingAvg >= 4.5) return 5;
  if (ratingAvg >= 3.8) return 4;
  if (ratingAvg >= 3.0) return 3;
  if (ratingAvg >= 2.0) return 2;
  return 1;
}

/**
 * Régua de Cores com Seta Indicadora (Estilo Mercado Livre).
 */
export function ReputationThermometer({
  ratingAvg,
  reviewsCount,
  size = "compact",
  fullWidth = false,
}: {
  ratingAvg: number;
  reviewsCount: number;
  size?: "compact" | "detailed";
  fullWidth?: boolean;
}) {
  const activeLevel = getThermometerLevel(ratingAvg, reviewsCount);
  const info = THERMOMETER_LEVELS[activeLevel];
  const maxWidth = fullWidth
    ? "w-full"
    : size === "detailed"
    ? "max-w-[300px]"
    : "max-w-[240px]";

  return (
    <div className={`space-y-1 ${maxWidth}`}>
      {/* Seta indicadora acima da faixa */}
      <div className="grid grid-cols-5 gap-1.5 h-3 items-end">
        {STEPS.map((lvl) => (
          <div key={lvl} className="flex justify-center">
            {activeLevel === lvl && (
              <span
                className={`w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] drop-shadow-sm ${info.arrowColorClass}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* 5 blocos: faixa selecionada forte e destacada */}
      <div className="grid grid-cols-5 gap-1.5 items-center h-4">
        {STEPS.map((lvl) => {
          const step = THERMOMETER_LEVELS[lvl];
          const isCurrent = activeLevel === lvl;
          return (
            <div
              key={lvl}
              className={`rounded-full transition-all duration-300 ${
                activeLevel === 0
                  ? "h-2 bg-slate-200"
                  : isCurrent
                  ? `h-3.5 ${step.bgClass} opacity-100 shadow-md ring-2 ring-offset-1 ring-[#0F1A24]/25`
                  : `h-2 ${step.bgClass} opacity-20`
              }`}
            />
          );
        })}
      </div>

      {/* Rótulo + contagem de avaliações */}
      <div className="flex items-center justify-between gap-2 text-xs pt-0.5">
        <span className={`font-display font-bold ${info.textClass}`}>
          {info.shortLabel}
        </span>
        <span className="text-[11px] text-[#3d4a3c]/80 shrink-0">
          {reviewsCount > 0
            ? `(${reviewsCount} ${reviewsCount === 1 ? "avaliação" : "avaliações"})`
            : "(Sem avaliações)"}
        </span>
      </div>
    </div>
  );
}

/**
 * Seletor de avaliação em 5 faixas de cor (substitui as 5 estrelinhas ao avaliar).
 */
export function ReputationLevelSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (level: number) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {STEPS.map((lvl) => {
        const step = THERMOMETER_LEVELS[lvl];
        const selected = value === lvl;
        return (
          <button
            key={lvl}
            type="button"
            onClick={() => onChange(lvl)}
            className={`flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border text-center transition-all cursor-pointer ${
              selected
                ? `${step.badgeClass} ring-2 ring-offset-1 ring-[#0F1A24]/20 shadow-sm scale-[1.03]`
                : "bg-[#F6F8FC] border-[#0F1A24]/10 text-[#3d4a3c] hover:bg-slate-100"
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full ${step.bgClass} ${
                selected ? "opacity-100" : "opacity-60"
              }`}
            />
            <span className="font-display font-bold text-[11px] leading-tight">
              {step.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
