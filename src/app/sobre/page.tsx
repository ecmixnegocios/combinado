import Link from "next/link";
import { ArrowLeft, CheckCircle2, HeartHandshake, MapPin, ShieldCheck, Wrench } from "lucide-react";

export default function SobrePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-12 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006e2a] hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Voltar ao início
      </Link>

      <section className="rounded-2xl bg-white border border-[#0F1A24]/8 shadow-[var(--shadow-level-1)] p-6 sm:p-8 space-y-5">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF9EF] text-[#006e2a] text-xs font-bold">
            <MapPin className="w-3.5 h-3.5" />
            Boa Vista - RR
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#0F1A24]">
            Sobre o Combinado
          </h1>
          <p className="text-sm sm:text-base text-[#3d4a3c] leading-relaxed">
            <strong>Conectando quem precisa a quem faz.</strong> O Combinado nasceu para facilitar a
            contratação de profissionais locais de confiança de um jeito simples, rápido e direto no WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="rounded-xl bg-[#F6F8FC] border border-[#0F1A24]/8 p-4 space-y-1.5">
            <div className="flex items-center gap-2 font-display font-bold text-sm text-[#006e2a]">
              <ShieldCheck className="w-4 h-4" />
              Confiança na vizinhança
            </div>
            <p className="text-xs text-[#3d4a3c] leading-relaxed">
              Cada profissional tem um termômetro de reputação baseado em avaliações reais de quem já contratou.
            </p>
          </div>

          <div className="rounded-xl bg-[#F6F8FC] border border-[#0F1A24]/8 p-4 space-y-1.5">
            <div className="flex items-center gap-2 font-display font-bold text-sm text-[#EA580C]">
              <HeartHandshake className="w-4 h-4" />
              Contato direto e sem taxas
            </div>
            <p className="text-xs text-[#3d4a3c] leading-relaxed">
              Você negocia diretamente pelo WhatsApp com o profissional, sem intermediários nem comissões escondidas.
            </p>
          </div>
        </div>

        <div className="space-y-2.5 pt-2">
          <h2 className="font-display font-bold text-base text-[#0F1A24]">
            Por que usar o Combinado?
          </h2>
          <ul className="space-y-2 text-xs sm:text-sm text-[#121d27]">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00B048] shrink-0 mt-0.5" />
              <span>Busca rápida por categoria de serviço e bairro em Boa Vista.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00B048] shrink-0 mt-0.5" />
              <span>Avaliação mútua entre cliente e profissional para manter a qualidade.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00B048] shrink-0 mt-0.5" />
              <span>Cadastro simples para profissionais divulgarem seu trabalho e receberem clientes no WhatsApp.</span>
            </li>
          </ul>
        </div>

        <div className="pt-3 border-t border-[#0F1A24]/8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#00B048] hover:bg-[#006e2a] text-white text-xs sm:text-sm font-semibold transition-colors"
          >
            Buscar profissionais
          </Link>
          <Link
            href="/painel?modo=prestador"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs sm:text-sm font-semibold transition-colors"
          >
            <Wrench className="w-4 h-4" />
            Oferecer serviços
          </Link>
        </div>
      </section>
    </div>
  );
}
