"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock,
  HelpCircle,
  MapPin,
  ShieldAlert,
  User,
  UserCheck,
  Wrench,
  X,
} from "lucide-react";
import { useApp } from "./AppProvider";

export function Header() {
  const {
    currentUser,
    currentProviderDetails,
    pendingReviews,
    openAuthModal,
    toggleAvailability,
  } = useApp();

  const [howItWorksOpen, setHowItWorksOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#0F1A24]/8 shadow-[var(--shadow-level-1)]">
        {/* Mini-barra superior da cidade + Como funciona */}
        <div className="bg-[#0F1A24] text-white">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-1.5 flex items-center justify-between gap-3 text-[11px]">
            <span className="inline-flex items-center gap-1.5 font-medium text-white/90 truncate">
              <MapPin className="w-3 h-3 text-[#7ED957] shrink-0" />
              <span className="truncate">
                Catálogo exclusivo de <strong className="text-white">Boa Vista - RR</strong>
              </span>
            </span>

            <button
              type="button"
              onClick={() => setHowItWorksOpen(true)}
              className="inline-flex items-center gap-1 font-semibold text-[#FDBA74] hover:underline cursor-pointer shrink-0"
            >
              <HelpCircle className="w-3 h-3" />
              <span>Como funciona?</span>
            </button>
          </div>
        </div>

        {/* Barra principal */}
        <div className="max-w-[1240px] mx-auto px-3 sm:px-6 h-15 sm:h-[68px] flex items-center justify-between gap-2">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 group">
            <img
              src="/brand/logo-v1.png"
              alt="Combinado"
              className="h-9 sm:h-11 w-auto max-w-[155px] sm:max-w-none object-contain group-hover:scale-[1.02] transition-transform"
            />
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {currentUser?.is_admin && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-[#0F1A24] text-white hover:bg-[#1e2d3b] transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-[#7ED957]" />
                Admin
              </Link>
            )}

            {currentUser?.is_provider && currentProviderDetails ? (
              <button
                type="button"
                onClick={toggleAvailability}
                title={
                  currentProviderDetails.is_available
                    ? "Clique para marcar como Ocupado"
                    : "Clique para ficar Disponível"
                }
                className={`inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                  currentProviderDetails.is_available
                    ? "bg-[#00B048]/12 text-[#006e2a] border-[#00B048]/30 hover:bg-[#00B048]/20"
                    : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                }`}
              >
                {currentProviderDetails.is_available ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-[#00B048] animate-pulse" />
                    <span>Disponível</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Ocupado</span>
                  </>
                )}
                <span
                  className={`ml-0.5 w-7 h-4 rounded-full p-0.5 transition-colors flex items-center ${
                    currentProviderDetails.is_available
                      ? "bg-[#00B048] justify-end"
                      : "bg-amber-400 justify-start"
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-white shadow-sm" />
                </span>
              </button>
            ) : (
              <Link
                href="/painel?modo=prestador"
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-sm font-semibold bg-[#EA580C] hover:bg-[#C2410C] text-white shadow-sm hover:scale-[1.02] transition-all whitespace-nowrap"
              >
                <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4 hidden sm:inline" />
                <span>Oferecer Serviços</span>
              </Link>
            )}

            {currentUser ? (
              <Link
                href="/painel"
                title={currentUser.display_name}
                aria-label={`Meu painel (${currentUser.display_name})`}
                className="relative inline-flex items-center sm:gap-2 p-1 sm:pl-1.5 sm:pr-3 sm:py-1 rounded-full border border-[#0F1A24]/12 bg-[#F6F8FC] hover:bg-[#edf4ff] transition-colors shrink-0"
              >
                {currentUser.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.display_name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="w-7 h-7 rounded-full bg-[#00B048]/15 text-[#006e2a] flex items-center justify-center text-xs font-bold">
                    {currentUser.display_name.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="hidden sm:inline text-sm font-semibold text-[#121d27] max-w-[140px] truncate">
                  {currentUser.display_name.split(" ")[0]}
                </span>
                {pendingReviews.length > 0 && (
                  <span
                    title="Avaliações pendentes"
                    className="absolute -top-0.5 -right-0.5 sm:static w-2.5 h-2.5 rounded-full bg-[#EA580C] ring-2 ring-white"
                  />
                )}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal()}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-sm font-semibold border border-[#0F1A24]/15 text-[#121d27] bg-white hover:bg-[#F6F8FC] transition-colors cursor-pointer whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#006e2a]" />
                <span>Entrar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Modal "Como funciona" */}
      {howItWorksOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="how-it-works-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#050C16]/70 backdrop-blur-sm"
          onClick={() => setHowItWorksOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-[var(--shadow-level-3)] space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h2
                id="how-it-works-title"
                className="font-display font-bold text-xl text-[#0F1A24]"
              >
                Como funciona o Combinado
              </h2>
              <button
                type="button"
                onClick={() => setHowItWorksOpen(false)}
                aria-label="Fechar"
                className="p-1.5 rounded-full hover:bg-slate-100 text-[#3d4a3c] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl bg-[#EBF9EF] border border-[#00B048]/25 p-4 space-y-2.5">
                <div className="flex items-start gap-2 font-display font-bold text-sm text-[#006e2a] leading-snug">
                  <UserCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Para quem quer contratar!</span>
                </div>
                <ol className="text-xs text-[#121d27] space-y-2 list-decimal list-inside leading-relaxed">
                  <li>Escolha a categoria do profissional que você precisa.</li>
                  <li>
                    Navegue entre as opções de profissionais e confira o{" "}
                    <strong>termômetro de avaliação</strong>.
                  </li>
                  <li>
                    Viu que está disponível? Clique no <strong>WhatsApp</strong>{" "}
                    dele e pronto!
                  </li>
                </ol>
              </div>

              <div className="rounded-xl bg-orange-50 border border-orange-200 p-4 space-y-2.5">
                <div className="flex items-start gap-2 font-display font-bold text-sm text-[#C2410C] leading-snug">
                  <Wrench className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Para quem quer oferecer serviços!</span>
                </div>
                <ol className="text-xs text-[#121d27] space-y-2 list-decimal list-inside leading-relaxed">
                  <li>Cadastre-se no Combinado com seus dados e uma foto real.</li>
                  <li>
                    Descreva os serviços que faz e marque seu perfil como{" "}
                    <strong>Disponível</strong>.
                  </li>
                  <li>
                    E pronto: comece a receber clientes direto no{" "}
                    <strong>WhatsApp</strong>!
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
