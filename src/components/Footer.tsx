import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#0F1A24]/8 bg-white text-[#121d27]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-7 sm:py-8 flex flex-col items-center text-center">
        {/* Logo discreto em cinza no rodapé + Slogan logo abaixo */}
        <Link href="/" className="inline-flex items-center group opacity-85 hover:opacity-100 transition-opacity">
          <img
            src="/brand/logo-v4.png"
            alt="Combinado"
            className="h-7 sm:h-8 w-auto object-contain"
          />
        </Link>

        <p className="mt-1.5 text-xs sm:text-sm font-medium text-[#3d4a3c] max-w-md leading-snug">
          Conectando quem precisa a quem faz.
        </p>

        {/* Copyright */}
        <p className="mt-4 text-[11px] text-slate-400">
          © {new Date().getFullYear()} Combinado • Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
}
