import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#0F1A24]/8 bg-white text-[#121d27]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-7 sm:py-8 flex flex-col items-center text-center">
        {/* Logo no rodapé + Slogan logo abaixo */}
        <Link href="/" className="inline-flex items-center group opacity-85 hover:opacity-100 transition-opacity">
          <img
            src="/brand/logo-v3.png"
            alt="Combinado"
            className="h-7 sm:h-8 w-auto object-contain"
          />
        </Link>

        <p className="mt-1.5 text-xs sm:text-sm font-medium text-[#3d4a3c] max-w-md leading-snug">
          Conectando quem precisa a quem faz.
        </p>

        {/* Links institucionais */}
        <nav
          aria-label="Links institucionais"
          className="mt-4 flex flex-wrap items-center justify-center gap-x-3 sm:gap-x-4 gap-y-1.5 text-xs font-medium text-[#3d4a3c]"
        >
          <Link href="/sobre" className="hover:text-[#006e2a] transition-colors">
            Sobre
          </Link>
          <span className="text-slate-300" aria-hidden="true">
            •
          </span>
          <Link href="/quem-somos" className="hover:text-[#006e2a] transition-colors">
            Quem Somos
          </Link>
          <span className="text-slate-300" aria-hidden="true">
            •
          </span>
          <Link href="/duvidas" className="hover:text-[#006e2a] transition-colors">
            Dúvidas Frequentes
          </Link>
          <span className="text-slate-300" aria-hidden="true">
            •
          </span>
          <Link href="/termos" className="hover:text-[#006e2a] transition-colors">
            Termos e Condições
          </Link>
          <span className="text-slate-300" aria-hidden="true">
            •
          </span>
          <Link href="/privacidade" className="hover:text-[#006e2a] transition-colors">
            Política de Privacidade
          </Link>
          <span className="text-slate-300" aria-hidden="true">
            •
          </span>
          <Link href="/suporte" className="hover:text-[#006e2a] transition-colors">
            Suporte
          </Link>
        </nav>

        {/* Copyright */}
        <p className="mt-3 text-[11px] text-slate-400">
          © {new Date().getFullYear()} Combinado • Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
}
