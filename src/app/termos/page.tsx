import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-12 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006e2a] hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Voltar ao início
      </Link>

      <article className="rounded-2xl bg-white border border-[#0F1A24]/8 shadow-[var(--shadow-level-1)] p-6 sm:p-8 space-y-6">
        <div className="space-y-2 border-b border-[#0F1A24]/8 pb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF9EF] text-[#006e2a] text-xs font-bold">
            <FileText className="w-3.5 h-3.5" />
            Regras de Uso da Plataforma
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#0F1A24]">
            Termos e Condições de Uso
          </h1>
          <p className="text-xs text-[#3d4a3c]">
            Última atualização: novembro de 2026
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-base text-[#0F1A24]">
            1. O papel do Combinado
          </h2>
          <p className="text-xs sm:text-sm text-[#3d4a3c] leading-relaxed">
            O Combinado atua exclusivamente como um catálogo digital que facilita o encontro entre clientes e prestadores de serviços locais via WhatsApp. Não intermediamos pagamentos, não cobramos comissões sobre os serviços e não somos responsáveis pela execução, prazo ou garantia dos trabalhos combinados entre as partes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-base text-[#0F1A24]">
            2. Cadastro e responsabilidade dos usuários
          </h2>
          <ul className="text-xs sm:text-sm text-[#121d27] space-y-1.5 list-disc list-inside leading-relaxed">
            <li>Os usuários comprometem-se a informar dados verdadeiros, atualizados e um número de WhatsApp válido.</li>
            <li>Prestadores de serviço devem utilizar foto real e descrever com clareza as atividades que realizam e os bairros atendidos.</li>
            <li>É proibido criar contas falsas, usar dados ou CPF de terceiros ou divulgar conteúdo ilícito, ofensivo ou enganoso.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-base text-[#0F1A24]">
            3. Avaliações e moderação
          </h2>
          <p className="text-xs sm:text-sm text-[#3d4a3c] leading-relaxed">
            Para manter a qualidade do catálogo, clientes e profissionais podem se avaliar mutuamente após o contato. Comentários ofensivos, caluniosos ou que violem estes Termos podem ser removidos pela moderação, e contas envolvidas em má conduta ou fraude podem ser suspensas.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-base text-[#0F1A24]">
            4. Privacidade e contato
          </h2>
          <p className="text-xs sm:text-sm text-[#3d4a3c] leading-relaxed">
            O tratamento dos dados pessoais segue nossa{" "}
            <Link href="/privacidade" className="text-[#006e2a] font-semibold hover:underline">
              Política de Privacidade
            </Link>
            . Em caso de dúvidas ou denúncias, entre em contato pelo e-mail{" "}
            <a
              href="mailto:ecmixnegocios@gmail.com"
              className="text-[#006e2a] font-semibold hover:underline"
            >
              ecmixnegocios@gmail.com
            </a>
            .
          </p>
        </section>
      </article>
    </div>
  );
}
