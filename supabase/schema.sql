-- ============================================================================
-- SCHEMA COMPLETO: PLATAFORMA "COMBINADO!" (SUPABASE POSTGRESQL + RLS)
-- ============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TABELA DE PERFIS (Conta Única - Modelo Airbnb)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  avatar_url TEXT,
  is_provider BOOLEAN NOT NULL DEFAULT false,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  is_banned BOOLEAN NOT NULL DEFAULT false,
  client_rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  client_reviews_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. TABELA DE DETALHES DO PRESTADOR
CREATE TABLE IF NOT EXISTS public.provider_details (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  cpf TEXT UNIQUE NOT NULL,
  bio TEXT NOT NULL,
  experience_time TEXT NOT NULL,
  neighborhoods TEXT NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  avg_completion_days INTEGER NOT NULL DEFAULT 1,
  pro_rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  pro_reviews_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TABELA DE CATEGORIAS
CREATE TABLE IF NOT EXISTS public.categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- 4. RELAÇÃO N:N ENTRE PRESTADORES E CATEGORIAS
CREATE TABLE IF NOT EXISTS public.provider_categories (
  provider_id UUID NOT NULL REFERENCES public.provider_details(profile_id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (provider_id, category_id)
);

-- 5. TABELA DE INTERAÇÕES (Desbloqueio WhatsApp + Trava de Avaliação Mútua 24h)
CREATE TABLE IF NOT EXISTS public.interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  client_rating INTEGER CHECK (client_rating BETWEEN 1 AND 5),
  client_comment TEXT,
  client_reviewed_at TIMESTAMPTZ,
  provider_rating INTEGER CHECK (provider_rating BETWEEN 1 AND 5),
  provider_comment TEXT,
  provider_reviewed_at TIMESTAMPTZ,
  review_due_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 day'),
  deal_status TEXT CHECK (deal_status IN ('completed', 'in_progress', 'not_closed'))
);

-- 6. TABELA DE BANNERS PUBLICITÁRIOS
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  target_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  category_slug TEXT,
  scheduled_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- ÍNDICES DE PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_provider_ranking
  ON public.provider_details (is_available DESC, pro_rating_avg DESC, pro_reviews_count DESC);

CREATE INDEX IF NOT EXISTS idx_interactions_client_pending
  ON public.interactions (client_id, unlocked_at)
  WHERE client_rating IS NULL;

CREATE INDEX IF NOT EXISTS idx_interactions_provider_pending
  ON public.interactions (provider_id, unlocked_at)
  WHERE provider_rating IS NULL;

CREATE INDEX IF NOT EXISTS idx_provider_categories_cat
  ON public.provider_categories (category_id);

-- ============================================================================
-- TRIGGERS DE RECÁLCULO AUTOMÁTICO DE MÉDIAS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.recalculate_interaction_ratings()
RETURNS TRIGGER AS $$
DECLARE
  v_provider_id UUID;
  v_client_id UUID;
BEGIN
  v_provider_id := COALESCE(NEW.provider_id, OLD.provider_id);
  v_client_id := COALESCE(NEW.client_id, OLD.client_id);

  -- Recalcular média do profissional (avaliado pelos clientes)
  UPDATE public.provider_details
  SET
    pro_rating_avg = COALESCE((
      SELECT ROUND(AVG(client_rating)::numeric, 2)
      FROM public.interactions
      WHERE provider_id = v_provider_id AND client_rating IS NOT NULL
    ), 0.00),
    pro_reviews_count = (
      SELECT COUNT(*)
      FROM public.interactions
      WHERE provider_id = v_provider_id AND client_rating IS NOT NULL
    ),
    updated_at = now()
  WHERE profile_id = v_provider_id;

  -- Recalcular média do cliente (avaliado pelos profissionais)
  UPDATE public.profiles
  SET
    client_rating_avg = COALESCE((
      SELECT ROUND(AVG(provider_rating)::numeric, 2)
      FROM public.interactions
      WHERE client_id = v_client_id AND provider_rating IS NOT NULL
    ), 0.00),
    client_reviews_count = (
      SELECT COUNT(*)
      FROM public.interactions
      WHERE client_id = v_client_id AND provider_rating IS NOT NULL
    )
  WHERE id = v_client_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_recalculate_ratings ON public.interactions;
CREATE TRIGGER trg_recalculate_ratings
  AFTER INSERT OR UPDATE OR DELETE ON public.interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.recalculate_interaction_ratings();

-- ============================================================================
-- VIEW PÚBLICA SEGURA (NUNCA EXPÕE WHATSAPP NEM CPF PARA DESLOGADOS)
-- ============================================================================
DROP VIEW IF EXISTS public.public_providers_view;
CREATE VIEW public.public_providers_view AS
SELECT
  p.id,
  p.display_name,
  p.avatar_url,
  p.client_rating_avg,
  p.client_reviews_count,
  pd.bio,
  pd.experience_time,
  pd.neighborhoods,
  pd.is_available,
  pd.is_verified,
  pd.avg_completion_days,
  pd.pro_rating_avg,
  pd.pro_reviews_count
FROM public.profiles p
INNER JOIN public.provider_details pd ON pd.profile_id = p.id
WHERE p.is_provider = true AND p.is_banned = false;

-- Função segura para checar se o usuário logado é admin (evita recursão infinita na RLS de profiles)
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
  SELECT COALESCE((SELECT is_admin FROM public.profiles WHERE id = auth.uid()), false);
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- PROFILES
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin_user());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin_user());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- PROVIDER_DETAILS
DROP POLICY IF EXISTS "Own provider details or admin" ON public.provider_details;
CREATE POLICY "Own provider details or admin"
  ON public.provider_details FOR SELECT
  USING (auth.uid() = profile_id OR public.is_admin_user());

