"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  MOCK_BANNERS,
  MOCK_CATEGORIES,
  MOCK_INTERACTIONS,
  MOCK_PROFILES,
  MOCK_PROVIDER_CATEGORIES,
  MOCK_PROVIDER_DETAILS,
} from "@/lib/mock-data";
import {
  Banner,
  Category,
  Interaction,
  PendingReviewItem,
  Profile,
  ProviderCatalogItem,
  ProviderDetails,
  ProviderFullProfile,
} from "@/types/database";
import { buildWhatsAppUrl, cleanDigits, validateCPF } from "@/utils/validators";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  ensureUserProfileFromAuth,
  fetchAdminCatalogFromSupabase,
  fetchPublicCatalogFromSupabase,
  uploadAvatarToStorage,
  uploadBannerToStorage,
} from "@/lib/supabase/api";

const isMockId = (id: string) =>
  id.startsWith("11111111-") ||
  id.startsWith("22222222-") ||
  id.startsWith("33333333-") ||
  id.startsWith("user-") ||
  id.startsWith("int-");

interface MockState {
  profiles: Profile[];
  providerDetails: ProviderDetails[];
  categories: Category[];
  providerCategories: Array<{ provider_id: string; category_id: number }>;
  interactions: Interaction[];
  banners: Banner[];
  currentUserId: string | null;
}

interface UnlockResult {
  ok: boolean;
  url?: string;
  error?: string;
  requiresAuth?: boolean;
  blockedByOverdue?: boolean;
}

