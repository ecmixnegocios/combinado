"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Award, BadgeCheck, ChevronRight, Clock, Crown, MapPin, Search, Share2, ShieldCheck } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ProviderCard } from "@/components/ProviderCard";
import { ReputationThermometer } from "@/components/ReputationThermometer";
import { ShareHighlightModal } from "@/components/ShareHighlightModal";
import { BOA_VISTA_NEIGHBORHOODS } from "@/lib/neighborhoods";
import { ProviderCatalogItem } from "@/types/database";
import { formatProviderTitle } from "@/utils/validators";

export default function HomePage() {
  const { currentUser, categoriesWithCounts, getCatalogProviders } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [neighborhoodFilter, setNeighborhoodFilter] = useState("");
  const [activeCatSlug, setActiveCatSlug] = useState<string>("pedreiros");
  const [shareTarget, setShareTarget] = useState<{
    provider: ProviderCatalogItem;
    categoryName: string;
    rank: 1 | 2 | 3;
  } | null>(null);

  const providers = useMemo(
    () =>
      getCatalogProviders({
        query: searchQuery,
        neighborhood: neighborhoodFilter,
      }),
    [getCatalogProviders, searchQuery, neighborhoodFilter]
  );

  const isFiltering = Boolean(searchQuery.trim() || neighborhoodFilter.trim());

  const matchingCategories = useMemo(() => {
    const q = searchQuery
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
    if (!q) return [];
    return categoriesWithCounts.filter((cat) =>
      cat.name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .includes(q)
    );
  }, [categoriesWithCounts, searchQuery]);

  const categoriesSection = (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-lg sm:text-xl text-[#121d27]">
          Categorias de Serviços
        </h2>
        <span className="text-xs font-semibold text-[#3d4a3c]">
          {categoriesWithCounts.length} categorias ativas
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {categoriesWithCounts.map((cat) => (
          <Link
            key={cat.id}
            href={`/categoria/${cat.slug}`}
            className="group flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3.5 rounded-2xl bg-white border border-[#0F1A24]/8 shadow-[var(--shadow-level-1)] hover:shadow-[var(--shadow-level-2)] hover:border-[#00B048]/40 transition-all"
          >
            <span className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#00B048]/10 text-[#006e2a] group-hover:bg-[#00B048] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
              <CategoryIcon name={cat.icon_name} className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <div className="min-w-0">
              <p className="font-display font-semibold text-xs sm:text-sm text-[#121d27] leading-tight line-clamp-2">
                {cat.name}
              </p>
              <p className="text-[11px] sm:text-xs text-[#006e2a] font-semibold mt-0.5">
                {cat.available_count ?? 0}{" "}
                {cat.available_count === 1 ? "disponível" : "disponíveis"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );

  const resultsSection = (
    <section id="catalogo-resultados" className="space-y-4">
      {isFiltering && matchingCategories.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#3d4a3c]">
            Categorias encontradas:
          </span>
          {matchingCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categoria/${cat.slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#00B048]/30 text-xs font-semibold text-[#006e2a] hover:bg-[#00B048] hover:text-white transition-colors shadow-xs"
            >
              <CategoryIcon name={cat.icon_name} className="w-3.5 h-3.5" />
              {cat.name}
              <span className="opacity-75">({cat.available_count ?? 0})</span>
            </Link>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[#006e2a]" />
          <h2 className="font-display font-bold text-lg sm:text-xl text-[#121d27]">
            {isFiltering
              ? `Resultados da Busca (${providers.length})`
              : "Profissionais Mais Bem Avaliados"}
          </h2>
        </div>
        <p className="text-xs text-[#3d4a3c]">
          Ordenados por disponibilidade e melhor avaliação
        </p>
      </div>

      {providers.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#0F1A24]/8 p-8 text-center">
          <p className="font-display font-semibold text-base text-[#121d27]">
            Nenhum profissional encontrado para essa busca.
          </p>
          <p className="text-sm text-[#3d4a3c] mt-1">
            Tente buscar por outro termo ou limpar o filtro de bairro.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}
    </section>
  );

  const categoryRankings = useMemo(() => {
    return categoriesWithCounts.map((cat) => {
      const catProviders = getCatalogProviders({ categorySlug: cat.slug });
      const top3 = [...catProviders]
        .sort((a, b) => {
          if (b.pro_rating_avg !== a.pro_rating_avg) {
            return b.pro_rating_avg - a.pro_rating_avg;
          }
          if (b.pro_reviews_count !== a.pro_reviews_count) {
            return b.pro_reviews_count - a.pro_reviews_count;
          }
          return Number(b.is_available) - Number(a.is_available);
        })
        .slice(0, 3);

      return { category: cat, top3 };
    });
  }, [categoriesWithCounts, getCatalogProviders]);

  const activeCategoryData = useMemo(() => {
    return (
      categoryRankings.find((r) => r.category.slug === activeCatSlug) ??
      categoryRankings[0]
    );
  }, [categoryRankings, activeCatSlug]);

  const rankingByCategorySection = activeCategoryData ? (
    <section id="catalogo-resultados" className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#00B048]/12 text-[#006e2a] flex items-center justify-center shrink-0">
              <Award className="w-4 h-4" />
            </span>
            <h2 className="font-display font-bold text-lg sm:text-xl text-[#121d27]">
              Destaques da Vizinhança
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#3d4a3c]">
            Os 3 profissionais de cada área que mais têm feito a diferença pelos clientes.
          </p>
        </div>
        <Link
          href={`/categoria/${activeCategoryData.category.slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#006e2a] hover:underline shrink-0 self-start sm:self-end"
        >
          Ver todos em {activeCategoryData.category.name}
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Barra de abas por categoria alinhada à esquerda com os cards */}
      <div className="flex sm:flex-wrap gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categoriesWithCounts.map((cat) => {
          const active = cat.slug === activeCategoryData.category.slug;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCatSlug(cat.slug)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-bold border whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                active
                  ? "bg-[#0F1A24] text-white border-[#0F1A24] shadow-sm"
                  : "bg-white text-[#121d27] border-[#0F1A24]/10 hover:border-[#00B048]/40"
              }`}
            >
              <CategoryIcon name={cat.icon_name} className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {activeCategoryData.top3.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#0F1A24]/8 p-6 text-sm text-[#3d4a3c]">
          Ainda não há profissionais cadastrados nesta categoria.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* 1º Lugar em Destaque Grande */}
          {activeCategoryData.top3[0] && (
            <Link
              href={`/profissional/${activeCategoryData.top3[0].id}`}
              className="lg:col-span-7 rounded-2xl bg-gradient-to-br from-[#006e2a] to-[#00A650] p-6 text-white shadow-[var(--shadow-level-2)] hover:scale-[1.01] transition-all flex flex-col justify-between gap-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="space-y-1.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#FDE68A] to-[#FCD34D] text-[#0F1A24] font-display font-bold text-xs shadow-sm ring-1 ring-[#F59E0B]/35">
                    <Crown className="w-3.5 h-3.5 text-[#92400E]" />
                    1º Lugar · Líder em {activeCategoryData.category.name}
                  </span>
                  <p className="text-xs font-medium text-white/90">
                    Destaque absoluto da categoria pelo capricho, pontualidade e boas avaliações.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-xs font-semibold shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#9cf973] animate-pulse" />
                  {activeCategoryData.top3[0].is_available
                    ? "Disponível Agora"
                    : "Ocupado no momento"}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="relative shrink-0 w-fit">
                  {activeCategoryData.top3[0].avatar_url ? (
                    <img
                      src={activeCategoryData.top3[0].avatar_url}
                      alt={activeCategoryData.top3[0].display_name}
                      className="w-20 h-20 rounded-full object-cover ring-4 ring-[#FCD34D] shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-white/20 text-white flex items-center justify-center font-display font-bold text-2xl ring-4 ring-[#FCD34D] shadow-lg">
                      {activeCategoryData.top3[0].display_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span
                    title="Líder da categoria"
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-[#FDE68A] to-[#FCD34D] text-[#0F1A24] flex items-center justify-center ring-2 ring-[#008c38] shadow-md"
                  >
                    <Crown className="w-4 h-4 text-[#92400E]" />
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display font-bold text-2xl truncate">
                      {formatProviderTitle(
                        activeCategoryData.top3[0].display_name,
                        activeCategoryData.category.name
                      )}
                    </h3>
                    {activeCategoryData.top3[0].is_verified && (
                      <span
                        title="Identidade Verificada"
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold shrink-0"
                      >
                        <BadgeCheck className="w-3.5 h-3.5 text-[#FDE68A]" />
                        Identidade Verificada
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-white/85 mt-1 truncate">
                    {activeCategoryData.top3[0].neighborhoods}
                  </p>
                  <p className="text-xs sm:text-sm text-white/95 mt-2 leading-relaxed line-clamp-2">
                    {activeCategoryData.top3[0].bio}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl p-3 text-[#121d27] flex flex-wrap items-center justify-between gap-3">
                <ReputationThermometer
                  ratingAvg={activeCategoryData.top3[0].pro_rating_avg}
                  reviewsCount={activeCategoryData.top3[0].pro_reviews_count}
                  size="detailed"
                />
                {currentUser?.id === activeCategoryData.top3[0].id && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShareTarget({
                        provider: activeCategoryData.top3[0],
                        categoryName: activeCategoryData.category.name,
                        rank: 1,
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#0F1A24] hover:bg-[#1e2d3b] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer shrink-0"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Compartilhar conquista
                  </button>
                )}
              </div>
            </Link>
          )}

          {/* 2º e 3º ao lado (Prata e Bronze) */}
          <div className="lg:col-span-5 flex flex-col gap-4 justify-between">
            {activeCategoryData.top3.slice(1, 3).map((provider, i) => {
              const rank = i + 2;
              const isSilver = rank === 2;
              return (
                <Link
                  key={provider.id}
                  href={`/profissional/${provider.id}`}
                  className="flex-1 rounded-2xl bg-white border border-[#0F1A24]/10 p-4 sm:p-5 shadow-[var(--shadow-level-1)] hover:shadow-[var(--shadow-level-2)] transition-all flex flex-col justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-display font-bold shadow-xs shrink-0 ${
                          isSilver
                            ? "bg-gradient-to-r from-[#E2E8F0] to-[#CBD5E1] text-[#0F1A24] ring-1 ring-[#94A3B8]/60"
                            : "bg-gradient-to-r from-[#F5D0A9] to-[#D99B66] text-[#2B1707] ring-1 ring-[#B45309]/40"
                        }`}
                      >
                        <Crown
                          className={`w-3 h-3 ${
                            isSilver ? "text-[#475569]" : "text-[#78350F]"
                          }`}
                        />
                        {rank}º Lugar
                      </span>
                      {provider.is_available ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#00B048]/12 text-[#006e2a] border border-[#00B048]/25 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00B048] animate-pulse" />
                          Disponível
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Ocupado
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-[#3d4a3c]">
                      {isSilver
                        ? "Quase no topo · Muito elogiado pelos clientes"
                        : "Subindo no ranking · Recomendado na região"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      {provider.avatar_url ? (
                        <img
                          src={provider.avatar_url}
                          alt={provider.display_name}
                          className={`w-12 h-12 rounded-full object-cover shadow-sm ring-[3px] ${
                            isSilver ? "ring-[#94A3B8]" : "ring-[#C2783E]"
                          }`}
                        />
                      ) : (
                        <div
                          className={`w-12 h-12 rounded-full bg-[#00B048]/15 text-[#006e2a] flex items-center justify-center font-display font-bold text-base shadow-sm ring-[3px] ${
                            isSilver ? "ring-[#94A3B8]" : "ring-[#C2783E]"
                          }`}
                        >
                          {provider.display_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span
                        title={`${rank}º lugar`}
                        className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm ${
                          isSilver
                            ? "bg-gradient-to-br from-[#F1F5F9] to-[#CBD5E1]"
                            : "bg-gradient-to-br from-[#F5D0A9] to-[#D99B66]"
                        }`}
                      >
                        <Crown
                          className={`w-3 h-3 ${
                            isSilver ? "text-[#475569]" : "text-[#78350F]"
                          }`}
                        />
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-display font-bold text-base text-[#121d27] truncate group-hover:text-[#006e2a]">
                          {formatProviderTitle(
                            provider.display_name,
                            activeCategoryData.category.name
                          )}
                        </h4>
                        {provider.is_verified && (
                          <span title="Identidade Verificada" className="inline-flex shrink-0">
                            <BadgeCheck className="w-4 h-4 text-sky-600" />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#3d4a3c] truncate">
                        {provider.neighborhoods}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <ReputationThermometer
                      ratingAvg={provider.pro_rating_avg}
                      reviewsCount={provider.pro_reviews_count}
                      size="compact"
                    />
                    {currentUser?.id === provider.id && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setShareTarget({
                            provider,
                            categoryName: activeCategoryData.category.name,
                            rank: rank as 2 | 3,
                          });
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0F1A24] hover:bg-[#1e2d3b] text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer shrink-0"
                      >
                        <Share2 className="w-3 h-3" />
                        Compartilhar conquista
                      </button>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  ) : null;

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-5 space-y-8">
      {/* Hero + Barra de Busca e Filtro por Bairro */}
      <section className="rounded-2xl bg-gradient-to-br from-[#006e2a] via-[#008c38] to-[#00B048] p-5 sm:p-8 text-white shadow-[var(--shadow-level-2)]">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0F1A24]/30 backdrop-blur-sm border border-white/20 text-xs sm:text-sm font-semibold text-white mb-3.5">
            <ShieldCheck className="w-4 h-4 text-[#FDBA74] shrink-0" />
            Profissionais avaliados pela vizinhança
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-4xl leading-tight tracking-tight">
            Precisa de um serviço rápido e de confiança?
          </h1>
          <p className="text-sm sm:text-base text-white/90 mt-2">
            Escolha a categoria, confira as avaliações reais e chame direto no WhatsApp.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mt-6 bg-white rounded-2xl p-2 shadow-[var(--shadow-level-2)] flex flex-col sm:flex-row gap-2">
          <div className="flex-1 flex items-center gap-2.5 px-3 py-2 rounded-xl focus-within:bg-[#00B048]/5 transition-colors">
            <Search className="w-5 h-5 text-[#00B048] shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="O que você precisa? Ex: pedreiro, eletricista, faxina..."
              className="w-full text-sm text-[#121d27] placeholder:text-slate-400 bg-transparent focus:outline-none"
            />
          </div>

          <div className="hidden sm:block w-px bg-slate-200 my-1.5" />

          <div className="sm:w-64 flex items-center gap-2.5 px-3 py-2 rounded-xl focus-within:bg-[#00B048]/5 transition-colors">
            <MapPin className="w-5 h-5 text-[#EA580C] shrink-0" />
            <select
              value={neighborhoodFilter}
              onChange={(e) => setNeighborhoodFilter(e.target.value)}
              aria-label="Filtrar por bairro"
              className="w-full text-sm text-[#121d27] bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="">Todos os bairros</option>
              {BOA_VISTA_NEIGHBORHOODS.map((bairro) => (
                <option key={bairro} value={bairro}>
                  {bairro}
                </option>
              ))}
            </select>
          </div>

          {isFiltering ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setNeighborhoodFilter("");
              }}
              className="px-6 py-3 rounded-full bg-slate-200 hover:bg-slate-300 text-[#121d27] font-semibold text-sm transition-colors cursor-pointer shrink-0"
            >
              Limpar
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("catalogo-resultados");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-7 py-3 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-sm shadow-sm hover:scale-[1.02] transition-all cursor-pointer shrink-0"
            >
              Buscar
            </button>
          )}
        </div>
      </section>

      {isFiltering ? (
        <>
          {resultsSection}
          {categoriesSection}
        </>
      ) : (
        <>
          {categoriesSection}
          {rankingByCategorySection}
        </>
      )}
      {shareTarget && (
        <ShareHighlightModal
          isOpen={Boolean(shareTarget)}
          onClose={() => setShareTarget(null)}
          provider={shareTarget.provider}
          categoryName={shareTarget.categoryName}
          rank={shareTarget.rank}
        />
      )}
    </div>
  );
}
