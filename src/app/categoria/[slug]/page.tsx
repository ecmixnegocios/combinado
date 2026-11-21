"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, MapPin, Sparkles } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ProviderCard } from "@/components/ProviderCard";
import { BackNavigation } from "@/components/BackNavigation";
import { AdvertiseHereBanner } from "@/components/AdvertiseHereBanner";
import { BOA_VISTA_NEIGHBORHOODS } from "@/lib/neighborhoods";

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { categories, getCatalogProviders, getCategoryBanner } = useApp();
  const [neighborhood, setNeighborhood] = useState("");
  const categoryBanner = getCategoryBanner(slug);

  const category = useMemo(
    () => categories.find((c) => c.slug === slug),
    [categories, slug]
  );

  const providers = useMemo(
    () =>
      getCatalogProviders({
        categorySlug: slug,
        neighborhood,
      }),
    [getCatalogProviders, slug, neighborhood]
  );

  if (!category) {
    return (
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-10 text-center">
        <h1 className="font-display font-bold text-2xl text-[#121d27]">
          Categoria não encontrada
        </h1>
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-full bg-[#00B048] text-white text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Início
        </Link>
      </div>
    );
  }

  const availableCount = providers.filter((p) => p.is_available).length;

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 pt-6 space-y-6">
      <BackNavigation backLabel="Voltar" />

      <div className="rounded-2xl bg-white border border-[#0F1A24]/8 p-5 sm:p-6 shadow-[var(--shadow-level-1)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="w-14 h-14 rounded-2xl bg-[#00B048]/12 text-[#006e2a] flex items-center justify-center shrink-0">
            <CategoryIcon name={category.icon_name} className="w-7 h-7" />
          </span>
          <div>
            <h1 className="font-display font-bold text-2xl text-[#121d27]">
              {category.name}
            </h1>
            <p className="text-sm text-[#3d4a3c]">
              <strong className="text-[#006e2a]">{availableCount} disponíveis agora</strong>{" "}
              • {providers.length} profissionais cadastrados
            </p>
          </div>
        </div>

        <div className="sm:w-72 flex items-center gap-2 px-3.5 py-2.5 rounded-full border border-[#0F1A24]/15 bg-[#F6F8FC]">
          <MapPin className="w-4 h-4 text-[#EA580C] shrink-0" />
          <select
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
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
      </div>

      {/* Patrocinador exclusivo da categoria (ou CTA Anuncie Aqui) */}
      {categoryBanner ? (
        <a
          href={categoryBanner.target_url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden rounded-2xl bg-[#0F1A24] shadow-[var(--shadow-level-1)] hover:shadow-[var(--shadow-level-2)] transition-all"
        >
          <div className="relative h-24 sm:h-28 w-full">
            <img
              src={categoryBanner.image_url}
              alt={categoryBanner.title}
              className="w-full h-full object-cover opacity-50 group-hover:scale-[1.02] transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050C16]/90 via-[#050C16]/65 to-transparent" />
            <div className="absolute inset-0 p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="space-y-1 min-w-0">
                <span className="inline-flex items-center gap-1.5 w-fit px-2.5 py-0.5 rounded-full bg-white/15 text-[10px] font-bold text-[#FDBA74]">
                  <Sparkles className="w-3 h-3" />
                  Parceiro em {category.name}
                </span>
                <p className="font-display font-bold text-xs sm:text-base text-white line-clamp-2">
                  {categoryBanner.title}
                </p>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EA580C] text-white text-xs font-semibold shrink-0">
                Conferir <ExternalLink className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </a>
      ) : (
        <AdvertiseHereBanner
          contextLabel={`Espaço Disponível · Parceiro em ${category.name}`}
          categoryName={category.name}
        />
      )}

      {providers.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#0F1A24]/8 p-8 text-center">
          <p className="font-display font-semibold text-base text-[#121d27]">
            Nenhum profissional encontrado nesta categoria/bairro.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}
    </div>
  );
}
