import Link from "next/link";
import { BadgeCheck, ChevronRight, Clock, MapPin } from "lucide-react";
import { ProviderCatalogItem } from "@/types/database";
import { ReputationThermometer } from "./ReputationThermometer";
import { formatProviderTitle } from "@/utils/validators";

export function ProviderCard({ provider }: { provider: ProviderCatalogItem }) {
  const isAvailable = provider.is_available;
  const formattedTitle = formatProviderTitle(
    provider.display_name,
    provider.categories[0]?.name
  );

  return (
    <Link
      href={`/profissional/${provider.id}`}
      className={`group flex flex-col justify-between h-full rounded-2xl border p-4 sm:p-5 transition-all duration-200 ${
        isAvailable
          ? "bg-white border-[#0F1A24]/8 shadow-[var(--shadow-level-1)] hover:shadow-[var(--shadow-level-2)] hover:border-[#00B048]/30 hover:-translate-y-0.5"
          : "bg-slate-50/90 border-amber-200/80 opacity-85 shadow-none"
      }`}
    >
      <div>
        {/* 1. Cabeçalho: Avatar + Nome + Status/Confiança */}
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            {provider.avatar_url ? (
              <img
                src={provider.avatar_url}
                alt={provider.display_name}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ${
                  isAvailable ? "ring-[#00B048]/25" : "ring-amber-300/70"
                }`}
              />
            ) : (
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#00B048]/15 text-[#006e2a] flex items-center justify-center font-display font-bold text-xl">
                {provider.display_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-base sm:text-lg text-[#121d27] leading-snug truncate group-hover:text-[#006e2a] transition-colors">
              {formattedTitle}
            </h3>

            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0 border ${
                  isAvailable
                    ? "bg-[#00B048]/12 text-[#006e2a] border-[#00B048]/25"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}
              >
                {isAvailable ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00B048] animate-pulse" />
                    Disponível Agora
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-amber-600" />
                    Ocupado
                  </>
                )}
              </span>

              {provider.is_verified && (
                <span
                  title="Identidade Verificada"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-[11px] font-semibold shrink-0"
                >
                  <BadgeCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>Verificado</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2. Termômetro de Reputação em largura total */}
        <div className="mt-3.5 rounded-xl bg-[#F8FAFC] border border-[#0F1A24]/6 px-3 py-2.5">
          <ReputationThermometer
            ratingAvg={provider.pro_rating_avg}
            reviewsCount={provider.pro_reviews_count}
            size="compact"
            fullWidth
          />
        </div>

        {/* 3. Especialidades e Descrição */}
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {provider.categories.map((cat) => (
              <span
                key={cat.id}
                className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-[#121d27]/80 border border-[#0F1A24]/6"
              >
                {cat.name}
              </span>
            ))}
          </div>

          {provider.bio && (
            <p className="text-xs sm:text-sm text-[#121d27]/75 line-clamp-2 leading-relaxed">
              {provider.bio}
            </p>
          )}
        </div>
      </div>

      {/* 4. Rodapé: Bairros + Ver perfil */}
      <div className="mt-3.5 pt-2.5 border-t border-[#0F1A24]/6 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#3d4a3c] min-w-0">
          <MapPin className="w-3.5 h-3.5 text-[#00B048] shrink-0" />
          <span className="truncate">{provider.neighborhoods}</span>
        </div>

        <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#006e2a] shrink-0 opacity-85 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
          Ver perfil
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
