"use client";

import { useState } from "react";
import {
  Briefcase,
  Check,
  Copy,
  MessageCircle,
  Share2,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react";
import { useApp } from "./AppProvider";

type ShareMode = "client" | "provider";

export function SharePlatformWidget() {
  const { currentUser } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [manualMode, setManualMode] = useState<ShareMode | null>(null);
  const [copied, setCopied] = useState(false);
  const mode: ShareMode = manualMode ?? (currentUser?.is_provider ? "provider" : "client");
  const siteUrl =
    typeof window !== "undefined" ? window.location.origin : "https://combinado.app";
  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const messages: Record<ShareMode, string> = {
    client: `Oi! Estou usando a plataforma Combinado e é ótima para encontrar profissionais locais avaliados pela vizinhança (pedreiro, eletricista, diarista, refrigeração e muito mais). Dá uma olhada: ${siteUrl}`,
    provider: `Oi! Estou usando o Combinado para divulgar meu trabalho e conseguir mais serviços direto pelo WhatsApp, com avaliação justa dos clientes. Faz seu cadastro lá também: ${siteUrl}`,
  };

  const activeMessage = messages[mode];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(activeMessage)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = async () => {
    if (!canNativeShare) return;
    try {
      await navigator.share({
        title: "Combinado — Serviços Locais com Confiança",
        text: activeMessage,
        url: siteUrl,
      });
    } catch {
      // user cancelled
    }
  };

  return (
    <>
      {/* Botão flutuante discreto no canto inferior direito */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Compartilhar o Combinado"
        className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40 inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-full bg-[#0F1A24] hover:bg-[#1e2d3b] text-white font-display font-bold text-xs shadow-[var(--shadow-level-3)] border border-white/15 hover:scale-[1.03] transition-all cursor-pointer group"
      >
        <span className="w-5 h-5 rounded-full bg-[#00B048] flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform">
          <Share2 className="w-3 h-3 text-white" />
        </span>
        <span>Combinado</span>
      </button>

      {/* Modal de Compartilhamento com CTA */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-platform-title"
          className="fixed inset-0 z-[95] flex items-center justify-center p-4 bg-[#050C16]/70 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-[var(--shadow-level-3)] border border-[#0F1A24]/10 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-[#00B048]/12 text-[#006e2a] flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h2
                    id="share-platform-title"
                    className="font-display font-bold text-lg text-[#0F1A24] leading-snug"
                  >
                    Compartilhe o Combinado com quem você conhece
                  </h2>
                  <p className="text-xs text-[#3d4a3c] mt-1 leading-relaxed">
                    Ajude amigos a encontrar profissionais com boas referências ou a conseguir novos trabalhos na região.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-[#3d4a3c] cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Seletor de perfil da mensagem */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#F6F8FC] border border-[#0F1A24]/8">
              <button
                type="button"
                onClick={() => setManualMode("client")}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === "client"
                    ? "bg-white text-[#006e2a] shadow-xs"
                    : "text-[#3d4a3c] hover:text-[#0F1A24]"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                Para quem contrata
              </button>
              <button
                type="button"
                onClick={() => setManualMode("provider")}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === "provider"
                    ? "bg-white text-[#EA580C] shadow-xs"
                    : "text-[#3d4a3c] hover:text-[#0F1A24]"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                Para profissionais
              </button>
            </div>

            {/* Prévia da mensagem pronta */}
            <div className="rounded-xl bg-[#F6F8FC] border border-[#0F1A24]/10 p-3.5 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#3d4a3c]">
                Mensagem pronta para enviar:
              </p>
              <p className="text-xs sm:text-sm text-[#121d27] leading-relaxed">
                &ldquo;{activeMessage}&rdquo;
              </p>
            </div>

            {/* Botões de ação */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="w-full py-3 px-4 rounded-full bg-[#00B048] hover:bg-[#006e2a] text-white font-display font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                Enviar no WhatsApp
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 py-2.5 px-4 rounded-full bg-[#0F1A24] hover:bg-[#1e2d3b] text-white font-display font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#7ED957]" />
                      Mensagem copiada!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copiar mensagem
                    </>
                  )}
                </button>

                {canNativeShare && (
                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="py-2.5 px-4 rounded-full border border-[#0F1A24]/15 bg-white hover:bg-slate-50 text-[#121d27] font-display font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Mais opções
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
