"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, HelpCircle, Mail, ShieldAlert } from "lucide-react";

const SUPPORT_EMAIL = "ecmixnegocios@gmail.com";

export default function SuportePage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-12 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006e2a] hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Voltar ao início
      </Link>

      <section className="rounded-2xl bg-white border border-[#0F1A24]/8 shadow-[var(--shadow-level-1)] p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF9EF] text-[#006e2a] text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            Central de Ajuda
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#0F1A24]">
            Contato e Suporte
          </h1>
          <p className="text-xs sm:text-sm text-[#3d4a3c] leading-relaxed">
            Precisa de ajuda com seu cadastro, quer tirar alguma dúvida, relatar um problema ou enviar uma sugestão? Fale diretamente com nossa equipe.
          </p>
        </div>

        <div className="rounded-xl bg-[#F6F8FC] border border-[#0F1A24]/10 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#00B048]/15 text-[#006e2a] flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#3d4a3c]">
                E-mail oficial de suporte
              </p>
              <p className="font-display font-bold text-sm sm:text-base text-[#0F1A24] truncate">
                {SUPPORT_EMAIL}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Suporte — Combinado")}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#00B048] hover:bg-[#006e2a] text-white text-xs sm:text-sm font-semibold transition-colors"
            >
              <Mail className="w-4 h-4" />
              Enviar e-mail agora
            </a>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full border border-[#0F1A24]/15 bg-white hover:bg-slate-50 text-[#121d27] text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#00B048]" />
                  E-mail copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar e-mail
                </>
              )}
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-orange-50/70 border border-orange-200/80 p-4 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
          <p className="text-xs text-[#121d27] leading-relaxed">
            Para agilizar o atendimento, informe no e-mail o seu <strong>nome cadastrado</strong>, o <strong>WhatsApp</strong> da conta e uma breve descrição do que você precisa.
          </p>
        </div>
      </section>
    </div>
  );
}
