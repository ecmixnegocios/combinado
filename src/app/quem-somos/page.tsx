import Link from "next/link";
import { ArrowLeft, Compass, Handshake, ShieldCheck, Users } from "lucide-react";

export default function QuemSomosPage() {
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
            <Users className="w-3.5 h-3.5" />
            Nossa História e Propósito
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#0F1A24]">
            Quem Somos
          </h1>
          <p className="text-sm sm:text-base text-[#3d4a3c] leading-relaxed">
            O <strong>Combinado</strong> é uma plataforma local criada para aproximar moradores de{" "}
            <strong>Boa Vista - RR</strong> e profissionais autônomos de confiança, com agilidade e transparência.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl bg-[#F6F8FC] border border-[#0F1A24]/8 p-4 space-y-1.5">
            <Compass className="w-5 h-5 text-[#006e2a]" />
            <h2 className="font-display font-bold text-sm text-[#0F1A24]">
              Nossa Missão
            </h2>
            <p className="text-xs text-[#3d4a3c] leading-relaxed">
              Conectar quem precisa de um serviço rápido a quem faz um trabalho sério e bem avaliado.
            </p>
          </div>

          <div className="rounded-xl bg-[#F6F8FC] border border-[#0F1A24]/8 p-4 space-y-1.5">
            <Handshake className="w-5 h-5 text-[#EA580C]" />
            <h2 className="font-display font-bold text-sm text-[#0F1A24]">
              Valorização Local
            </h2>
            <p className="text-xs text-[#3d4a3c] leading-relaxed">
              Dar visibilidade a pedreiros, eletricistas, diaristas, encanadores e outros prestadores da cidade.
            </p>
          </div>

          <div className="rounded-xl bg-[#F6F8FC] border border-[#0F1A24]/8 p-4 space-y-1.5">
            <ShieldCheck className="w-5 h-5 text-[#00B048]" />
            <h2 className="font-display font-bold text-sm text-[#0F1A24]">
              Reputação Real
            </h2>
            <p className="text-xs text-[#3d4a3c] leading-relaxed">
              Construir confiança na vizinhança através de avaliações mútuas e verdadeiras.
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-[#0F1A24]/8 flex flex-wrap items-center justify-between gap-3 text-xs text-[#3d4a3c]">
          <span>Quer falar com a nossa equipe?</span>
          <Link
            href="/suporte"
            className="font-semibold text-[#006e2a] hover:underline"
          >
            Acessar Contato e Suporte →
          </Link>
        </div>
      </section>
    </div>
  );
}
