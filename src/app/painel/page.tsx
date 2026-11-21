"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  LogOut,
  Power,
  RotateCcw,
  ShieldAlert,
  User,
  Wrench,
} from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { AvatarUploader } from "@/components/AvatarUploader";
import { BackNavigation } from "@/components/BackNavigation";
import {
  ReputationLevelSelector,
  ReputationThermometer,
  THERMOMETER_LEVELS,
  ThermometerLevel,
} from "@/components/ReputationThermometer";
import { formatCPF, formatWhatsApp } from "@/utils/validators";

const EXPERIENCE_OPTIONS = [
  "Menos de 1 ano",
  "1 a 3 anos",
  "3 a 5 anos",
  "Mais de 5 anos",
];

export default function PainelPage() {
  const { currentUser, openAuthModal } = useApp();

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto px-4 pt-12">
        <div className="rounded-2xl bg-white border border-[#0F1A24]/8 p-8 text-center shadow-[var(--shadow-level-1)]">
          <span className="w-14 h-14 rounded-2xl bg-[#00B048]/12 text-[#006e2a] flex items-center justify-center mx-auto mb-4">
            <User className="w-7 h-7" />
          </span>
          <h1 className="font-display font-bold text-2xl text-[#121d27]">
            Acesse seu Painel Combinado
          </h1>
          <p className="text-sm text-[#3d4a3c] mt-2 mb-6">
            Entre para gerenciar seus contatos, ativar o modo profissional ou alternar sua
            disponibilidade em tempo real.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal("Escolha um perfil demo ou crie sua conta rápida.")}
            className="px-7 py-3 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-sm cursor-pointer transition-colors"
          >
            Entrar / Criar Conta
          </button>
        </div>
      </div>
    );
  }

  return <PainelContent key={currentUser.id} />;
}

