# Combinado! — Catálogo de Serviços Locais (MVP)

Plataforma Mobile-First / PWA para contratação rápida de prestadores de serviços locais via WhatsApp, com sistema de ranking e **Trava de Avaliação Mútua Obrigatória (24h)**.

## Rodando localmente (Modo Mock Data)

O projeto já vem pronto para validação visual e funcional com **Mock Data** (10 profissionais, 8 categorias, banner e avaliações iniciais) persistido em `localStorage`:

```bash
cd web
npm install
npm run dev
```

Acesse `http://localhost:3000`.

### O que testar no Modo Demo
- **Catálogo e Ranking:** Busque por termo/bairro ou navegue pelas 8 categorias. Profissionais indisponíveis ficam no final da fila em destaque acinzentado.
- **Desbloqueio de WhatsApp:** Entre em `/profissional/[id]` e clique em *Falar no WhatsApp Agora* (como visitante, abre o cadastro rápido em 10s).
- **Trava Obrigatória de 24h:** No `/painel`, clique em **Simular Trava de 24h** para testar o modal bloqueante que exige nota + comentário antes de continuar navegando.
- **Modo Prestador e Validação de CPF:** No `/painel`, teste a chave Liga/Desliga de disponibilidade ou ative o modo profissional com validação matemática de CPF.
- **Painel Admin (`/admin`):** Entre como Admin no acesso rápido para gerenciar banners, banir/desbanir usuários, moderar comentários e gerenciar categorias.

---

## Conectando ao Supabase (Produção)

1. Crie um projeto no [Supabase](https://supabase.com).
2. No **SQL Editor** do Supabase, execute o arquivo [`supabase/schema.sql`](./supabase/schema.sql) para criar todas as tabelas, índices, triggers de recálculo de notas, view pública e políticas RLS.
3. Crie um bucket público no **Supabase Storage** chamado `avatars` e outro chamado `banners` (para upload de fotos).
4. Em **Authentication -> Providers**, habilite **Email** e **Google OAuth** (opcional).
5. Crie um arquivo `.env.local` na raiz de `web/` com as suas chaves:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-secreta
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Nota sobre o `seed.sql`:** Em produção, `profiles.id` referencia `auth.users(id)`. Para popular dados reais no Supabase, crie os usuários de teste no Auth ou ajuste temporariamente a FK durante a carga inicial.
