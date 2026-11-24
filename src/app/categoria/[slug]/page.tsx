"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ProviderCard } from "@/components/ProviderCard";
import { BackNavigation } from "@/components/BackNavigation";
import { BOA_VISTA_NEIGHBORHOODS } from "@/lib/neighborhoods";

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { categories, getCatalogProviders } = useApp();
  const [neighborhood, setNeighborhood] = useState("");

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

      {providers.length === 0 ? (
        <div className="rounded-2xl bg-white border border-[#0F1A24]/8 p-8 text-center">
          <p className="font-display font-semibold text-base text-[#121d27]">
            Nenhum profissional encontrado nesta categoria/bairro.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((provider) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              activeCategorySlug={slug}
            />
          ))}
        </div>
      )}
    </div>
  );
}
