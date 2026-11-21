"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/components/AppProvider";

export default function LoginPage() {
  const { currentUser, openAuthModal } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      router.replace("/painel");
    } else {
      openAuthModal();
    }
  }, [currentUser, openAuthModal, router]);

  return (
    <div className="max-w-md mx-auto px-4 pt-16 text-center">
      <h1 className="font-display font-bold text-2xl text-[#121d27]">
        Entrar no Combinado
      </h1>
      <p className="text-sm text-[#3d4a3c] mt-2 mb-6">
        Acesse sua conta ou crie um cadastro rápido em segundos.
      </p>
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => openAuthModal()}
          className="px-7 py-3 rounded-full bg-[#EA580C] text-white font-semibold text-sm cursor-pointer"
        >
          Abrir Login / Cadastro
        </button>
        <Link
          href="/"
          className="text-sm font-semibold text-[#3d4a3c] hover:text-[#121d27] hover:underline"
        >
          ← Voltar para o início
        </Link>
      </div>
    </div>
  );
}
