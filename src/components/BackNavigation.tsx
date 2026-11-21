"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";

export function BackNavigation({
  fallbackHref = "/",
  backLabel = "Voltar",
  showCatalogLink = true,
  extraLink,
}: {
  fallbackHref?: string;
  backLabel?: string;
  showCatalogLink?: boolean;
  extraLink?: { href: string; label: string };
}) {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#0F1A24]/12 hover:border-[#00B048] text-xs sm:text-sm font-semibold text-[#121d27] hover:text-[#006e2a] transition-colors cursor-pointer shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{backLabel}</span>
        </button>

        {extraLink && (
          <Link
            href={extraLink.href}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EBF9EF] border border-[#00B048]/25 text-xs sm:text-sm font-semibold text-[#006e2a] hover:bg-[#00B048]/15 transition-colors"
          >
            {extraLink.label}
          </Link>
        )}
      </div>

      {showCatalogLink && (
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#3d4a3c] hover:text-[#006e2a] transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Ir para o catálogo</span>
        </Link>
      )}
    </div>
  );
}
