"use client";

import { useEffect, useState } from "react";
import { Download, MoreVertical, Share, X } from "lucide-react";

const DISMISS_STORAGE_KEY = "combinado_pwa_dismissed_until";
const DISMISS_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

export function PwaInstallBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const isStandalone =
          window.matchMedia("(display-mode: standalone)").matches ||
          Boolean((navigator as { standalone?: boolean }).standalone);
        if (isStandalone) return;

        const rawUntil = localStorage.getItem(DISMISS_STORAGE_KEY);
        if (rawUntil && Number(rawUntil) > Date.now()) return;

        setVisible(true);
      } catch {
        // ignore storage/media errors
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(
        DISMISS_STORAGE_KEY,
        String(Date.now() + DISMISS_DAYS_MS)
      );
    } catch {
      // ignore storage errors
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-16 left-3 right-3 z-30 md:hidden">
      <div className="rounded-xl bg-[#0F1A24]/95 backdrop-blur-md text-white px-3 py-2.5 shadow-[var(--shadow-level-2)] border border-white/10 flex items-center gap-2.5">
        <span className="w-8 h-8 rounded-lg bg-[#00B048] flex items-center justify-center shrink-0">
          <Download className="w-4 h-4" />
        </span>

        <div className="flex-1 min-w-0">
          <p className="font-display font-semibold text-xs leading-tight">
            Instalar app na Tela Inicial
          </p>
          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
            Toque em <MoreVertical className="w-3 h-3 inline text-[#7ED957]" /> ou{" "}
            <Share className="w-3 h-3 inline text-[#7ED957]" /> e escolha{" "}
            <strong className="text-white">Adicionar à Tela de Início</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Fechar aviso"
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