DROP POLICY IF EXISTS "Owner can insert/update provider details" ON public.provider_details;
CREATE POLICY "Owner can insert/update provider details"
  ON public.provider_details FOR ALL
  USING (auth.uid() = profile_id OR public.is_admin_user())
  WITH CHECK (auth.uid() = profile_id OR public.is_admin_user());

-- CATEGORIES & BANNERS
DROP POLICY IF EXISTS "Public read active categories" ON public.categories;
CREATE POLICY "Public read active categories"
  ON public.categories FOR SELECT
  USING (is_active = true OR public.is_admin_user());

DROP POLICY IF EXISTS "Admin manage categories" ON public.categories;
CREATE POLICY "Admin manage categories"
  ON public.categories FOR ALL
  USING (public.is_admin_user());

DROP POLICY IF EXISTS "Public read active banners" ON public.banners;
CREATE POLICY "Public read active banners"
  ON public.banners FOR SELECT
  USING (is_active = true OR public.is_admin_user());

DROP POLICY IF EXISTS "Admin manage banners" ON public.banners;
CREATE POLICY "Admin manage banners"
  ON public.banners FOR ALL
  USING (public.is_admin_user());

-- PROVIDER_CATEGORIES
DROP POLICY IF EXISTS "Public read provider categories" ON public.provider_categories;
CREATE POLICY "Public read provider categories"
  ON public.provider_categories FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Owner manage provider categories" ON public.provider_categories;
CREATE POLICY "Owner manage provider categories"
  ON public.provider_categories FOR ALL
  USING (auth.uid() = provider_id)
  WITH CHECK (auth.uid() = provider_id);

-- INTERACTIONS
DROP POLICY IF EXISTS "Public read completed reviews" ON public.interactions;
CREATE POLICY "Public read completed reviews"
  ON public.interactions FOR SELECT
  USING (client_rating IS NOT NULL OR auth.uid() = client_id OR auth.uid() = provider_id OR public.is_admin_user());

