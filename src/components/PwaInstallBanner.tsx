"use client";

import { useState } from "react";
import { Download, MoreVertical, Share, X } from "lucide-react";

export function PwaInstallBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 z-30 md:hidden">
      <div className="rounded-2xl bg-[#0F1A24] text-white p-3.5 shadow-[var(--shadow-level-3)] border border-white/10 flex items-start gap-3">
        <span className="w-10 h-10 rounded-xl bg-[#00B048] flex items-center justify-center shrink-0">
          <Download className="w-5 h-5" />
        </span>

        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-sm">
            Instalar Aplicativo na Tela Inicial
          </p>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
            Toque nos <MoreVertical className="w-3.5 h-3.5 inline text-[#7ED957]" /> 3 pontinhos
            (ou <Share className="w-3.5 h-3.5 inline text-[#7ED957]" /> Compartilhar) e escolha{" "}
            <strong>Adicionar à Tela de Início</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Fechar aviso"
          className="p-1 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