interface AppContextValue {
  isHydrated: boolean;
  currentUser: Profile | null;
  currentProviderDetails: ProviderDetails | null;
  providerDetails: ProviderDetails[];
  currentProviderCategoryIds: number[];
  banners: Banner[];
  activeBanner: Banner | null;
  getCategoryBanner: (categorySlug: string) => Banner | null;
  categories: Category[];
  categoriesWithCounts: Category[];
  profiles: Profile[];
  interactions: Interaction[];
  pendingReviews: PendingReviewItem[];
  overdueReviews: PendingReviewItem[];
  isAuthModalOpen: boolean;
  openAuthModal: (reason?: string) => void;
  closeAuthModal: () => void;
  authModalReason: string | null;
  getCatalogProviders: (filters?: {
    query?: string;
    neighborhood?: string;
    categorySlug?: string;
  }) => ProviderCatalogItem[];
  getProviderById: (id: string) => ProviderFullProfile | null;
  loginAsDemo: (role: "client" | "provider" | "admin") => void;
  registerOrLoginQuick: (data: {
    full_name: string;
    display_name: string;
    whatsapp: string;
    cpf?: string;
    avatar_url?: string | null;
  }) => void;
  signUpWithSupabase: (data: {
    full_name: string;
    display_name: string;
    whatsapp: string;
    cpf?: string;
    email: string;
    password: string;
    avatar_url?: string | null;
  }) => Promise<{ ok: boolean; error?: string; needsEmailConfirm?: boolean }>;
  signInWithSupabase: (data: {
    email: string;
    password: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  unlockProviderWhatsApp: (providerId: string) => Promise<UnlockResult>;
  submitReview: (interactionId: string, rating: number, comment: string) => { ok: boolean; error?: string };
  postponeReview: (interactionId: string, extraDays?: number) => void;
  closeWithoutReview: (interactionId: string) => void;
  toggleAvailability: () => void;
  activateProviderMode: (data: {
    cpf: string;
    bio: string;
    experience_time: string;
    neighborhoods: string;
    avg_completion_days?: number;
    categoryIds: number[];
  }) => { ok: boolean; error?: string };
  updateProfile: (data: {
    full_name: string;
    display_name: string;
    whatsapp: string;
    avatar_url?: string | null;
  }) => void;
  simulateOverdueReview: () => void;
  resetDemoData: () => void;
  // Admin actions
  adminToggleBan: (userId: string) => void;
  adminToggleVerified: (providerId: string) => void;
  adminDeleteReview: (interactionId: string) => void;
  adminToggleBanner: (bannerId: string) => void;
  adminCreateBanner: (data: {
    title: string;
    image_url: string;
    target_url: string;
    category_slug?: string | null;
    scheduled_date?: string | null;
  }) => void;
  adminAddCategory: (data: { name: string; icon_name: string }) => void;
  adminToggleCategory: (categoryId: number) => void;
}

const STORAGE_KEY = "combinado_mock_state_v11";
const HOURS_24_MS = 24 * 60 * 60 * 1000;

const INITIAL_STATE: MockState = {
  profiles: [],
  providerDetails: [],
  categories: MOCK_CATEGORIES,
  providerCategories: [],
  interactions: [],
  banners: [],
  currentUserId: null,
};

const DEMO_INITIAL_STATE: MockState = {
  profiles: MOCK_PROFILES,
  providerDetails: MOCK_PROVIDER_DETAILS,
  categories: MOCK_CATEGORIES,
  providerCategories: MOCK_PROVIDER_CATEGORIES,
  interactions: MOCK_INTERACTIONS,
  banners: MOCK_BANNERS,
  currentUserId: null,
};

const AppContext = createContext<AppContextValue | null>(null);

function recalculateAllRatings(
  profiles: Profile[],
  providerDetails: ProviderDetails[],
  interactions: Interaction[]
): { profiles: Profile[]; providerDetails: ProviderDetails[] } {
  const nextProviderDetails = providerDetails.map((pd) => {
    const reviews = interactions.filter(
      (i) => i.provider_id === pd.profile_id && i.client_rating !== null
    );
    const count = reviews.length;
    const avg =
      count > 0
        ? Number((reviews.reduce((acc, r) => acc + (r.client_rating || 0), 0) / count).toFixed(2))
        : 0;
    return {
      ...pd,
      pro_rating_avg: avg,
      pro_reviews_count: count,
    };
  });

  const nextProfiles = profiles.map((p) => {
    const reviews = interactions.filter(
      (i) => i.client_id === p.id && i.provider_rating !== null
    );
    const count = reviews.length;
    const avg =
      count > 0
        ? Number((reviews.reduce((acc, r) => acc + (r.provider_rating || 0), 0) / count).toFixed(2))
        : 0;
    return {
      ...p,
      client_rating_avg: avg,
      client_reviews_count: count,
    };
  });

  return { profiles: nextProfiles, providerDetails: nextProviderDetails };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const supabaseActive = isSupabaseConfigured();
  const [state, setState] = useState<MockState>(
    supabaseActive ? INITIAL_STATE : DEMO_INITIAL_STATE
  );
  const [isHydrated, setIsHydrated] = useState(false);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalReason, setAuthModalReason] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!supabaseActive) {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as MockState;
            if (parsed && Array.isArray(parsed.profiles)) {
              const existingCategories = Array.isArray(parsed.categories)
                ? parsed.categories
                : [];
              const existingIds = new Set(existingCategories.map((c) => c.id));
              const missingDefaults = MOCK_CATEGORIES.filter(
                (c) => !existingIds.has(c.id)
              );
              const mergedCategories = [
                ...existingCategories.map((c) => {
                  const updated = MOCK_CATEGORIES.find((m) => m.id === c.id);
                  return updated && c.id === 12 ? { ...c, name: updated.name } : c;
                }),
                ...missingDefaults,
              ];
              setState({
                ...parsed,
                categories: mergedCategories,
              });
            }
          }
        } catch {
          // ignore storage errors
        }
      }
      setNowMs(Date.now());
      setIsHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, [supabaseActive]);

  useEffect(() => {
    if (!isHydrated || supabaseActive) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [state, isHydrated, supabaseActive]);

  useEffect(() => {
    if (!isHydrated || !isSupabaseConfigured()) return;
    let cancelled = false;

    async function syncFromSupabase() {
      const catalog = await fetchPublicCatalogFromSupabase();
      const supabase = createClient();
      if (!supabase || cancelled) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      let authedProfile: Profile | null = null;
      let authedDetails: ProviderDetails | null = null;
      let adminCatalog: {
        profiles: Profile[];
        providerDetails: ProviderDetails[];
      } | null = null;

      if (user) {
        authedProfile = await ensureUserProfileFromAuth(user);
        if (authedProfile) {
          const { data: pd } = await supabase
            .from("provider_details")
            .select("*")
            .eq("profile_id", user.id)
            .maybeSingle();
          if (pd) authedDetails = pd as ProviderDetails;
          if (authedProfile.is_admin) {
            adminCatalog = await fetchAdminCatalogFromSupabase();
          }
        }
      }

      if (cancelled) return;

      setState((prev) => {
        const nextProfiles = [...prev.profiles];
        const nextDetails = [...prev.providerDetails];
        const nextCatLinks = [...prev.providerCategories];
        const nextInteractions = [...prev.interactions];

        const mergeProfiles = (incoming: Profile[]) => {
          for (const p of incoming) {
            const idx = nextProfiles.findIndex((x) => x.id === p.id);
            if (idx >= 0) nextProfiles[idx] = { ...nextProfiles[idx], ...p };
            else nextProfiles.unshift(p);
          }
        };

        const mergeDetails = (incoming: ProviderDetails[]) => {
          for (const d of incoming) {
            const idx = nextDetails.findIndex((x) => x.profile_id === d.profile_id);
            if (idx >= 0) nextDetails[idx] = { ...nextDetails[idx], ...d };
            else nextDetails.unshift(d);
          }
        };

        if (catalog) {
          mergeProfiles(catalog.profiles);
          mergeDetails(catalog.providerDetails);
          for (const pc of catalog.providerCategories) {
            if (
              !nextCatLinks.some(
                (x) =>
                  x.provider_id === pc.provider_id && x.category_id === pc.category_id
              )
            ) {
              nextCatLinks.push(pc);
            }
          }
          for (const inter of catalog.interactions) {
            const idx = nextInteractions.findIndex((x) => x.id === inter.id);
            if (idx >= 0) nextInteractions[idx] = inter;
            else nextInteractions.unshift(inter);
          }
        }

        if (adminCatalog) {
          mergeProfiles(adminCatalog.profiles);
          mergeDetails(adminCatalog.providerDetails);
        }

        if (authedProfile) {
          mergeProfiles([authedProfile]);
        }
        if (authedDetails) {
          mergeDetails([authedDetails]);
        }

        const nextUserId = authedProfile
          ? authedProfile.id
          : prev.currentUserId && !isMockId(prev.currentUserId)
            ? null
            : prev.currentUserId;

        return {
          ...prev,
          categories:
            catalog && catalog.categories.length > 0
              ? catalog.categories
              : prev.categories,
          banners:
            catalog && catalog.banners.length > 0 ? catalog.banners : prev.banners,
          profiles: nextProfiles,
          providerDetails: nextDetails,
          providerCategories: nextCatLinks,
          interactions: nextInteractions,
          currentUserId: nextUserId,
        };
      });
    }

    syncFromSupabase();
    return () => {
      cancelled = true;
    };
  }, [isHydrated]);

  const currentUser = useMemo(
    () => state.profiles.find((p) => p.id === state.currentUserId) ?? null,
    [state.profiles, state.currentUserId]
  );

  const currentProviderDetails = useMemo(
    () =>
      currentUser
        ? state.providerDetails.find((pd) => pd.profile_id === currentUser.id) ?? null
        : null,
    [currentUser, state.providerDetails]
  );

  const currentProviderCategoryIds = useMemo(
    () =>
      currentUser
        ? state.providerCategories
            .filter((pc) => pc.provider_id === currentUser.id)
            .map((pc) => pc.category_id)
        : [],
    [currentUser, state.providerCategories]
  );

  const activeBanner = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const homeBanners = state.banners.filter((b) => b.is_active && !b.category_slug);
    return (
      homeBanners.find((b) => b.scheduled_date === todayStr) ??
      homeBanners.find((b) => !b.scheduled_date) ??
      homeBanners[0] ??
      null
    );
  }, [state.banners]);

  const getCategoryBanner = (categorySlug: string): Banner | null => {
    return (
      state.banners.find(
        (b) => b.is_active && b.category_slug === categorySlug
      ) ?? null
    );
  };

  const categoriesWithCounts = useMemo(() => {
    return state.categories
      .filter((c) => c.is_active)
      .map((cat) => {
        const providerIds = state.providerCategories
          .filter((pc) => pc.category_id === cat.id)
          .map((pc) => pc.provider_id);
        const availableCount = state.providerDetails.filter((pd) => {
          const prof = state.profiles.find((p) => p.id === pd.profile_id);
          return (
            providerIds.includes(pd.profile_id) &&
            pd.is_available &&
            prof?.is_provider &&
            !prof?.is_banned
          );
        }).length;
        return { ...cat, available_count: availableCount };
      });
  }, [state.categories, state.providerCategories, state.providerDetails, state.profiles]);

  const pendingReviews = useMemo<PendingReviewItem[]>(() => {
    if (!currentUser) return [];
    const list: PendingReviewItem[] = [];

    for (const inter of state.interactions) {
      if (inter.deal_status === "not_closed") continue;

      const pd = state.providerDetails.find((d) => d.profile_id === inter.provider_id);
      const completionDays = pd?.avg_completion_days ?? 1;
      const dueTime = inter.review_due_at
        ? new Date(inter.review_due_at).getTime()
        : new Date(inter.unlocked_at).getTime() + completionDays * 86400000;
      const isOverdue = nowMs > dueTime;

      if (inter.client_id === currentUser.id && inter.client_rating === null) {
        const target = state.profiles.find((p) => p.id === inter.provider_id);
        if (target) {
          list.push({
            interaction_id: inter.id,
            role_to_review: "provider",
            target_id: target.id,
            target_name: target.display_name,
            target_avatar: target.avatar_url,
            unlocked_at: inter.unlocked_at,
            is_overdue: isOverdue,
          });
        }
      }

      if (inter.provider_id === currentUser.id && inter.provider_rating === null) {
        const target = state.profiles.find((p) => p.id === inter.client_id);
        if (target) {
          list.push({
            interaction_id: inter.id,
            role_to_review: "client",
            target_id: target.id,
            target_name: target.display_name,
            target_avatar: target.avatar_url,
            unlocked_at: inter.unlocked_at,
            is_overdue: isOverdue,
          });
        }
      }
    }

    return list.sort(
      (a, b) => new Date(a.unlocked_at).getTime() - new Date(b.unlocked_at).getTime()
    );
  }, [currentUser, state.interactions, state.profiles, nowMs]);

  const overdueReviews = useMemo(
    () => pendingReviews.filter((r) => r.is_overdue),
    [pendingReviews]
  );

  const openAuthModal = (reason?: string) => {
    setAuthModalReason(reason ?? null);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthModalReason(null);
  };

  const normalizeText = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const getCatalogProviders = (filters?: {
    query?: string;
    neighborhood?: string;
    categorySlug?: string;
  }): ProviderCatalogItem[] => {
    const query = normalizeText(filters?.query?.trim() ?? "");
    const neighborhood = normalizeText(filters?.neighborhood?.trim() ?? "");
    const categorySlug = filters?.categorySlug?.trim().toLowerCase() ?? "";

    const items: ProviderCatalogItem[] = [];

    for (const pd of state.providerDetails) {
      const profile = state.profiles.find((p) => p.id === pd.profile_id);
      if (!profile || !profile.is_provider || profile.is_banned) continue;

      const catIds = state.providerCategories
        .filter((pc) => pc.provider_id === profile.id)
        .map((pc) => pc.category_id);
      const cats = state.categories.filter((c) => catIds.includes(c.id) && c.is_active);

      if (categorySlug && !cats.some((c) => c.slug === categorySlug)) continue;

      if (neighborhood) {
        const normalizedProviderNeighborhoods = normalizeText(pd.neighborhoods);
        const coversWholeCity =
          normalizedProviderNeighborhoods.includes("toda a cidade") ||
          normalizedProviderNeighborhoods.includes("toda boa vista") ||
          normalizedProviderNeighborhoods.includes("todos os bairros") ||
          normalizedProviderNeighborhoods.includes("qualquer bairro");
        if (!coversWholeCity && !normalizedProviderNeighborhoods.includes(neighborhood)) {
          continue;
        }
      }

      if (query) {
        const haystack = normalizeText(
          [
            profile.display_name,
            pd.bio,
            pd.neighborhoods,
            ...cats.map((c) => c.name),
          ].join(" ")
        );
        if (!haystack.includes(query)) continue;
      }

      // Nunca inclui whatsapp nem cpf no catálogo público
      items.push({
        id: profile.id,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        bio: pd.bio,
        experience_time: pd.experience_time,
        neighborhoods: pd.neighborhoods,
        is_available: pd.is_available,
        is_verified: pd.is_verified ?? false,
        pro_rating_avg: pd.pro_rating_avg,
        pro_reviews_count: pd.pro_reviews_count,
        client_rating_avg: profile.client_rating_avg,
        client_reviews_count: profile.client_reviews_count,
        categories: cats,
      });
    }

    // Regra de Ordenação: Disponíveis primeiro -> Maior Nota -> Mais Avaliações
    return items.sort((a, b) => {
      if (a.is_available !== b.is_available) return a.is_available ? -1 : 1;
      if (b.pro_rating_avg !== a.pro_rating_avg) return b.pro_rating_avg - a.pro_rating_avg;
      return b.pro_reviews_count - a.pro_reviews_count;
    });
  };

  const getProviderById = (id: string): ProviderFullProfile | null => {
    const profile = state.profiles.find((p) => p.id === id && p.is_provider && !p.is_banned);
    const pd = state.providerDetails.find((d) => d.profile_id === id);
    if (!profile || !pd) return null;

    const catIds = state.providerCategories
      .filter((pc) => pc.provider_id === profile.id)
      .map((pc) => pc.category_id);
    const cats = state.categories.filter((c) => catIds.includes(c.id) && c.is_active);

    const reviews = state.interactions
      .filter((i) => i.provider_id === id && i.client_rating !== null)
      .map((i) => {
        const client = state.profiles.find((p) => p.id === i.client_id);
        return {
          ...i,
          client_name: client?.display_name ?? "Cliente",
          client_avatar: client?.avatar_url ?? null,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.client_reviewed_at || b.unlocked_at).getTime() -
          new Date(a.client_reviewed_at || a.unlocked_at).getTime()
      );

    return {
      id: profile.id,
      full_name: profile.full_name,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      bio: pd.bio,
      experience_time: pd.experience_time,
      neighborhoods: pd.neighborhoods,
      is_available: pd.is_available,
      is_verified: pd.is_verified ?? false,
      pro_rating_avg: pd.pro_rating_avg,
      pro_reviews_count: pd.pro_reviews_count,
      client_rating_avg: profile.client_rating_avg,
      client_reviews_count: profile.client_reviews_count,
      categories: cats,
      reviews,
    };
  };

  const loginAsDemo = (role: "client" | "provider" | "admin") => {
    const targetId =
      role === "admin"
        ? "22222222-2222-2222-2222-222222222201"
        : role === "provider"
          ? "11111111-1111-1111-1111-111111111101"
          : "22222222-2222-2222-2222-222222222202";
    setState((prev) => ({ ...prev, currentUserId: targetId }));
    closeAuthModal();
  };

  const registerOrLoginQuick = (data: {
    full_name: string;
    display_name: string;
    whatsapp: string;
    cpf?: string;
    avatar_url?: string | null;
  }) => {
    const cleanPhone = cleanDigits(data.whatsapp);
    const existing = state.profiles.find(
      (p) => cleanDigits(p.whatsapp || "") === cleanPhone
    );
    if (existing) {
      setState((prev) => ({ ...prev, currentUserId: existing.id }));
      closeAuthModal();
      return;
    }

    const newId = `user-${Date.now()}`;
    const newProfile: Profile = {
      id: newId,
      full_name: data.full_name.trim(),
      display_name: data.display_name.trim() || data.full_name.trim().split(" ")[0],
      whatsapp: cleanPhone,
      avatar_url: data.avatar_url || null,
      is_provider: false,
      is_admin: false,
      is_banned: false,
      client_rating_avg: 0,
      client_reviews_count: 0,
      created_at: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      profiles: [...prev.profiles, newProfile],
      currentUserId: newId,
    }));
    closeAuthModal();
  };

  const signUpWithSupabase = async (data: {
    full_name: string;
    display_name: string;
    whatsapp: string;
    cpf?: string;
    email: string;
    password: string;
    avatar_url?: string | null;
  }): Promise<{ ok: boolean; error?: string; needsEmailConfirm?: boolean }> => {
    const supabase = createClient();
    if (!supabase) {
      registerOrLoginQuick(data);
      return { ok: true };
    }

    const trimmedFull = data.full_name.trim();
    const trimmedDisplay =
      data.display_name.trim() || trimmedFull.split(" ")[0];
    const cleanPhone = cleanDigits(data.whatsapp);
    const cleanCpf = cleanDigits(data.cpf || "");

    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email: data.email.trim(),
      password: data.password,
      options: {
        data: {
          full_name: trimmedFull,
          display_name: trimmedDisplay,
          whatsapp: cleanPhone,
          ...(cleanCpf ? { cpf: cleanCpf } : {}),
        },
      },
    });

    if (authErr || !authData.user) {
      return {
        ok: false,
        error: authErr?.message || "Não foi possível criar a conta.",
      };
    }

    if (!authData.session) {
      return { ok: true, needsEmailConfirm: true };
    }

    const uploadedAvatar = await uploadAvatarToStorage(
      authData.user.id,
      data.avatar_url
    );

    const newProfile: Profile = {
      id: authData.user.id,
      full_name: data.full_name.trim(),
      display_name: data.display_name.trim() || data.full_name.trim().split(" ")[0],
      whatsapp: cleanDigits(data.whatsapp),
      avatar_url: uploadedAvatar,
      is_provider: false,
      is_admin: false,
      is_banned: false,
      client_rating_avg: 0,
      client_reviews_count: 0,
      created_at: new Date().toISOString(),
    };

    const { error: profErr } = await supabase.from("profiles").upsert({
      id: newProfile.id,
      full_name: newProfile.full_name,
      display_name: newProfile.display_name,
      whatsapp: newProfile.whatsapp,
      avatar_url: newProfile.avatar_url,
    });

    if (profErr) {
      return { ok: false, error: profErr.message };
    }

    setState((prev) => ({
      ...prev,
      profiles: [
        newProfile,
        ...prev.profiles.filter((p) => p.id !== newProfile.id),
      ],
      currentUserId: newProfile.id,
    }));
    closeAuthModal();
    return { ok: true };
  };

  const signInWithSupabase = async (data: {
    email: string;
    password: string;
  }): Promise<{ ok: boolean; error?: string }> => {
    const supabase = createClient();
    if (!supabase) {
      return { ok: false, error: "Supabase não configurado." };
    }

    const { data: authData, error: authErr } =
      await supabase.auth.signInWithPassword({
        email: data.email.trim(),
        password: data.password,
      });

    if (authErr || !authData.user) {
      return {
        ok: false,
        error: "E-mail ou senha inválidos.",
      };
    }

    const profileRow = await ensureUserProfileFromAuth(authData.user);

    if (profileRow) {
      const { data: pd } = await supabase
        .from("provider_details")
        .select("*")
        .eq("profile_id", authData.user.id)
        .maybeSingle();

      const adminCatalog = profileRow.is_admin
        ? await fetchAdminCatalogFromSupabase()
        : null;

      setState((prev) => {
        const nextProfiles = [
          profileRow,
          ...prev.profiles.filter((p) => p.id !== profileRow.id),
        ];
        if (adminCatalog) {
          for (const ap of adminCatalog.profiles) {
            if (!nextProfiles.some((p) => p.id === ap.id)) {
              nextProfiles.push(ap);
            }
          }
        }

        const nextDetails = pd
          ? [
              pd as ProviderDetails,
              ...prev.providerDetails.filter(
                (d) => d.profile_id !== profileRow.id
              ),
            ]
          : [...prev.providerDetails];
        if (adminCatalog) {
          for (const ad of adminCatalog.providerDetails) {
            if (!nextDetails.some((d) => d.profile_id === ad.profile_id)) {
              nextDetails.push(ad);
            }
          }
        }

        return {
          ...prev,
          profiles: nextProfiles,
          providerDetails: nextDetails,
          currentUserId: profileRow.id,
        };
      });
    }

    closeAuthModal();
    return { ok: true };
  };

  const logout = () => {
    const supabase = createClient();
    if (supabase) {
      void supabase.auth.signOut();
    }
    setState((prev) => ({ ...prev, currentUserId: null }));
  };

  const unlockProviderWhatsApp = async (providerId: string): Promise<UnlockResult> => {
    if (!currentUser) {
      return {
        ok: false,
        requiresAuth: true,
        error: "Entre em 10 segundos para liberar o WhatsApp deste profissional.",
      };
    }

    if (currentUser.is_banned) {
      return {
        ok: false,
        error: "Sua conta está suspensa pela moderação.",
      };
    }

    if (overdueReviews.length > 0) {
      return {
        ok: false,
        blockedByOverdue: true,
        error: "Você possui avaliações pendentes há mais de 24 horas.",
      };
    }

    const provider = state.profiles.find((p) => p.id === providerId);
    const pd = state.providerDetails.find((d) => d.profile_id === providerId);
    if (!provider || !pd || !pd.is_available) {
      return { ok: false, error: "Profissional indisponível no momento." };
    }

    let providerWhatsapp = provider.whatsapp || "";
    const supabase = createClient();

    if (!providerWhatsapp && supabase && !isMockId(providerId)) {
      const { data: rpcPhone, error: rpcErr } = await supabase.rpc(
        "get_provider_whatsapp",
        { p_provider_id: providerId }
      );
      if (!rpcErr && typeof rpcPhone === "string" && rpcPhone.trim()) {
        providerWhatsapp = rpcPhone.trim();
        setState((prev) => ({
          ...prev,
          profiles: prev.profiles.map((p) =>
            p.id === providerId ? { ...p, whatsapp: providerWhatsapp } : p
          ),
        }));
      }
    }

    if (!providerWhatsapp) {
      return { ok: false, error: "Profissional indisponível no momento." };
    }

    const now = Date.now();
    const nowIso = new Date(now).toISOString();
    const recentIndex = state.interactions.findIndex(
      (i) =>
        i.client_id === currentUser.id &&
        i.provider_id === providerId &&
        now - new Date(i.unlocked_at).getTime() < HOURS_24_MS
    );

    const completionDays = pd.avg_completion_days ?? 1;
    const dueAt = new Date(now + completionDays * 86400000).toISOString();
    let persistedInteraction: Interaction | null = null;

    if (supabase && !isMockId(currentUser.id) && !isMockId(providerId)) {
      if (recentIndex >= 0) {
        const existingId = state.interactions[recentIndex].id;
        if (!isMockId(existingId)) {
          await supabase
            .from("interactions")
            .update({ unlocked_at: nowIso })
            .eq("id", existingId);
        }
      } else {
        const { data: inserted } = await supabase
          .from("interactions")
          .insert({
            client_id: currentUser.id,
            provider_id: providerId,
            unlocked_at: nowIso,
            review_due_at: dueAt,
          })
          .select("*")
          .single();
        if (inserted) {
          persistedInteraction = inserted as Interaction;
        }
      }
    }

    setState((prev) => {
      const nextInteractions = [...prev.interactions];
      if (recentIndex >= 0) {
        nextInteractions[recentIndex] = {
          ...nextInteractions[recentIndex],
          unlocked_at: nowIso,
        };
      } else {
        nextInteractions.unshift(
          persistedInteraction ?? {
            id: `int-${Date.now()}`,
            client_id: currentUser.id,
            provider_id: providerId,
            unlocked_at: nowIso,
            review_due_at: dueAt,
            client_rating: null,
            client_comment: null,
            client_reviewed_at: null,
            provider_rating: null,
            provider_comment: null,
            provider_reviewed_at: null,
          }
        );
      }
      return { ...prev, interactions: nextInteractions };
    });

    const url = buildWhatsAppUrl(
      providerWhatsapp,
      provider.display_name,
      currentUser.display_name
    );

    return { ok: true, url };
  };

  const submitReview = (interactionId: string, rating: number, comment: string) => {
    if (!currentUser) return { ok: false, error: "Faça login para avaliar." };
    if (rating < 1 || rating > 5) return { ok: false, error: "Escolha de 1 a 5 estrelas." };
    if (comment.trim().length < 5) {
      return { ok: false, error: "Escreva um breve comentário (mín. 5 caracteres)." };
    }

    const targetInter = state.interactions.find((i) => i.id === interactionId);
    const nowIso = new Date().toISOString();
    const trimmedComment = comment.trim();

    const supabase = createClient();
    if (supabase && !isMockId(currentUser.id) && !isMockId(interactionId) && targetInter) {
      const payload =
        targetInter.client_id === currentUser.id
          ? {
              client_rating: rating,
              client_comment: trimmedComment,
              client_reviewed_at: nowIso,
              deal_status: "completed",
            }
          : targetInter.provider_id === currentUser.id
            ? {
                provider_rating: rating,
                provider_comment: trimmedComment,
                provider_reviewed_at: nowIso,
              }
            : null;
      if (payload) {
        void supabase.from("interactions").update(payload).eq("id", interactionId);
      }
    }

    setState((prev) => {
      const nextInteractions = prev.interactions.map((i) => {
        if (i.id !== interactionId) return i;
        if (i.client_id === currentUser.id) {
          return {
            ...i,
            client_rating: rating,
            client_comment: trimmedComment,
            client_reviewed_at: nowIso,
            deal_status: "completed" as const,
          };
        }
        if (i.provider_id === currentUser.id) {
          return {
            ...i,
            provider_rating: rating,
            provider_comment: trimmedComment,
            provider_reviewed_at: nowIso,
          };
        }
        return i;
      });

      const recalc = recalculateAllRatings(
        prev.profiles,
        prev.providerDetails,
        nextInteractions
      );

      return {
        ...prev,
        interactions: nextInteractions,
        profiles: recalc.profiles,
        providerDetails: recalc.providerDetails,
      };
    });

    return { ok: true };
  };

  const postponeReview = (interactionId: string, extraDays = 3) => {
    const nextDue = new Date(Date.now() + extraDays * 86400000).toISOString();
    const supabase = createClient();
    if (supabase && currentUser && !isMockId(currentUser.id) && !isMockId(interactionId)) {
      void supabase
        .from("interactions")
        .update({ deal_status: "in_progress", review_due_at: nextDue })
        .eq("id", interactionId);
    }
    setState((prev) => ({
      ...prev,
      interactions: prev.interactions.map((i) =>
        i.id === interactionId
          ? { ...i, deal_status: "in_progress", review_due_at: nextDue }
          : i
      ),
    }));
  };

  const closeWithoutReview = (interactionId: string) => {
    const supabase = createClient();
    if (supabase && currentUser && !isMockId(currentUser.id) && !isMockId(interactionId)) {
      void supabase
        .from("interactions")
        .update({ deal_status: "not_closed" })
        .eq("id", interactionId);
    }
    setState((prev) => ({
      ...prev,
      interactions: prev.interactions.map((i) =>
        i.id === interactionId ? { ...i, deal_status: "not_closed" } : i
      ),
    }));
  };

  const toggleAvailability = () => {
    if (!currentUser) return;
    const currentPd = state.providerDetails.find((pd) => pd.profile_id === currentUser.id);
    const nextAvailable = currentPd ? !currentPd.is_available : true;
    const nowIso = new Date().toISOString();
    const supabase = createClient();
    if (supabase && !isMockId(currentUser.id)) {
      void supabase
        .from("provider_details")
        .update({ is_available: nextAvailable, updated_at: nowIso })
        .eq("profile_id", currentUser.id);
    }
    setState((prev) => ({
      ...prev,
      providerDetails: prev.providerDetails.map((pd) =>
        pd.profile_id === currentUser.id
          ? { ...pd, is_available: nextAvailable, updated_at: nowIso }
          : pd
      ),
    }));
  };

  const activateProviderMode = (data: {
    cpf: string;
    bio: string;
    experience_time: string;
    neighborhoods: string;
    avg_completion_days?: number;
    categoryIds: number[];
  }) => {
    if (!currentUser) return { ok: false, error: "Usuário não autenticado." };
    const cleanCpf = cleanDigits(data.cpf);
    if (!validateCPF(cleanCpf)) {
      return { ok: false, error: "CPF inválido. Verifique os dígitos informados." };
    }
    if (data.categoryIds.length === 0) {
      return { ok: false, error: "Selecione pelo menos 1 categoria de serviço." };
    }

    const cpfInUse = state.providerDetails.some(
      (pd) => pd.cpf === cleanCpf && pd.profile_id !== currentUser.id
    );
    if (cpfInUse) {
      return { ok: false, error: "Este CPF já está cadastrado em outro perfil." };
    }

    const supabase = createClient();
    const nowIso = new Date().toISOString();
    const existingPd = state.providerDetails.find(
      (pd) => pd.profile_id === currentUser.id
    );
    const completionDays =
      data.avg_completion_days ?? existingPd?.avg_completion_days ?? 1;

    if (supabase && !isMockId(currentUser.id)) {
      const uid = currentUser.id;
      void (async () => {
        await supabase.from("profiles").update({ is_provider: true }).eq("id", uid);
        await supabase.from("provider_details").upsert({
          profile_id: uid,
          cpf: cleanCpf,
          bio: data.bio.trim(),
          experience_time: data.experience_time,
          neighborhoods: data.neighborhoods.trim(),
          avg_completion_days: completionDays,
          is_available: existingPd?.is_available ?? true,
          updated_at: nowIso,
        });
        await supabase.from("provider_categories").delete().eq("provider_id", uid);
        if (data.categoryIds.length > 0) {
          await supabase.from("provider_categories").insert(
            data.categoryIds.map((category_id) => ({
              provider_id: uid,
              category_id,
            }))
          );
        }
      })();
    }

    setState((prev) => {
      const exists = prev.providerDetails.some((pd) => pd.profile_id === currentUser.id);
      const nextDetails = exists
        ? prev.providerDetails.map((pd) =>
            pd.profile_id === currentUser.id
              ? {
                  ...pd,
                  cpf: cleanCpf,
                  bio: data.bio.trim(),
                  experience_time: data.experience_time,
                  neighborhoods: data.neighborhoods.trim(),
                  avg_completion_days: data.avg_completion_days ?? pd.avg_completion_days ?? 1,
                  updated_at: new Date().toISOString(),
                }
              : pd
          )
        : [
            ...prev.providerDetails,
            {
              profile_id: currentUser.id,
              cpf: cleanCpf,
              bio: data.bio.trim(),
              experience_time: data.experience_time,
              neighborhoods: data.neighborhoods.trim(),
              avg_completion_days: data.avg_completion_days ?? 1,
              is_available: true,
              pro_rating_avg: 0,
              pro_reviews_count: 0,
              updated_at: new Date().toISOString(),
            },
          ];

      const filteredCatLinks = prev.providerCategories.filter(
        (pc) => pc.provider_id !== currentUser.id
      );
      const newCatLinks = data.categoryIds.map((catId) => ({
        provider_id: currentUser.id,
        category_id: catId,
      }));

      return {
        ...prev,
        profiles: prev.profiles.map((p) =>
          p.id === currentUser.id ? { ...p, is_provider: true } : p
        ),
        providerDetails: nextDetails,
        providerCategories: [...filteredCatLinks, ...newCatLinks],
      };
    });

    return { ok: true };
  };

  const updateProfile = (data: {
    full_name: string;
    display_name: string;
    whatsapp: string;
    avatar_url?: string | null;
  }) => {
    if (!currentUser) return;
    const cleanPhone = cleanDigits(data.whatsapp);
    const trimmedFull = data.full_name.trim();
    const trimmedDisplay = data.display_name.trim();
    const supabase = createClient();

    if (supabase && !isMockId(currentUser.id)) {
      const uid = currentUser.id;
      void (async () => {
        let finalAvatar = data.avatar_url;
        if (data.avatar_url && data.avatar_url.startsWith("data:image/")) {
          finalAvatar = await uploadAvatarToStorage(uid, data.avatar_url);
        }
        const payload: Record<string, string | null> = {
          full_name: trimmedFull,
          display_name: trimmedDisplay,
          whatsapp: cleanPhone,
        };
        if (finalAvatar !== undefined) {
          payload.avatar_url = finalAvatar;
        }
        await supabase.from("profiles").update(payload).eq("id", uid);
        if (finalAvatar && finalAvatar !== data.avatar_url) {
          setState((prev) => ({
            ...prev,
            profiles: prev.profiles.map((p) =>
              p.id === uid ? { ...p, avatar_url: finalAvatar } : p
            ),
          }));
        }
      })();
    }

    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.id === currentUser.id
          ? {
              ...p,
              full_name: trimmedFull,
              display_name: trimmedDisplay,
              whatsapp: cleanPhone,
              avatar_url: data.avatar_url !== undefined ? data.avatar_url : p.avatar_url,
            }
          : p
      ),
    }));
  };

  const simulateOverdueReview = () => {
    if (!currentUser) return;
    const isClientOnly = !currentUser.is_provider;
    const otherProfile = isClientOnly
      ? state.profiles.find((p) => p.is_provider && p.id !== currentUser.id)
      : state.profiles.find((p) => !p.is_provider && p.id !== currentUser.id);
    if (!otherProfile) return;

    const expiredDate = new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString();
    const newInter: Interaction = {
      id: `sim-overdue-${Date.now()}`,
      client_id: isClientOnly ? currentUser.id : otherProfile.id,
      provider_id: isClientOnly ? otherProfile.id : currentUser.id,
      unlocked_at: expiredDate,
      client_rating: null,
      client_comment: null,
      client_reviewed_at: null,
      provider_rating: null,
      provider_comment: null,
      provider_reviewed_at: null,
    };

    setState((prev) => ({
      ...prev,
      interactions: [newInter, ...prev.interactions],
    }));
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(INITIAL_STATE);
  };

  // Admin actions
  const adminToggleBan = (userId: string) => {
    const target = state.profiles.find((p) => p.id === userId);
    const nextBanned = target ? !target.is_banned : true;
    const supabase = createClient();
    if (supabase && currentUser && !isMockId(currentUser.id) && !isMockId(userId)) {
      void supabase
        .from("profiles")
        .update({ is_banned: nextBanned })
        .eq("id", userId);
    }
    setState((prev) => ({
      ...prev,
      profiles: prev.profiles.map((p) =>
        p.id === userId ? { ...p, is_banned: nextBanned } : p
      ),
    }));
  };

  const adminToggleVerified = (providerId: string) => {
    const target = state.providerDetails.find((pd) => pd.profile_id === providerId);
    const nextVerified = target ? !target.is_verified : true;
    const supabase = createClient();
    if (supabase && currentUser && !isMockId(currentUser.id) && !isMockId(providerId)) {
      void supabase
        .from("provider_details")
        .update({ is_verified: nextVerified })
        .eq("profile_id", providerId);
    }
    setState((prev) => ({
      ...prev,
      providerDetails: prev.providerDetails.map((pd) =>
        pd.profile_id === providerId
          ? { ...pd, is_verified: nextVerified }
          : pd
      ),
    }));
  };

  const adminDeleteReview = (interactionId: string) => {
    const supabase = createClient();
    if (supabase && currentUser && !isMockId(currentUser.id) && !isMockId(interactionId)) {
      void supabase.from("interactions").delete().eq("id", interactionId);
    }
    setState((prev) => {
      const nextInteractions = prev.interactions.filter((i) => i.id !== interactionId);
      const recalc = recalculateAllRatings(
        prev.profiles,
        prev.providerDetails,
        nextInteractions
      );
      return {
        ...prev,
        interactions: nextInteractions,
        profiles: recalc.profiles,
        providerDetails: recalc.providerDetails,
      };
    });
  };

  const adminToggleBanner = (bannerId: string) => {
    const target = state.banners.find((b) => b.id === bannerId);
    const nextActive = target ? !target.is_active : true;
    const supabase = createClient();
    if (supabase && currentUser && !isMockId(currentUser.id) && !isMockId(bannerId)) {
      void supabase
        .from("banners")
        .update({ is_active: nextActive })
        .eq("id", bannerId);
    }
    setState((prev) => ({
      ...prev,
      banners: prev.banners.map((b) =>
        b.id === bannerId ? { ...b, is_active: nextActive } : b
      ),
    }));
  };

  const adminCreateBanner = (data: {
    title: string;
    image_url: string;
    target_url: string;
    category_slug?: string | null;
    scheduled_date?: string | null;
  }) => {
    const newId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `banner-${Date.now()}`;
    const newBanner: Banner = {
      id: newId,
      title: data.title.trim(),
      image_url: data.image_url.trim(),
      target_url: data.target_url.trim(),
      is_active: true,
      category_slug: data.category_slug || null,
      scheduled_date: data.scheduled_date || null,
      created_at: new Date().toISOString(),
    };

    const supabase = createClient();
    if (supabase && currentUser && !isMockId(currentUser.id)) {
      void (async () => {
        const finalImageUrl = await uploadBannerToStorage(
          newBanner.id,
          newBanner.image_url
        );
        await supabase
          .from("banners")
          .update({ is_active: false })
          .neq("id", newBanner.id);
        await supabase.from("banners").insert({
          id: newBanner.id,
          title: newBanner.title,
          image_url: finalImageUrl,
          target_url: newBanner.target_url,
          is_active: true,
          category_slug: newBanner.category_slug,
          scheduled_date: newBanner.scheduled_date,
        });
        if (finalImageUrl !== newBanner.image_url) {
          setState((prev) => ({
            ...prev,
            banners: prev.banners.map((b) =>
              b.id === newBanner.id ? { ...b, image_url: finalImageUrl } : b
            ),
          }));
        }
      })();
    }

    setState((prev) => ({
      ...prev,
      banners: [newBanner, ...prev.banners.map((b) => ({ ...b, is_active: false }))],
    }));
  };

  const adminAddCategory = (data: { name: string; icon_name: string }) => {
    const slug = data.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    const nextId = Math.max(0, ...state.categories.map((c) => c.id)) + 1;
    const newCat: Category = {
      id: nextId,
      name: data.name.trim(),
      slug,
      icon_name: data.icon_name || "Wrench",
      is_active: true,
    };

    const supabase = createClient();
    if (supabase && currentUser && !isMockId(currentUser.id)) {
      void supabase.from("categories").insert({
        name: newCat.name,
        slug: newCat.slug,
        icon_name: newCat.icon_name,
        is_active: true,
      });
    }

    setState((prev) => ({
      ...prev,
      categories: [...prev.categories, newCat],
    }));
  };

  const adminToggleCategory = (categoryId: number) => {
    const target = state.categories.find((c) => c.id === categoryId);
    const nextActive = target ? !target.is_active : true;
    const supabase = createClient();
    if (supabase && currentUser && !isMockId(currentUser.id)) {
      void supabase
        .from("categories")
        .update({ is_active: nextActive })
        .eq("id", categoryId);
    }
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((c) =>
        c.id === categoryId ? { ...c, is_active: nextActive } : c
      ),
    }));
  };

  const value: AppContextValue = {
    isHydrated,
    currentUser,
    currentProviderDetails,
    providerDetails: state.providerDetails,
    currentProviderCategoryIds,
    banners: state.banners,
    activeBanner,
    getCategoryBanner,
    categories: state.categories,
    categoriesWithCounts,
    profiles: state.profiles,
    interactions: state.interactions,
    pendingReviews,
    overdueReviews,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    authModalReason,
    getCatalogProviders,
    getProviderById,
    loginAsDemo,
    registerOrLoginQuick,
    signUpWithSupabase,
    signInWithSupabase,
    logout,
    unlockProviderWhatsApp,
    submitReview,
    postponeReview,
    closeWithoutReview,
    toggleAvailability,
    activateProviderMode,
    updateProfile,
    simulateOverdueReview,
    resetDemoData,
    adminToggleBan,
    adminToggleVerified,
    adminDeleteReview,
    adminToggleBanner,
    adminCreateBanner,
    adminAddCategory,
    adminToggleCategory,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