function PainelContent() {
  const {
    currentUser: maybeUser,
    currentProviderDetails,
    currentProviderCategoryIds,
    categories,
    interactions,
    profiles,
    pendingReviews,
    logout,
    toggleAvailability,
    activateProviderMode,
    updateProfile,
    submitReview,
    simulateOverdueReview,
    resetDemoData,
  } = useApp();

  const currentUser = maybeUser!;

  // Form states for profile
  const [fullName, setFullName] = useState(currentUser.full_name);
  const [displayName, setDisplayName] = useState(currentUser.display_name);
  const [whatsapp, setWhatsapp] = useState(formatWhatsApp(currentUser.whatsapp || ""));
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatar_url || "");
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Form states for provider activation/edit
  const [showProviderForm, setShowProviderForm] = useState(false);
  const [cpf, setCpf] = useState(formatCPF(currentProviderDetails?.cpf || ""));
  const [bio, setBio] = useState(currentProviderDetails?.bio || "");
  const [experienceTime, setExperienceTime] = useState(
    currentProviderDetails?.experience_time || EXPERIENCE_OPTIONS[1]
  );
  const [neighborhoods, setNeighborhoods] = useState(
    currentProviderDetails?.neighborhoods || ""
  );
  const [avgCompletionDays, setAvgCompletionDays] = useState<number>(
    currentProviderDetails?.avg_completion_days ?? 1
  );
  const [selectedCatIds, setSelectedCatIds] = useState<number[]>(
    currentProviderCategoryIds
  );
  const [providerError, setProviderError] = useState<string | null>(null);
  const [providerSuccess, setProviderSuccess] = useState<string | null>(null);

  // Early review form state
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);

  const userInteractions = interactions.filter(
    (i) => i.client_id === currentUser.id || i.provider_id === currentUser.id
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      full_name: fullName,
      display_name: displayName,
      whatsapp,
      avatar_url: avatarUrl.trim() || null,
    });
    setProfileMsg("Perfil atualizado com sucesso!");
    setTimeout(() => setProfileMsg(null), 3000);
  };

  const handleToggleCategory = (id: number) => {
    setSelectedCatIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSaveProvider = (e: React.FormEvent) => {
    e.preventDefault();
    setProviderError(null);
    setProviderSuccess(null);

    const res = activateProviderMode({
      cpf,
      bio,
      experience_time: experienceTime,
      neighborhoods,
      avg_completion_days: avgCompletionDays,
      categoryIds: selectedCatIds,
    });

    if (!res.ok) {
      setProviderError(res.error || "Erro ao salvar dados profissionais.");
      return;
    }

    setProviderSuccess("Modo Profissional ativo e atualizado no catálogo!");
    setShowProviderForm(false);
  };

  const handleEarlyReviewSubmit = (e: React.FormEvent, interactionId: string) => {
    e.preventDefault();
    setReviewError(null);
    const res = submitReview(interactionId, reviewRating, reviewComment);
    if (!res.ok) {
      setReviewError(res.error || "Erro ao enviar.");
      return;
    }
    setReviewingId(null);
    setReviewRating(5);
    setReviewComment("");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
      <BackNavigation backLabel="Voltar" />
      {/* Top Bar do Usuário */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-[#121d27]">
            Olá, {currentUser.display_name}
          </h1>
          <div className="mt-2 space-y-1">
            <p className="text-xs font-semibold text-[#3d4a3c]">
              Conta única • Reputação como cliente:
            </p>
            <ReputationThermometer
              ratingAvg={currentUser.client_rating_avg}
              reviewsCount={currentUser.client_reviews_count}
              size="compact"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser.is_admin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0F1A24] text-white text-xs font-semibold"
            >
              <ShieldAlert className="w-4 h-4 text-[#7ED957]" />
              Painel Admin
            </Link>
          )}
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#0F1A24]/15 bg-white text-xs font-semibold text-[#121d27] hover:bg-slate-50 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair
          </button>
        </div>
      </div>

      {/* CHAVE LIGA/DESLIGA MODERNA (Se for Profissional) */}
      {currentUser.is_provider && currentProviderDetails ? (
        <div
          className={`rounded-2xl p-6 text-white shadow-[var(--shadow-level-2)] transition-all duration-300 ${
            currentProviderDetails.is_available
              ? "bg-gradient-to-r from-[#006e2a] to-[#00B048]"
              : "bg-gradient-to-r from-[#1e293b] to-[#334155]"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/15 text-[11px] font-bold uppercase tracking-wider mb-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    currentProviderDetails.is_available
                      ? "bg-[#9cf973] animate-pulse"
                      : "bg-amber-400"
                  }`}
                />
                Status no Catálogo
              </div>
              <h2 className="font-display font-bold text-2xl">
                {currentProviderDetails.is_available
                  ? "Você está Disponível"
                  : "Você está Ocupado"}
              </h2>
              <p className="text-xs sm:text-sm text-white/90 mt-1">
                {currentProviderDetails.is_available
                  ? "Seu perfil aparece no topo das buscas com o botão do WhatsApp liberado."
                  : "Seu WhatsApp está pausado para novos clientes. Desative quando estiver livre."}
              </p>
              <p className="text-[11px] text-white/70 mt-1.5">
                Dica: você também pode alternar esse status com 1 clique direto na barra do topo.
              </p>
            </div>

            {/* Switch moderno de 2 estados */}
            <div className="bg-black/20 p-1.5 rounded-2xl flex items-center gap-1.5 shrink-0 self-start sm:self-center">
              <button
                type="button"
                onClick={() => {
                  if (!currentProviderDetails.is_available) toggleAvailability();
                }}
                className={`px-4 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
                  currentProviderDetails.is_available
                    ? "bg-white text-[#006e2a] shadow-md"
                    : "text-white/75 hover:text-white"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-[#00B048]" />
                Disponível
              </button>
              <button
                type="button"
                onClick={() => {
                  if (currentProviderDetails.is_available) toggleAvailability();
                }}
                className={`px-4 py-2.5 rounded-xl font-display font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-2 ${
                  !currentProviderDetails.is_available
                    ? "bg-amber-400 text-[#0F1A24] shadow-md"
                    : "text-white/75 hover:text-white"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Ocupado
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Botão Quero oferecer meus serviços */
        <div className="rounded-2xl bg-gradient-to-r from-[#C2410C] to-[#EA580C] p-6 text-white shadow-[var(--shadow-level-2)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-xl">
              Quer trabalhar pelo Combinado?
            </h2>
            <p className="text-sm text-white/90 mt-1">
              Ative o modo profissional na sua mesma conta e receba chamados direto no seu
              WhatsApp.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowProviderForm((v) => !v)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-[#C2410C] font-display font-bold text-sm shadow-sm hover:scale-[1.02] transition-transform cursor-pointer shrink-0"
          >
            <Wrench className="w-4 h-4" />
            Quero oferecer meus serviços
          </button>
        </div>
      )}

      {/* Formulário Profissional (Ativação ou Edição) */}
      {(showProviderForm || currentUser.is_provider) && (
        <section className="rounded-2xl bg-white border border-[#0F1A24]/8 p-5 sm:p-6 shadow-[var(--shadow-level-1)]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg text-[#121d27]">
              {currentUser.is_provider
                ? "Meus Dados Profissionais"
                : "Ativar Modo Profissional"}
            </h2>
            {currentUser.is_provider && (
              <Link
                href={`/profissional/${currentUser.id}`}
                className="text-xs font-semibold text-[#006e2a] hover:underline"
              >
                Ver minha ficha pública →
              </Link>
            )}
          </div>

          <form onSubmit={handleSaveProvider} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#121d27] mb-1">
                  CPF (validado matematicamente) *
                </label>
                <input
                  type="text"
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#0F1A24]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B048]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#121d27] mb-1">
                  Tempo de Experiência *
                </label>
                <select
                  value={experienceTime}
                  onChange={(e) => setExperienceTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#0F1A24]/15 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00B048]/30"
                >
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#121d27] mb-1.5">
                Categorias que você atende *
              </label>
              <div className="flex flex-wrap gap-2">
                {categories
                  .filter((c) => c.is_active)
                  .map((cat) => {
                    const active = selectedCatIds.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleToggleCategory(cat.id)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${
                          active
                            ? "bg-[#00B048] text-white border-[#00B048]"
                            : "bg-white text-[#121d27] border-[#0F1A24]/15 hover:border-[#00B048]"
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#121d27] mb-1">
                Prazo médio para concluir um serviço *
              </label>
              <select
                value={avgCompletionDays}
                onChange={(e) => setAvgCompletionDays(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#0F1A24]/15 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#00B048]/30"
              >
                <option value={1}>No mesmo dia (até 24h)</option>
                <option value={3}>2 a 3 dias</option>
                <option value={7}>4 a 7 dias</option>
                <option value={14}>Mais de 7 dias (obras/projetos)</option>
              </select>
              <p className="text-[11px] text-[#3d4a3c] mt-1">
                Esse prazo define quando o sistema pede a avaliação para você e para o cliente após abrir o WhatsApp.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#121d27] mb-1">
                Bairros que atende *
              </label>
              <input
                type="text"
                value={neighborhoods}
                onChange={(e) => setNeighborhoods(e.target.value)}
                placeholder="Ex: Centro, Paraviana, Caçari, Mecejana"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#0F1A24]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B048]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#121d27] mb-1">
                Resumo dos seus serviços (Bio) *
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Descreva sua especialidade, ferramentas próprias, horário..."
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#0F1A24]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B048]/30"
              />
            </div>

            {providerError && (
              <p className="text-xs font-semibold text-[#ba1a1a] bg-[#ffdad6] px-3.5 py-2.5 rounded-lg">
                {providerError}
              </p>
            )}
            {providerSuccess && (
              <p className="text-xs font-semibold text-[#006e2a] bg-[#EBF9EF] px-3.5 py-2.5 rounded-lg flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> {providerSuccess}
              </p>
            )}

            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-[#00B048] hover:bg-[#006e2a] text-white font-semibold text-sm cursor-pointer transition-colors"
            >
              Salvar Dados Profissionais
            </button>
          </form>
        </section>
      )}

      {/* Dados Pessoais & UX Nudge de Foto */}
      <section className="rounded-2xl bg-white border border-[#0F1A24]/8 p-5 sm:p-6 shadow-[var(--shadow-level-1)]">
        <h2 className="font-display font-bold text-lg text-[#121d27] mb-4">
          Dados da Conta Pessoal
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#121d27] mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#0F1A24]/15 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#121d27] mb-1">
                Nome de Exibição
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#0F1A24]/15 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#121d27] mb-1">
                WhatsApp
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(formatWhatsApp(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#0F1A24]/15 text-sm"
              />
            </div>
          </div>

          <AvatarUploader value={avatarUrl} onChange={setAvatarUrl} />

          {!avatarUrl.trim() && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Atenção:</strong> Perfis sem foto real passam pouca credibilidade e
                recebem até 80% menos contatos. Adicione uma foto clara do seu rosto!
              </span>
            </div>
          )}

          {profileMsg && (
            <p className="text-xs font-semibold text-[#006e2a] bg-[#EBF9EF] px-3 py-2 rounded-lg">
              {profileMsg}
            </p>
          )}

          <button
            type="submit"
            className="px-5 py-2.5 rounded-full bg-[#121d27] hover:bg-[#27313c] text-white text-xs font-semibold cursor-pointer"
          >
            Atualizar Perfil
          </button>
        </form>
      </section>

      {/* Histórico de Contatos e Avaliações Antecipadas */}
      <section className="rounded-2xl bg-white border border-[#0F1A24]/8 p-5 sm:p-6 shadow-[var(--shadow-level-1)]">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="font-display font-bold text-lg text-[#121d27]">
              Histórico de Contatos & Avaliações ({userInteractions.length})
            </h2>
            <p className="text-xs text-[#3d4a3c]">
              Você pode avaliar antecipadamente sem precisar esperar as 24 horas.
            </p>
          </div>
          {pendingReviews.length > 0 && (
            <span className="px-3 py-1 rounded-full bg-[#EA580C]/10 text-[#C2410C] text-xs font-semibold">
              {pendingReviews.length} pendente(s)
            </span>
          )}
        </div>

        {userInteractions.length === 0 ? (
          <p className="text-sm text-[#3d4a3c]">Nenhum contato registrado ainda.</p>
        ) : (
          <div className="space-y-3">
            {userInteractions.map((inter) => {
              const amClient = inter.client_id === currentUser.id;
              const otherId = amClient ? inter.provider_id : inter.client_id;
              const other = profiles.find((p) => p.id === otherId);
              const myRating = amClient ? inter.client_rating : inter.provider_rating;
              const myComment = amClient ? inter.client_comment : inter.provider_comment;

              return (
                <div
                  key={inter.id}
                  className="p-4 rounded-xl bg-[#F6F8FC] border border-[#0F1A24]/6 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {other?.avatar_url ? (
                        <img
                          src={other.avatar_url}
                          alt={other.display_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="w-10 h-10 rounded-full bg-[#00B048]/15 text-[#006e2a] flex items-center justify-center font-bold text-xs">
                          {(other?.display_name || "U").charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div>
                        <p className="font-display font-semibold text-sm text-[#121d27]">
                          {other?.display_name || "Usuário"}{" "}
                          <span className="text-xs font-normal text-[#3d4a3c]">
                            ({amClient ? "Profissional contatado" : "Cliente que chamou você"})
                          </span>
                        </p>
                        <p className="text-[11px] text-[#3d4a3c] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Liberado em {new Date(inter.unlocked_at).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>

                    {inter.deal_status === "not_closed" ? (
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                        Sem negócio fechado
                      </span>
                    ) : myRating ? (
                      (() => {
                        const lvl = Math.min(
                          5,
                          Math.max(1, Math.round(myRating))
                        ) as ThermometerLevel;
                        const cfg = THERMOMETER_LEVELS[lvl];
                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${cfg.badgeClass}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${cfg.bgClass}`} />
                            Avaliado: {cfg.label}
                          </span>
                        );
                      })()
                    ) : (
                      <button
                        type="button"
                        onClick={() => setReviewingId(inter.id)}
                        className="px-4 py-1.5 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-semibold cursor-pointer"
                      >
                        Avaliar Agora
                      </button>
                    )}
                  </div>

                  {!amClient && other && (
                    <div className="rounded-xl bg-white border border-[#0F1A24]/10 p-3 space-y-1.5">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-[#3d4a3c]">
                        Reputação deste cliente (visível apenas após contato)
                      </p>
                      <ReputationThermometer
                        ratingAvg={other.client_rating_avg}
                        reviewsCount={other.client_reviews_count}
                        size="compact"
                      />
                    </div>
                  )}

                  {myComment && (
                    <p className="text-xs text-[#3d4a3c] italic">
                      Seu comentário: &ldquo;{myComment}&rdquo;
                    </p>
                  )}

                  {reviewingId === inter.id && (
                    <form
                      onSubmit={(e) => handleEarlyReviewSubmit(e, inter.id)}
                      className="p-3.5 rounded-xl bg-white border border-[#0F1A24]/10 space-y-3"
                    >
                      <ReputationLevelSelector value={reviewRating} onChange={setReviewRating} />
                      <textarea
                        rows={2}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Escreva seu comentário sobre o atendimento..."
                        className="w-full px-3 py-2 rounded-lg border border-[#0F1A24]/15 text-sm"
                      />
                      {reviewError && (
                        <p className="text-xs text-[#ba1a1a] font-semibold">{reviewError}</p>
                      )}
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-full bg-[#00B048] text-white text-xs font-semibold cursor-pointer"
                        >
                          Enviar Avaliação
                        </button>
                        <button
                          type="button"
                          onClick={() => setReviewingId(null)}
                          className="px-4 py-2 rounded-full bg-slate-100 text-xs font-semibold cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Ferramentas de Teste do Modo Mock */}
      <section className="rounded-2xl bg-[#edf4ff] border border-[#00B048]/20 p-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-display font-semibold text-xs text-[#006e2a] uppercase tracking-wider">
            Controles de Simulação (Mock Data)
          </p>
          <p className="text-xs text-[#3d4a3c]">
            Teste a Trava Obrigatória de 24h instantaneamente ou restaure os dados iniciais.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={simulateOverdueReview}
            className="px-4 py-2 rounded-full bg-[#EA580C] text-white text-xs font-semibold cursor-pointer hover:bg-[#C2410C]"
          >
            Simular Trava de 24h
          </button>
          <button
            type="button"
            onClick={resetDemoData}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#0F1A24]/15 text-xs font-semibold text-[#121d27] cursor-pointer hover:bg-slate-50"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Resetar Dados
          </button>
        </div>
      </section>
    </div>
  );
}