DROP POLICY IF EXISTS "Authenticated client can create interaction" ON public.interactions;
CREATE POLICY "Authenticated client can create interaction"
  ON public.interactions FOR INSERT
  WITH CHECK (auth.uid() = client_id);

DROP POLICY IF EXISTS "Participants can submit their review" ON public.interactions;
CREATE POLICY "Participants can submit their review"
  ON public.interactions FOR UPDATE
  USING (auth.uid() = client_id OR auth.uid() = provider_id);

DROP POLICY IF EXISTS "Admin can delete offensive reviews" ON public.interactions;
CREATE POLICY "Admin can delete offensive reviews"
  ON public.interactions FOR DELETE
  USING (public.is_admin_user());

-- Permissões base de schema/tabelas para roles anon e authenticated (a RLS controla o acesso por linha)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.categories, public.provider_categories, public.banners, public.interactions, public.public_providers_view TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles, public.provider_details, public.provider_categories, public.interactions, public.categories, public.banners TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- RPC segura para usuário autenticado (e não banido) obter o WhatsApp de um profissional
CREATE OR REPLACE FUNCTION public.get_provider_whatsapp(p_provider_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_caller_banned BOOLEAN;
  v_whatsapp TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT is_banned INTO v_caller_banned
  FROM public.profiles
  WHERE id = auth.uid();

  IF COALESCE(v_caller_banned, false) THEN
    RETURN NULL;
  END IF;

  SELECT whatsapp INTO v_whatsapp
  FROM public.profiles
  WHERE id = p_provider_id AND is_provider = true AND is_banned = false;

  RETURN v_whatsapp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.get_provider_whatsapp(UUID) TO authenticated;

-- ============================================================================
-- SEED OBRIGATÓRIO DAS 8 CATEGORIAS
-- ============================================================================
INSERT INTO public.categories (id, name, slug, icon_name, is_active) VALUES
  (1, 'Pedreiros', 'pedreiros', 'Hammer', true),
  (2, 'Eletricistas', 'eletricistas', 'Zap', true),
  (3, 'Encanadores', 'encanadores', 'Droplet', true),
  (4, 'Diaristas / Faxineiras', 'diaristas-faxineiras', 'Sparkles', true),
  (5, 'Técnico de Refrigeração', 'tecnico-refrigeracao', 'Snowflake', true),
  (6, 'Ajudante de Pedreiro', 'ajudante-pedreiro', 'HardHat', true),
  (7, 'Limpeza de Quintal', 'limpeza-quintal', 'Trees', true),
  (8, 'Faz Tudo', 'faz-tudo', 'Wrench', true),
  (9, 'Serralheria', 'serralheria', 'Flame', true),
  (10, 'Telhado', 'telhado', 'Home', true),
  (11, 'Babá', 'baba', 'Baby', true),
  (12, 'Energia Solar / Placas', 'energia-solar', 'Sun', true)
ON CONFLICT (id) DO NOTHING;

-- Ajusta a sequência de IDs após o seed manual
SELECT setval(pg_get_serial_sequence('public.categories', 'id'), COALESCE((SELECT MAX(id) FROM public.categories), 12));

-- ============================================================================
-- STORAGE BUCKET PARA FOTOS DE PERFIL (AVATARS)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read avatars" ON storage.objects;
CREATE POLICY "Public read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated upload avatars" ON storage.objects;
CREATE POLICY "Authenticated upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users update own avatars" ON storage.objects;
CREATE POLICY "Users update own avatars"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================================
-- STORAGE BUCKET PARA BANNERS PUBLICITÁRIOS (ADMIN)
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read banners" ON storage.objects;
CREATE POLICY "Public read banners"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'banners');

DROP POLICY IF EXISTS "Admin upload banners" ON storage.objects;
CREATE POLICY "Admin upload banners"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'banners' AND public.is_admin_user());

DROP POLICY IF EXISTS "Admin update banners" ON storage.objects;
CREATE POLICY "Admin update banners"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'banners' AND public.is_admin_user());
