import { Megaphone, MessageCircle } from "lucide-react";

const ADMIN_ADVERTISE_WHATSAPP = "https://wa.me/5595999990000";

export function AdvertiseHereBanner({
  contextLabel,
  categoryName,
}: {
  contextLabel?: string;
  categoryName?: string;
}) {
  const text = categoryName
    ? `Olá! Tenho interesse em anunciar minha empresa na categoria "${categoryName}" no Combinado.`
    : "Olá! Tenho interesse em anunciar minha empresa como Parceiro do Dia na tela inicial do Combinado.";

  const href = `${ADMIN_ADVERTISE_WHATSAPP}?text=${encodeURIComponent(text)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block rounded-2xl border-2 border-dashed border-[#00B048]/35 bg-gradient-to-r from-[#EBF9EF] via-white to-[#F6F8FC] hover:border-[#00B048] p-4 sm:p-5 transition-all shadow-2xs hover:shadow-[var(--shadow-level-1)]"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <span className="w-10 h-10 rounded-xl bg-[#00B048]/15 text-[#006e2a] flex items-center justify-center shrink-0">
            <Megaphone className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#006e2a]">
              {contextLabel || "Espaço Publicitário Disponível"}
            </span>
            <p className="font-display font-bold text-xs sm:text-base text-[#0F1A24] leading-snug">
              {categoryName
                ? `Anuncie aqui! Sua empresa em destaque para quem procura ${categoryName} todos os dias.`
                : "Anuncie aqui! Sua empresa pode aparecer para milhares de pessoas em Boa Vista todos os dias."}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#0F1A24] group-hover:bg-[#006e2a] text-white text-xs font-display font-bold transition-colors shrink-0 self-start sm:self-center">
          <MessageCircle className="w-3.5 h-3.5 text-[#7ED957]" />
          Quero anunciar
        </span>
      </div>
    </a>
  );
}
