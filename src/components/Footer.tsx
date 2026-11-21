import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#0F1A24]/8 bg-white text-[#121d27]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 sm:py-10 flex flex-col items-center text-center space-y-4">
        {/* Logo discreto em cinza no rodapé */}
        <Link href="/" className="inline-flex items-center gap-2 group opacity-75 hover:opacity-100 transition-opacity">
          <span className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 p-1 flex items-center justify-center shrink-0">
            <img
              src="/brand/logo-gray.png"
              alt="Combinado"
              className="w-full h-full object-contain"
            />
          </span>
          <span className="font-display font-bold text-lg leading-none tracking-tight text-slate-400">
            Combinado
          </span>
        </Link>

        {/* Descrição curta */}
        <p className="text-xs sm:text-sm text-[#3d4a3c] max-w-md leading-relaxed">
          Conectando você a profissionais locais de confiança, com avaliação transparente e contato direto no WhatsApp.
        </p>

        {/* Links essenciais centralizados */}
        <nav className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-5 gap-y-2 text-xs font-semibold text-[#121d27]">
          <Link href="/" className="hover:text-[#006e2a] transition-colors">
            Buscar serviços
          </Link>
          <span className="text-slate-300" aria-hidden="true">
            •
          </span>
          <Link
            href="/painel?modo=prestador"
            className="text-[#EA580C] hover:text-[#C2410C] transition-colors"
          >
            Oferecer serviços
          </Link>
          <span className="text-slate-300" aria-hidden="true">
            •
          </span>
          <Link href="/painel" className="hover:text-[#006e2a] transition-colors">
            Meu painel
          </Link>
          <span className="text-slate-300" aria-hidden="true">
            •
          </span>
          <Link href="/login" className="hover:text-[#006e2a] transition-colors">
            Entrar
          </Link>
        </nav>

        {/* Copyright */}
        <p className="text-[11px] text-slate-400 pt-1">
          © {new Date().getFullYear()} Combinado • Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
}
