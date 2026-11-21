"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Lock, XCircle } from "lucide-react";
import { useApp } from "./AppProvider";
import { ReputationLevelSelector } from "./ReputationThermometer";

export function PendingReviewBlockerModal() {
  const { overdueReviews, submitReview, postponeReview, closeWithoutReview } =
    useApp();
  const [step, setStep] = useState<"ask_deal" | "rate" | "not_closed">("ask_deal");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (overdueReviews.length === 0) return null;

  const currentItem = overdueReviews[0];

  const resetLocalState = () => {
    setStep("ask_deal");
    setRating(5);
    setComment("");
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = submitReview(currentItem.interaction_id, rating, comment);
    if (!res.ok) {
      setError(res.error || "Erro ao enviar avaliação.");
      return;
    }
    resetLocalState();
  };

  const handlePostpone = () => {
    postponeReview(currentItem.interaction_id, 3);
    resetLocalState();
  };

  const handleCloseDeal = () => {
    closeWithoutReview(currentItem.interaction_id);
    resetLocalState();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="blocker-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#050C16]/85 backdrop-blur-md"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-[var(--shadow-level-3)] border-2 border-[#EA580C]">
        <div className="flex items-center gap-2.5 text-[#ba1a1a] mb-3">
          <span className="w-9 h-9 rounded-full bg-[#ffdad6] flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider">
              Prazo de Avaliação Concluído
            </p>
            <h2 id="blocker-title" className="font-display font-bold text-lg text-[#121d27]">
              Como ficou o atendimento?
            </h2>
          </div>
        </div>

        <p className="text-sm text-[#3d4a3c] mb-4">
          Você iniciou contato com{" "}
          <strong className="text-[#121d27]">{currentItem.target_name}</strong>. Para
          manter o ranking justo no Combinado, conte em segundos o que aconteceu.
        </p>

        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F6F8FC] mb-4">
          {currentItem.target_avatar ? (
            <img
              src={currentItem.target_avatar}
              alt={currentItem.target_name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#00B048]/15 text-[#006e2a] flex items-center justify-center font-display font-bold">
              {currentItem.target_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-display font-semibold text-sm text-[#121d27]">
              {currentItem.target_name}
            </p>
            <p className="text-xs text-[#3d4a3c]">
              {overdueReviews.length}{" "}
              {overdueReviews.length === 1 ? "pendência" : "pendências"}
            </p>
          </div>
        </div>

        {step === "ask_deal" && (
          <div className="space-y-2.5">
            <p className="text-xs font-bold text-[#121d27]">
              Vocês fecharam o serviço?
            </p>

            <button
              type="button"
              onClick={() => setStep("rate")}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-[#00B048]/35 bg-[#EBF9EF] hover:bg-[#00B048]/15 text-[#006e2a] font-display font-bold text-sm transition-colors cursor-pointer text-left"
            >
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>
                <div>Sim, serviço concluído</div>
                <div className="text-[11px] font-normal text-[#3d4a3c]">
                  Avaliar agora no termômetro
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={handlePostpone}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100/70 text-amber-900 font-display font-bold text-sm transition-colors cursor-pointer text-left"
            >
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <div>Ainda está em andamento</div>
                <div className="text-[11px] font-normal text-amber-800/80">
                  Lembrar novamente em +3 dias
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setStep("not_closed")}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-[#0F1A24]/15 bg-[#F6F8FC] hover:bg-slate-100 text-[#121d27] font-display font-bold text-sm transition-colors cursor-pointer text-left"
            >
              <XCircle className="w-5 h-5 text-slate-500 shrink-0" />
              <div>
                <div>Não fechamos negócio</div>
                <div className="text-[11px] font-normal text-[#3d4a3c]">
                  Foi só orçamento ou não avançou
                </div>
              </div>
            </button>
          </div>
        )}

        {step === "not_closed" && (
          <div className="space-y-4">
            <p className="text-xs font-semibold text-[#121d27]">
              O contato respondeu no WhatsApp?
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleCloseDeal}
                className="py-3 px-4 rounded-xl border border-[#00B048]/30 bg-[#EBF9EF] text-[#006e2a] font-bold text-xs cursor-pointer hover:bg-[#00B048]/15"
              >
                Sim, respondeu
              </button>
              <button
                type="button"
                onClick={handleCloseDeal}
                className="py-3 px-4 rounded-xl border border-[#0F1A24]/15 bg-[#F6F8FC] text-[#121d27] font-bold text-xs cursor-pointer hover:bg-slate-100"
              >
                Não respondeu
              </button>
            </div>
            <button
              type="button"
              onClick={() => setStep("ask_deal")}
              className="text-xs text-[#3d4a3c] hover:underline cursor-pointer"
            >
              ← Voltar
            </button>
          </div>
        )}

        {step === "rate" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#121d27] mb-2">
                Como foi o atendimento?
              </label>
              <ReputationLevelSelector value={rating} onChange={setRating} />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#121d27] mb-1">
                Comentário obrigatório *
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Conte se foi pontual, educado, se entregou bem..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#0F1A24]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#EA580C]/30 focus:border-[#EA580C]"
              />
            </div>

            {error && (
              <p className="text-xs font-semibold text-[#ba1a1a] bg-[#ffdad6] px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("ask_deal")}
                className="px-4 py-3 rounded-full border border-[#0F1A24]/15 text-xs font-semibold text-[#121d27] cursor-pointer"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white font-semibold text-sm shadow-sm cursor-pointer transition-colors"
              >
                Enviar Avaliação
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
