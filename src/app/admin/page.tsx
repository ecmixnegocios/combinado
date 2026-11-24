"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Ban,
  CheckCircle2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { THERMOMETER_LEVELS, ThermometerLevel } from "@/components/ReputationThermometer";

export default function AdminPage() {
  const {
    currentUser,
    loginAsDemo,
    banners,
    profiles,
    providerDetails,
    interactions,
    categories,
    adminCreateBanner,
    adminToggleBanner,
    adminToggleBan,
    adminToggleVerified,
    adminDeleteReview,
    adminAddCategory,
    adminToggleCategory,
  } = useApp();

  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerImage, setBannerImage] = useState("");
  const [bannerTarget, setBannerTarget] = useState("");
  const [bannerCategorySlug, setBannerCategorySlug] = useState("");
  const [bannerDate, setBannerDate] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState<
    "all" | "providers" | "unverified" | "banned"
  >("all");
  const [userPage, setUserPage] = useState(1);

  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewFilter, setReviewFilter] = useState<
    "all" | "critical" | "regular" | "positive"
  >("all");
  const [reviewPage, setReviewPage] = useState(1);

  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("Wrench");

  const PAGE_SIZE = 15;

  if (!currentUser?.is_admin) {
    return (
      <div className="max-w-lg mx-auto px-4 pt-12">
        <div className="rounded-2xl bg-white border border-[#0F1A24]/8 p-8 text-center shadow-[var(--shadow-level-1)]">
          <span className="w-14 h-14 rounded-2xl bg-[#0F1A24] text-[#7ED957] flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </span>
          <h1 className="font-display font-bold text-2xl text-[#121d27]">
            Área Restrita — Admin
          </h1>
          <p className="text-sm text-[#3d4a3c] mt-2 mb-6">
            Esta página é exclusiva para administradores (`is_admin = true`).
          </p>
          <button
            type="button"
            onClick={() => loginAsDemo("admin")}
            className="px-6 py-3 rounded-full bg-[#0F1A24] text-white text-sm font-semibold cursor-pointer hover:bg-[#1e2d3b]"
          >
            Entrar como Admin (Modo Demo)
          </button>
        </div>
      </div>
    );
  }

  const filteredUsers = profiles.filter((p) => {
    if (userFilter === "providers" && !p.is_provider) return false;
    if (userFilter === "banned" && !p.is_banned) return false;
    if (userFilter === "unverified") {
      if (!p.is_provider) return false;
      const pd = providerDetails.find((d) => d.profile_id === p.id);
      if (pd?.is_verified) return false;
    }

    const q = userSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      p.display_name.toLowerCase().includes(q) ||
      p.full_name.toLowerCase().includes(q)
    );
  });

  const userTotalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safeUserPage = Math.min(userPage, userTotalPages);
  const paginatedUsers = filteredUsers.slice(
    (safeUserPage - 1) * PAGE_SIZE,
    safeUserPage * PAGE_SIZE
  );

  const reviewedInteractions = interactions.filter((i) => {
    if (!i.client_comment && !i.provider_comment) return false;

    const ratings = [i.client_rating, i.provider_rating].filter(
      (r): r is number => typeof r === "number"
    );
    if (reviewFilter === "critical" && !ratings.some((r) => r <= 2)) return false;
    if (reviewFilter === "regular" && !ratings.some((r) => r === 3)) return false;
    if (reviewFilter === "positive" && !ratings.some((r) => r >= 4)) return false;

    const q = reviewSearch.trim().toLowerCase();
    if (!q) return true;
    const client = profiles.find((p) => p.id === i.client_id);
    const provider = profiles.find((p) => p.id === i.provider_id);
    return (
      (client?.display_name.toLowerCase().includes(q) ?? false) ||
      (provider?.display_name.toLowerCase().includes(q) ?? false) ||
      (i.client_comment?.toLowerCase().includes(q) ?? false) ||
      (i.provider_comment?.toLowerCase().includes(q) ?? false)
    );
  });

  const reviewTotalPages = Math.max(
    1,
    Math.ceil(reviewedInteractions.length / PAGE_SIZE)
  );
  const safeReviewPage = Math.min(reviewPage, reviewTotalPages);
  const paginatedReviews = reviewedInteractions.slice(
    (safeReviewPage - 1) * PAGE_SIZE,
    safeReviewPage * PAGE_SIZE
  );

  const handleCreateBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerTitle.trim() || !bannerImage.trim() || !bannerTarget.trim()) return;
    adminCreateBanner({
      title: bannerTitle,
      image_url: bannerImage,
      target_url: bannerTarget,
      category_slug: bannerCategorySlug || null,
      scheduled_date: bannerDate || null,
    });
    setBannerTitle("");
    setBannerImage("");
    setBannerTarget("");
    setBannerCategorySlug("");
    setBannerDate("");
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    adminAddCategory({ name: newCatName, icon_name: newCatIcon });
    setNewCatName("");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
      <div className="flex items-center gap-3">
        <span className="w-11 h-11 rounded-2xl bg-[#0F1A24] text-[#7ED957] flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" />
        </span>
        <div>
          <h1 className="font-display font-bold text-2xl text-[#121d27]">
            Painel Secreto do Administrador
          </h1>
          <p className="text-xs sm:text-sm text-[#3d4a3c]">
            Gestão de banners, moderação de usuários, avaliações e categorias
          </p>
        </div>
      </div>

      {/* 1. Gestão do Banner do Topo */}
      <section className="rounded-2xl bg-white border border-[#0F1A24]/8 p-5 sm:p-6 shadow-[var(--shadow-level-1)] space-y-4">
        <h2 className="font-display font-bold text-lg text-[#121d27] flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-[#00B048]" />
          Gestão de Banners do Topo
        </h2>

        <form onSubmit={handleCreateBanner} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            type="text"
            value={bannerTitle}
            onChange={(e) => setBannerTitle(e.target.value)}
            placeholder="Título da oferta/empresa..."
            className="px-3.5 py-2.5 rounded-lg border border-[#0F1A24]/15 text-sm"
            required
          />
          <input
            type="url"
            value={bannerImage}
            onChange={(e) => setBannerImage(e.target.value)}
            placeholder="URL da imagem (https://...)"
            className="px-3.5 py-2.5 rounded-lg border border-[#0F1A24]/15 text-sm"
            required
          />
          <input
            type="url"
            value={bannerTarget}
            onChange={(e) => setBannerTarget(e.target.value)}
            placeholder="Link de destino"
            className="px-3.5 py-2.5 rounded-lg border border-[#0F1A24]/15 text-sm"
            required
          />
          <select
            value={bannerCategorySlug}
            onChange={(e) => setBannerCategorySlug(e.target.value)}
            className="px-3.5 py-2.5 rounded-lg border border-[#0F1A24]/15 text-sm bg-white"
          >
            <option value="">Tela Inicial (Banner do Dia)</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                Categoria: {c.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="date"
              value={bannerDate}
              onChange={(e) => setBannerDate(e.target.value)}
              title="Data agendada (opcional)"
              className="flex-1 px-3 py-2.5 rounded-lg border border-[#0F1A24]/15 text-xs bg-white"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-full bg-[#00B048] text-white text-xs font-semibold cursor-pointer shrink-0"
            >
              Publicar
            </button>
          </div>
        </form>

        <div className="space-y-2.5">
          {banners.map((b) => (
            <div
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#F6F8FC] border border-[#0F1A24]/6"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={b.image_url}
                  alt={b.title}
                  className="w-16 h-10 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                    <span className="px-2 py-0.5 rounded-full bg-white border border-[#0F1A24]/10 text-[10px] font-bold text-[#0F1A24]">
                      {b.category_slug ? `Categoria: ${b.category_slug}` : "Tela Inicial (Banner do Dia)"}
                    </span>
                    {b.scheduled_date && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[10px] font-semibold text-amber-800">
                        Data: {b.scheduled_date}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-sm text-[#121d27] truncate">{b.title}</p>
                  <p className="text-xs text-[#3d4a3c] truncate">{b.target_url}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => adminToggleBanner(b.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                  b.is_active
                    ? "bg-[#00B048] text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {b.is_active ? "Ativo" : "Inativo"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Moderação de Usuários */}
      <section className="rounded-2xl bg-white border border-[#0F1A24]/8 p-5 sm:p-6 shadow-[var(--shadow-level-1)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display font-bold text-lg text-[#121d27]">
            Moderação de Usuários ({filteredUsers.length})
          </h2>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#0F1A24]/15 bg-[#F6F8FC] w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
                setUserPage(1);
              }}
              placeholder="Buscar usuário..."
              className="w-full text-xs bg-transparent focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "all", label: "Todos" },
            { id: "providers", label: "Profissionais" },
            { id: "unverified", label: "Aguardando Verificação" },
            { id: "banned", label: "Banidos" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setUserFilter(tab.id as typeof userFilter);
                setUserPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                userFilter === tab.id
                  ? "bg-[#0F1A24] text-white"
                  : "bg-[#F6F8FC] text-[#3d4a3c] hover:bg-slate-200/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="divide-y divide-[#0F1A24]/8">
          {paginatedUsers.length === 0 ? (
            <p className="py-6 text-center text-xs text-[#3d4a3c]">
              Nenhum usuário encontrado com esse filtro.
            </p>
          ) : (
            paginatedUsers.map((u) => (
            <div
              key={u.id}
              className="py-3 flex flex-wrap items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                {u.avatar_url ? (
                  <img
                    src={u.avatar_url}
                    alt={u.display_name}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                ) : (
                  <span className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">
                    {u.display_name.charAt(0)}
                  </span>
                )}
                <div>
                  <p className="font-semibold text-sm text-[#121d27]">
                    {u.display_name}{" "}
                    <span className="text-xs font-normal text-[#3d4a3c]">
                      ({u.is_provider ? "Profissional" : "Cliente"}
                      {u.is_admin ? " • Admin" : ""})
                    </span>
                  </p>
                  <p className="text-xs text-[#3d4a3c]">{u.full_name}</p>
                </div>
              </div>

              {!u.is_admin && (
                <div className="flex flex-wrap items-center gap-2">
                  {u.is_provider && (() => {
                    const pd = providerDetails.find((d) => d.profile_id === u.id);
                    const verified = pd?.is_verified ?? false;
                    return (
                      <button
                        type="button"
                        onClick={() => adminToggleVerified(u.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-colors ${
                          verified
                            ? "bg-sky-50 border-sky-300 text-sky-800 hover:bg-sky-100"
                            : "bg-white border-[#0F1A24]/15 text-[#3d4a3c] hover:bg-slate-50"
                        }`}
                      >
                        <BadgeCheck className="w-3.5 h-3.5" />
                        {verified ? "Identidade Verificada" : "Verificar Identidade"}
                      </button>
                    );
                  })()}

                  <button
                    type="button"
                    onClick={() => adminToggleBan(u.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                      u.is_banned
                        ? "bg-[#EBF9EF] text-[#006e2a]"
                        : "bg-[#ffdad6] text-[#ba1a1a]"
                    }`}
                  >
                    {u.is_banned ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Desbanir
                      </>
                    ) : (
                      <>
                        <Ban className="w-3.5 h-3.5" /> Banir
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            ))
          )}
        </div>

        {userTotalPages > 1 && (
          <div className="flex items-center justify-between pt-2 border-t border-[#0F1A24]/8 text-xs text-[#3d4a3c]">
            <span>
              Página <strong>{safeUserPage}</strong> de <strong>{userTotalPages}</strong>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={safeUserPage <= 1}
                onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-full border border-[#0F1A24]/15 font-semibold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={safeUserPage >= userTotalPages}
                onClick={() => setUserPage((p) => Math.min(userTotalPages, p + 1))}
                className="px-3 py-1.5 rounded-full border border-[#0F1A24]/15 font-semibold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 3. Moderação de Avaliações */}
      <section className="rounded-2xl bg-white border border-[#0F1A24]/8 p-5 sm:p-6 shadow-[var(--shadow-level-1)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display font-bold text-lg text-[#121d27]">
            Moderação de Avaliações ({reviewedInteractions.length})
          </h2>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-[#0F1A24]/15 bg-[#F6F8FC] w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={reviewSearch}
              onChange={(e) => {
                setReviewSearch(e.target.value);
                setReviewPage(1);
              }}
              placeholder="Buscar por nome ou comentário..."
              className="w-full text-xs bg-transparent focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "all", label: "Todas" },
            { id: "critical", label: "Notas Críticas (1-2)" },
            { id: "regular", label: "Regulares (3)" },
            { id: "positive", label: "Positivas (4-5)" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setReviewFilter(tab.id as typeof reviewFilter);
                setReviewPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                reviewFilter === tab.id
                  ? tab.id === "critical"
                    ? "bg-[#ba1a1a] text-white"
                    : "bg-[#0F1A24] text-white"
                  : "bg-[#F6F8FC] text-[#3d4a3c] hover:bg-slate-200/70"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {paginatedReviews.length === 0 ? (
            <p className="py-6 text-center text-xs text-[#3d4a3c]">
              Nenhuma avaliação encontrada com esse filtro.
            </p>
          ) : (
            paginatedReviews.map((inter) => {
            const client = profiles.find((p) => p.id === inter.client_id);
            const provider = profiles.find((p) => p.id === inter.provider_id);
            return (
              <div
                key={inter.id}
                className="p-3.5 rounded-xl bg-[#F6F8FC] border border-[#0F1A24]/6 flex items-start justify-between gap-3"
              >
                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-[#121d27]">
                    {client?.display_name} → {provider?.display_name}
                  </p>
                  {inter.client_comment && (
                    <p className="text-[#3d4a3c]">
                      <strong>
                        Cliente (
                        {
                          THERMOMETER_LEVELS[
                            Math.min(
                              5,
                              Math.max(1, Math.round(inter.client_rating || 5))
                            ) as ThermometerLevel
                          ].label
                        }
                        ):
                      </strong>{" "}
                      {inter.client_comment}
                    </p>
                  )}
                  {inter.provider_comment && (
                    <p className="text-[#3d4a3c]">
                      <strong>
                        Profissional (
                        {
                          THERMOMETER_LEVELS[
                            Math.min(
                              5,
                              Math.max(1, Math.round(inter.provider_rating || 5))
                            ) as ThermometerLevel
                          ].label
                        }
                        ):
                      </strong>{" "}
                      {inter.provider_comment}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => adminDeleteReview(inter.id)}
                  title="Excluir avaliação e recalcular médias"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-xs font-semibold cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Excluir
                </button>
              </div>
              );
            })
          )}
        </div>

        {reviewTotalPages > 1 && (
          <div className="flex items-center justify-between pt-2 border-t border-[#0F1A24]/8 text-xs text-[#3d4a3c]">
            <span>
              Página <strong>{safeReviewPage}</strong> de{" "}
              <strong>{reviewTotalPages}</strong>
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={safeReviewPage <= 1}
                onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-full border border-[#0F1A24]/15 font-semibold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={safeReviewPage >= reviewTotalPages}
                onClick={() => setReviewPage((p) => Math.min(reviewTotalPages, p + 1))}
                className="px-3 py-1.5 rounded-full border border-[#0F1A24]/15 font-semibold disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed hover:bg-slate-50"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 4. Gestão de Categorias */}
      <section className="rounded-2xl bg-white border border-[#0F1A24]/8 p-5 sm:p-6 shadow-[var(--shadow-level-1)] space-y-4">
        <h2 className="font-display font-bold text-lg text-[#121d27]">
          Gestão de Categorias
        </h2>

        <form onSubmit={handleAddCategory} className="flex flex-wrap gap-2">
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Nova categoria (ex: Pintores)"
            className="flex-1 min-w-[200px] px-3.5 py-2 rounded-lg border border-[#0F1A24]/15 text-sm"
          />
          <select
            value={newCatIcon}
            onChange={(e) => setNewCatIcon(e.target.value)}
            className="px-3.5 py-2 rounded-lg border border-[#0F1A24]/15 text-sm bg-white"
          >
            <option value="Wrench">Wrench</option>
            <option value="Hammer">Hammer</option>
            <option value="Zap">Zap</option>
            <option value="Droplet">Droplet</option>
            <option value="Sparkles">Sparkles</option>
            <option value="Snowflake">Snowflake</option>
            <option value="HardHat">HardHat</option>
            <option value="Trees">Trees</option>
          </select>
          <button
            type="submit"
            className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-[#00B048] text-white text-xs font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Adicionar
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => adminToggleCategory(cat.id)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border cursor-pointer ${
                cat.is_active
                  ? "bg-[#EBF9EF] text-[#006e2a] border-[#00B048]/30"
                  : "bg-slate-100 text-slate-500 border-slate-200"
              }`}
            >
              {cat.is_active ? (
                <Eye className="w-3.5 h-3.5" />
              ) : (
                <EyeOff className="w-3.5 h-3.5" />
              )}
              {cat.name}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
