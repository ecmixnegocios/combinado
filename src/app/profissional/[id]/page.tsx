"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { useApp } from "@/components/AppProvider";
import {
  ReputationThermometer,
  THERMOMETER_LEVELS,
  ThermometerLevel,
} from "@/components/ReputationThermometer";
import { BackNavigation } from "@/components/BackNavigation";
import { CategoryIcon } from "@/components/CategoryIcon";
import { getCategoryPrefix } from "@/utils/validators";

export default function ProviderProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { getProviderById, currentUser, openAuthModal, unlockProviderWhatsApp } = useApp();
  const [unlockedUrl, setUnlockedUrl] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const provider = getProviderById(id);

  if (!provider) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-12 text-center">
        <h1 className="font-display font-bold text-2xl text-[#121d27]">
          Profissional não encontrado
        </h1>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-full bg-[#00B048] text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Catálogo
        </Link>
      </div>
    );
  }

  const handleWhatsAppClick = async () => {
    setActionError(null);
    if (!currentUser) {
      openAuthModal("Entre em 10 segundos para liberar o WhatsApp deste profissional.");
      return;
    }

    const res = await unlockProviderWhatsApp(provider.id);
    if (!res.ok) {
      if (res.requiresAuth) {
        openAuthModal(res.error);
      } else {
        setActionError(res.error || "Não foi possível liberar o contato.");
      }
      return;
    }

    if (res.url) {
      setUnlockedUrl(res.url);
      window.open(res.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
      <BackNavigation
        backLabel="Voltar"
        extraLink={
          currentUser?.id === provider.id
            ? { href: "/painel", label: "Editar meu perfil no painel" }
            : undefined
        }
      />

      {/* Card Principal do Profissional */}
      <div className="rounded-2xl bg-white border border-[#0F1A24]/8 p-5 sm:p-8 shadow-[var(--shadow-level-1)]">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Foto Grande */}
          <div className="shrink-0 mx-auto sm:mx-0">
            {provider.avatar_url ? (
              <img
                src={provider.avatar_url}
                alt={provider.display_name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover ring-4 ring-[#00B048]/15"
              />
            ) : (
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-[#00B048]/15 text-[#006e2a] flex items-center justify-center font-display font-bold text-4xl">
                {provider.display_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Info Principal */}
          <div className="flex-1 w-full">
            {(() => {
              const primaryCategory = provider.categories[0];
              const otherCategories = provider.categories.slice(1);
              const primaryRoleLabel = getCategoryPrefix(primaryCategory?.name);

              return (
                <>
                  <div>
                    <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#121d27] leading-tight">
                      {provider.full_name || provider.display_name}
                    </h1>

                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      {primaryCategory && (
                        <Link
                          href={`/categoria/${primaryCategory.slug}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0F1A24] text-white hover:bg-[#1e2d3b] transition-colors"
                        >
                          <CategoryIcon
                            name={primaryCategory.icon_name}
                            className="w-3.5 h-3.5 text-[#7ED957]"
                          />
                          {primaryRoleLabel || primaryCategory.name}
                        </Link>
                      )}

                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          provider.is_available
                            ? "bg-[#00B048]/12 text-[#006e2a] border-[#00B048]/25"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {provider.is_available ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-[#00B048] animate-pulse" />
                            Disponível Agora
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Ocupado no momento
                          </>
                        )}
                      </span>

                      {provider.is_verified && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold">
                          <BadgeCheck className="w-4 h-4 text-sky-600" />
                          Identidade Verificada
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Termômetro de Reputação do Profissional */}
                  <div className="mt-4">
                    <ReputationThermometer
                      ratingAvg={provider.pro_rating_avg}
                      reviewsCount={provider.pro_reviews_count}
                      size="detailed"
                    />
                  </div>

                  {otherCategories.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      <span className="text-xs font-medium text-[#3d4a3c]">
                        Também atende:
                      </span>
                      {otherCategories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/categoria/${cat.slug}`}
                          className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-[#121d27]/80 border border-[#0F1A24]/6 hover:bg-slate-200/70 transition-colors"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              );
            })()}

            {/* Metadados: Experiência e Bairros */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 pt-4 border-t border-[#0F1A24]/8">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#00B048] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold uppercase text-[#3d4a3c]">
                    Experiência
                  </p>
                  <p className="text-sm font-semibold text-[#121d27]">
                    {provider.experience_time}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold uppercase text-[#3d4a3c]">
                    Bairros que atende
                  </p>
                  <p className="text-sm font-semibold text-[#121d27]">
                    {provider.neighborhoods}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio Completa */}
        <div className="mt-6 p-4 rounded-xl bg-[#F6F8FC] border border-[#0F1A24]/6">
          <p className="text-xs font-semibold uppercase text-[#3d4a3c] mb-1">
            Sobre os serviços
          </p>
          <p className="text-sm sm:text-base text-[#121d27] leading-relaxed">
            {provider.bio}
          </p>
        </div>

        {/* Gatilho de Conversão: Botão WhatsApp */}
        <div className="mt-6">
          {!provider.is_available ? (
            <div className="rounded-2xl bg-amber-50/90 border border-amber-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-amber-950">
                    Profissional Ocupado no Momento
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-900/80 mt-0.5">
                    Ele pausou temporariamente novos pedidos no WhatsApp para concluir serviços em andamento.
                  </p>
                </div>
              </div>
              <Link
                href={
                  provider.categories[0]
                    ? `/categoria/${provider.categories[0].slug}`
                    : "/"
                }
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-white border border-amber-300 text-amber-900 font-semibold text-xs sm:text-sm hover:bg-amber-100/70 transition-colors shrink-0"
              >
                Ver outros disponíveis
              </Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleWhatsAppClick}
              className="w-full py-4 rounded-full bg-[#00B048] hover:bg-[#006e2a] text-white font-semibold text-base shadow-[var(--shadow-level-2)] hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2.5"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Falar no WhatsApp Agora</span>
            </button>
          )}

          {!currentUser && provider.is_available && (
            <p className="text-center text-xs text-[#3d4a3c] mt-2">
              Por segurança, o número do WhatsApp é liberado gratuitamente após login rápido.
            </p>
          )}

          {actionError && (
            <p className="mt-3 text-xs font-semibold text-[#ba1a1a] bg-[#ffdad6] px-4 py-2.5 rounded-xl text-center">
              {actionError}
            </p>
          )}

          {unlockedUrl && (
            <div className="mt-3 p-3.5 rounded-xl bg-[#EBF9EF] border border-[#00B048]/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-[#006e2a] font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  Contato registrado! Você terá 24h de respiro antes da avaliação obrigatória.
                </span>
              </div>
              <a
                href={unlockedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#006e2a] text-white text-xs font-semibold shrink-0"
              >
                Abrir WhatsApp <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Lista Completa de Avaliações */}
      <section className="rounded-2xl bg-white border border-[#0F1A24]/8 p-5 sm:p-8 shadow-[var(--shadow-level-1)]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-xl text-[#121d27]">
            Avaliações de Clientes ({provider.reviews.length})
          </h2>
        </div>

        {provider.reviews.length === 0 ? (
          <p className="text-sm text-[#3d4a3c]">
            Este profissional ainda não possui comentários publicados. Seja o primeiro a
            contratar e avaliar!
          </p>
        ) : (
          <div className="space-y-4">
            {provider.reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-xl bg-[#F6F8FC] border border-[#0F1A24]/6"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {rev.client_avatar ? (
                      <img
                        src={rev.client_avatar}
                        alt={rev.client_name || "Cliente"}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <span className="w-9 h-9 rounded-full bg-[#00B048]/15 text-[#006e2a] flex items-center justify-center font-bold text-xs">
                        {(rev.client_name || "C").charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div>
                      <p className="font-display font-semibold text-sm text-[#121d27]">
                        {rev.client_name || "Cliente"}
                      </p>
                      <p className="text-[11px] text-[#3d4a3c]">
                        {new Date(
                          rev.client_reviewed_at || rev.unlocked_at
                        ).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>

                  {(() => {
                    const lvl = Math.min(
                      5,
                      Math.max(1, Math.round(rev.client_rating || 5))
                    ) as ThermometerLevel;
                    const cfg = THERMOMETER_LEVELS[lvl];
                    return (
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-bold ${cfg.badgeClass}`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${cfg.bgClass}`} />
                        <span>{cfg.label}</span>
                      </div>
                    );
                  })()}
                </div>

                <p className="text-sm text-[#121d27] mt-3 leading-relaxed">
                  &ldquo;{rev.client_comment}&rdquo;
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
