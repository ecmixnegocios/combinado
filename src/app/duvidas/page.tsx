"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "O Combinado cobra alguma taxa para contratar ou oferecer serviços?",
    a: "Não. O acesso ao catálogo, o cadastro de profissionais e o contato direto pelo WhatsApp são gratuitos, sem taxas escondidas nem comissão por serviço fechado.",
  },
  {
    q: "Por que preciso entrar na minha conta para ver o WhatsApp do profissional?",
    a: "O login rápido protege os profissionais contra spam e permite registrar o contato para que, depois do atendimento, cliente e profissional possam se avaliar de forma justa.",
  },
  {
    q: "Como funciona o termômetro de avaliação?",
    a: "Cada avaliação recebida atualiza a média do profissional (e também a do cliente). Quanto melhor a avaliação e maior o número de serviços bem avaliados, melhor o destaque no catálogo.",
  },
  {
    q: "Como funciona o status Disponível / Ocupado?",
    a: "O próprio profissional liga ou desliga sua disponibilidade no painel ou no topo do site. Profissionais disponíveis aparecem primeiro; quem está ocupado vai para o final da fila para evitar contatos sem retorno.",
  },
  {
    q: "Meu CPF fica visível para outras pessoas?",
    a: "Nunca. O CPF é usado apenas internamente para evitar perfis duplicados e dar mais segurança à plataforma.",
  },
  {
    q: "Como faço para falar com o suporte ou pedir exclusão da conta?",
    a: "Envie um e-mail para ecmixnegocios@gmail.com informando seu nome e WhatsApp cadastrado que nossa equipe responde o quanto antes.",
  },
];

export default function DuvidasPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-12 space-y-6">
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
            Perguntas e Respostas
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#0F1A24]">
            Dúvidas Frequentes
          </h1>
          <p className="text-xs sm:text-sm text-[#3d4a3c] leading-relaxed">
            Confira as principais respostas sobre como contratar e oferecer serviços no Combinado.
          </p>
        </div>

        <div className="space-y-2.5">
          {FAQS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.q}
                className="rounded-xl border border-[#0F1A24]/10 bg-[#F6F8FC]/60 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left font-display font-semibold text-xs sm:text-sm text-[#0F1A24] hover:bg-[#F6F8FC] transition-colors cursor-pointer"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#006e2a] shrink-0 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs sm:text-sm text-[#3d4a3c] leading-relaxed border-t border-[#0F1A24]/6 pt-3 bg-white">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-[#0F1A24]/8 flex flex-wrap items-center justify-between gap-3 text-xs text-[#3d4a3c]">
          <span>Não encontrou o que procurava?</span>
          <Link
            href="/suporte"
            className="font-semibold text-[#006e2a] hover:underline"
          >
            Falar com o Suporte →
          </Link>
        </div>
      </section>
    </div>
  );
}
