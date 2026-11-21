import Link from "next/link";
import { BadgeCheck, Clock, MapPin } from "lucide-react";
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
      className={`group block rounded-2xl border p-4 sm:p-5 transition-all duration-200 ${
        isAvailable
          ? "bg-white border-[#0F1A24]/8 shadow-[var(--shadow-level-1)] hover:shadow-[var(--shadow-level-2)] hover:-translate-y-0.5"
          : "bg-slate-50/90 border-amber-200/80 opacity-85 shadow-none"
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Avatar */}
        <div className="relative shrink-0">
          {provider.avatar_url ? (
            <img
              src={provider.avatar_url}
              alt={provider.display_name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-[#00B048]/20"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#00B048]/15 text-[#006e2a] flex items-center justify-center font-display font-bold text-xl">
              {provider.display_name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Header Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold text-sm sm:text-lg text-[#121d27] leading-snug group-hover:text-[#006e2a] transition-colors">
              {formattedTitle}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 mt-1">
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
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-[10px] font-bold shrink-0"
              >
                <BadgeCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>Identidade Verificada</span>
              </span>
            )}
          </div>

          {/* Termômetro de Reputação */}
          <div className="mt-2">
            <ReputationThermometer
              ratingAvg={provider.pro_rating_avg}
              reviewsCount={provider.pro_reviews_count}
              size="compact"
            />
          </div>

          {/* Categorias */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {provider.categories.map((cat) => (
              <span
                key={cat.id}
                className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#edf4ff] text-[#006e2a]"
              >
                {cat.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bairro e Bio truncada */}
      <div className="mt-3.5 pt-3 border-t border-[#0F1A24]/6 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-[#3d4a3c]">
          <MapPin className="w-3.5 h-3.5 text-[#00B048] shrink-0" />
          <span className="truncate">{provider.neighborhoods}</span>
        </div>
        <p className="text-sm text-[#121d27]/80 truncate">{provider.bio}</p>
      </div>
    </Link>
  );
}
