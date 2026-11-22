import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";

export default function PrivacidadePage() {
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
            <ShieldCheck className="w-3.5 h-3.5" />
            Transparência e Proteção de Dados
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#0F1A24]">
            Política de Privacidade
          </h1>
          <p className="text-xs text-[#3d4a3c]">
            Última atualização: novembro de 2026
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-base text-[#0F1A24]">
            1. Dados que coletamos
          </h2>
          <p className="text-xs sm:text-sm text-[#3d4a3c] leading-relaxed">
            Para conectar clientes e profissionais com segurança, coletamos apenas os dados necessários ao funcionamento da plataforma:
          </p>
          <ul className="text-xs sm:text-sm text-[#121d27] space-y-1.5 list-disc list-inside leading-relaxed">
            <li>Nome completo, nome de exibição, e-mail, número de WhatsApp e foto de perfil (opcional).</li>
            <li>Para profissionais: CPF (usado exclusivamente para validação de cadastro único), descrição dos serviços, tempo de experiência e bairros atendidos.</li>
            <li>Registros de contato e avaliações realizadas dentro da plataforma.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-base text-[#0F1A24]">
            2. Como protegemos e usamos seus dados
          </h2>
          <ul className="text-xs sm:text-sm text-[#121d27] space-y-1.5 list-disc list-inside leading-relaxed">
            <li>
              <strong>CPF nunca é exibido publicamente:</strong> ele fica protegido e é utilizado apenas para evitar cadastros duplicados e aumentar a segurança.
            </li>
            <li>
              <strong>WhatsApp protegido:</strong> o número de WhatsApp dos profissionais só é liberado para usuários autenticados no momento do contato.
            </li>
            <li>
              <strong>Avaliações públicas:</strong> comentários e notas ajudam a comunidade a contratar com mais confiança.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-base text-[#0F1A24] flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-[#006e2a]" />
            3. Armazenamento e segurança
          </h2>
          <p className="text-xs sm:text-sm text-[#3d4a3c] leading-relaxed">
            Os dados são armazenados com criptografia e controle de acesso por linha (Row Level Security). Não vendemos nem compartilhamos suas informações pessoais com terceiros para fins publicitários.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-base text-[#0F1A24]">
            4. Seus direitos (LGPD)
          </h2>
          <p className="text-xs sm:text-sm text-[#3d4a3c] leading-relaxed">
            Você pode atualizar seus dados a qualquer momento pelo{" "}
            <Link href="/painel" className="text-[#006e2a] font-semibold hover:underline">
              Meu Painel
            </Link>{" "}
            ou solicitar a exclusão da sua conta e dados pessoais entrando em contato pelo nosso suporte:{" "}
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
