"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  MessageCircle,
  Phone,
  Shield,
  UserCheck,
  Wrench,
  X,
} from "lucide-react";
import { useApp } from "./AppProvider";
import { AvatarUploader } from "./AvatarUploader";
import { formatWhatsApp, cleanDigits } from "@/utils/validators";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export function QuickAuthModal() {
  const router = useRouter();
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalReason,
    loginAsDemo,
    registerOrLoginQuick,
    signUpWithSupabase,
    signInWithSupabase,
  } = useApp();

  const supabaseEnabled = isSupabaseConfigured();
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [roleChoice, setRoleChoice] = useState<"client" | "provider">("client");
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const generateNewOtp = () => {
    const code = String(Math.floor(1000 + Math.random() * 9000));
    setGeneratedOtp(code);
    setOtpInput("");
  };

  const resetFormState = () => {
    setFullName("");
    setDisplayName("");
    setWhatsapp("");
    setEmail("");
    setPassword("");
    setAvatarUrl("");
    setOtpInput("");
    setGeneratedOtp("");
    setStep("form");
    setError(null);
    setInfoMessage(null);
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    if (fullName.trim().length < 3) {
      setError("Informe seu nome completo.");
      return;
    }
    if (cleanDigits(whatsapp).length < 10) {
      setError("Informe um WhatsApp válido com DDD (ex: 95 99999-0000).");
      return;
    }
    if (supabaseEnabled) {
      if (!email.trim() || !email.includes("@")) {
        setError("Informe um e-mail válido para acessar sua conta.");
        return;
      }
      if (password.length < 6) {
        setError("A senha deve ter pelo menos 6 caracteres.");
        return;
      }

      const goProvider = roleChoice === "provider";
      setIsSubmitting(true);
      const res = await signUpWithSupabase({
        full_name: fullName,
        display_name: displayName || fullName.split(" ")[0],
        whatsapp,
        email,
        password,
        avatar_url: avatarUrl.trim() || null,
      });
      setIsSubmitting(false);

      if (!res.ok) {
        setError(res.error || "Não foi possível criar sua conta.");
        return;
      }
      if (res.needsEmailConfirm) {
        setInfoMessage(
          "Conta criada! Enviamos um link de confirmação para o seu e-mail. Confirme-o para entrar."
        );
        return;
      }
      resetFormState();
      if (goProvider) {
        router.push("/painel?modo=prestador");
      }
      return;
    }
    generateNewOtp();
    setStep("otp");
  };

  const handleConfirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    if (otpInput.trim() !== generatedOtp) {
      setError("Código incorreto. Confira os 4 dígitos enviados para o seu WhatsApp.");
      return;
    }

    const goProvider = roleChoice === "provider";

    if (supabaseEnabled) {
      setIsSubmitting(true);
      const res = await signUpWithSupabase({
        full_name: fullName,
        display_name: displayName || fullName.split(" ")[0],
        whatsapp,
        email,
        password,
        avatar_url: avatarUrl.trim() || null,
      });
      setIsSubmitting(false);

      if (!res.ok) {
        setError(res.error || "Não foi possível criar sua conta.");
        return;
      }
      if (res.needsEmailConfirm) {
        setInfoMessage(
          "Conta criada! Enviamos um link de confirmação para o seu e-mail. Confirme-o para entrar."
        );
        setStep("form");
        return;
      }
      resetFormState();
      if (goProvider) {
        router.push("/painel?modo=prestador");
      }
      return;
    }

    registerOrLoginQuick({
      full_name: fullName,
      display_name: displayName || fullName.split(" ")[0],
      whatsapp,
      avatar_url: avatarUrl.trim() || null,
    });
    resetFormState();
    if (goProvider) {
      router.push("/painel?modo=prestador");
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    if (!email.trim() || !password) {
      setError("Informe seu e-mail e senha.");
      return;
    }
    setIsSubmitting(true);
    const res = await signInWithSupabase({ email, password });
    setIsSubmitting(false);
    if (!res.ok) {
      setError(res.error || "E-mail ou senha inválidos.");
      return;
    }
    resetFormState();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050C16]/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-[var(--shadow-level-3)] max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={closeAuthModal}
          aria-label="Fechar modal"
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <span className="w-8 h-8 rounded-xl bg-[#00B048] flex items-center justify-center text-white">
            <CheckCircle2 className="w-4 h-4" />
          </span>
          <h2 className="font-display font-bold text-xl text-[#121d27]">
            Criar Conta ou Entrar
          </h2>
        </div>

        <p className="text-sm text-[#3d4a3c] mb-4">
          {authModalReason ||
            (supabaseEnabled
              ? "Escolha como deseja usar o Combinado e crie sua conta em segundos."
              : "Escolha como deseja usar o Combinado e confirme seu WhatsApp em segundos.")}
        </p>

        {supabaseEnabled && (
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#F6F8FC] border border-[#0F1A24]/8 mb-4">
            <button
              type="button"
              onClick={() => {
                setAuthMode("signup");
                setError(null);
                setInfoMessage(null);
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                authMode === "signup"
                  ? "bg-white text-[#121d27] shadow-xs"
                  : "text-[#3d4a3c] hover:text-[#121d27]"
              }`}
            >
              Criar Conta
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setError(null);
                setInfoMessage(null);
              }}
              className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                authMode === "login"
                  ? "bg-white text-[#121d27] shadow-xs"
                  : "text-[#3d4a3c] hover:text-[#121d27]"
              }`}
            >
              Já tenho conta (Entrar)
            </button>
          </div>
        )}

        {infoMessage && (
          <div className="mb-3 p-3 rounded-xl bg-[#EBF9EF] border border-[#00B048]/25 text-xs font-semibold text-[#006e2a]">
            {infoMessage}
          </div>
        )}

        {authMode === "login" && supabaseEnabled ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#121d27] mb-1">
                E-mail *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#0F1A24]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B048]/30 focus:border-[#00B048]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#121d27] mb-1">
                Senha *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-[#0F1A24]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B048]/30 focus:border-[#00B048]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Ocultar senha" : "Visualizar senha"}
                  className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs font-semibold text-[#ba1a1a] bg-[#ffdad6] px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-full bg-[#00B048] hover:bg-[#006e2a] disabled:opacity-60 text-white font-semibold text-sm shadow-sm transition-all cursor-pointer"
            >
              {isSubmitting ? "Entrando..." : "Entrar na Minha Conta"}
            </button>
          </form>
        ) : step === "form" ? (
          <form onSubmit={handleRequestOtp} className="space-y-3.5">
            {/* Seletor claro: Cliente ou Profissional */}
            <div>
              <label className="block text-xs font-semibold text-[#121d27] mb-1.5">
                Como você quer usar o Combinado? *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRoleChoice("client")}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    roleChoice === "client"
                      ? "bg-[#00B048]/12 border-[#00B048] text-[#006e2a] shadow-xs"
                      : "bg-[#F6F8FC] border-[#0F1A24]/10 text-[#3d4a3c] hover:bg-slate-100"
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Quero Contratar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRoleChoice("provider")}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    roleChoice === "provider"
                      ? "bg-[#EA580C]/12 border-[#EA580C] text-[#C2410C] shadow-xs"
                      : "bg-[#F6F8FC] border-[#0F1A24]/10 text-[#3d4a3c] hover:bg-slate-100"
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  <span>Oferecer Serviços</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#121d27] mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Maria Silva"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#0F1A24]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B048]/30 focus:border-[#00B048]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#121d27] mb-1">
                  Como quer ser chamado
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ex: Maria"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#0F1A24]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B048]/30 focus:border-[#00B048]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#121d27] mb-1">
                  WhatsApp (com DDD) *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(formatWhatsApp(e.target.value))}
                    placeholder="(95) 99999-0000"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#0F1A24]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B048]/30 focus:border-[#00B048]"
                  />
                </div>
              </div>
            </div>

            {supabaseEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#121d27] mb-1">
                    E-mail *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#0F1A24]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B048]/30 focus:border-[#00B048]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#121d27] mb-1">
                    Senha *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-[#0F1A24]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#00B048]/30 focus:border-[#00B048]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Ocultar senha" : "Visualizar senha"}
                      className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#3d4a3c] mt-1">
                    Mínimo de 6 caracteres (recomendado misturar letras e números).
                  </p>
                </div>
              </div>
            )}

            <AvatarUploader value={avatarUrl} onChange={setAvatarUrl} />

            {!avatarUrl.trim() && (
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Atenção:</strong> Perfis sem foto real passam pouca credibilidade e
                  recebem até 80% menos contatos. Adicione uma foto clara do seu rosto!
                </span>
              </div>
            )}

            {error && (
              <p className="text-xs font-semibold text-[#ba1a1a] bg-[#ffdad6] px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-full bg-[#EA580C] hover:bg-[#C2410C] disabled:opacity-60 text-white font-semibold text-sm shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {supabaseEnabled ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {isSubmitting
                    ? "Criando conta..."
                    : roleChoice === "provider"
                      ? "Criar Conta e Completar Perfil"
                      : "Criar Conta e Entrar"}
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4" />
                  {roleChoice === "provider"
                    ? "Confirmar WhatsApp e Completar Perfil"
                    : "Enviar Código no WhatsApp"}
                </>
              )}
            </button>

            <button
              type="button"
              onClick={closeAuthModal}
              className="w-full py-2 text-xs font-semibold text-[#3d4a3c] hover:text-[#121d27] hover:underline cursor-pointer"
            >
              ← Voltar
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirmOtp} className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#EBF9EF] border border-[#00B048]/25 text-xs text-[#006e2a] space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4" />
                Código enviado para {whatsapp}
              </p>
              <p className="text-[#121d27]/80">
                (Modo teste: seu código de confirmação é{" "}
                <strong className="font-mono text-sm text-[#006e2a] bg-white px-1.5 py-0.5 rounded">
                  {generatedOtp}
                </strong>
                )
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#121d27] mb-1">
                Digite o código de 4 dígitos *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="0000"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#0F1A24]/15 text-base font-mono tracking-[0.35em] focus:outline-none focus:ring-2 focus:ring-[#00B048]/30 focus:border-[#00B048]"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-semibold text-[#ba1a1a] bg-[#ffdad6] px-3 py-2 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-full bg-[#00B048] hover:bg-[#006e2a] disabled:opacity-60 text-white font-semibold text-sm shadow-sm transition-all cursor-pointer"
            >
              {isSubmitting
                ? "Criando conta..."
                : roleChoice === "provider"
                  ? "Confirmar e Ir para Meu Cadastro Profissional"
                  : "Confirmar Código e Entrar"}
            </button>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => {
                  setStep("form");
                  setError(null);
                }}
                className="text-[#3d4a3c] hover:underline cursor-pointer"
              >
                Alterar número
              </button>
              <button
                type="button"
                onClick={() => {
                  generateNewOtp();
                  setError(null);
                }}
                className="text-[#006e2a] font-semibold hover:underline cursor-pointer"
              >
                Reenviar código
              </button>
            </div>
          </form>
        )}

        {/* Acesso Rápido Demo no rodapé do modal (apenas quando Supabase não está configurado) */}
        {!supabaseEnabled && (
          <div className="mt-5 pt-4 border-t border-[#0F1A24]/10">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#3d4a3c] mb-2 text-center">
              Ou entre rápido para testar (Modo Demonstração)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => loginAsDemo("client")}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-[#F6F8FC] border border-[#0F1A24]/10 hover:border-[#00B048] text-xs font-semibold text-[#121d27] transition-all cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#00B048]" />
                <span>Cliente</span>
              </button>
              <button
                type="button"
                onClick={() => loginAsDemo("provider")}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-[#F6F8FC] border border-[#0F1A24]/10 hover:border-[#EA580C] text-xs font-semibold text-[#121d27] transition-all cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5 text-[#EA580C]" />
                <span>Profissional</span>
              </button>
              <button
                type="button"
                onClick={() => loginAsDemo("admin")}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-[#F6F8FC] border border-[#0F1A24]/10 hover:border-[#0F1A24] text-xs font-semibold text-[#121d27] transition-all cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-[#0F1A24]" />
                <span>Admin</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
