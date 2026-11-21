import { createClient } from "./client";
import {
  Banner,
  Category,
  Interaction,
  Profile,
  ProviderDetails,
} from "@/types/database";

/**
 * Converte dataURL (JPEG base64) em Blob para envio ao Supabase Storage.
 */
function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(",");
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export async function uploadAvatarToStorage(
  userId: string,
  avatarDataOrUrl: string | null | undefined
): Promise<string | null> {
  if (!avatarDataOrUrl) return null;
  if (!avatarDataOrUrl.startsWith("data:image/")) {
    return avatarDataOrUrl;
  }
  const supabase = createClient();
  if (!supabase) return null;

  const blob = dataUrlToBlob(avatarDataOrUrl);
  const path = `${userId}/avatar-${Date.now()}.jpg`;
  const { error } = await supabase.storage.from("avatars").upload(path, blob, {
    contentType: "image/jpeg",
    upsert: true,
  });

  if (error) {
    console.error("Erro ao enviar avatar para Storage:", error.message);
    return null;
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadBannerToStorage(
  bannerId: string,
  imageDataOrUrl: string
): Promise<string> {
  if (!imageDataOrUrl.startsWith("data:image/")) {
    return imageDataOrUrl;
  }
  const supabase = createClient();
  if (!supabase) return imageDataOrUrl;

  const blob = dataUrlToBlob(imageDataOrUrl);
  const path = `${bannerId}/banner-${Date.now()}.jpg`;
  const { error } = await supabase.storage.from("banners").upload(path, blob, {
    contentType: "image/jpeg",
    upsert: true,
  });

  if (error) {
    console.error("Erro ao enviar banner para Storage:", error.message);
    return imageDataOrUrl;
  }

  const { data } = supabase.storage.from("banners").getPublicUrl(path);
  return data.publicUrl;
}

export async function ensureUserProfileFromAuth(user: {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}): Promise<Profile | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return existing as Profile;

  const meta = user.user_metadata ?? {};
  const fallbackName = user.email ? user.email.split("@")[0] : "Usuário";
  const fullName =
    typeof meta.full_name === "string" && meta.full_name.trim()
      ? meta.full_name.trim()
      : fallbackName;
  const displayName =
    typeof meta.display_name === "string" && meta.display_name.trim()
      ? meta.display_name.trim()
      : fullName.split(" ")[0];
  const whatsapp =
    typeof meta.whatsapp === "string" ? meta.whatsapp.replace(/\D/g, "") : "";

  const newProfile: Profile = {
    id: user.id,
    full_name: fullName,
    display_name: displayName,
    whatsapp,
    avatar_url: null,
    is_provider: false,
    is_admin: false,
    is_banned: false,
    client_rating_avg: 0,
    client_reviews_count: 0,
    created_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("profiles").upsert({
    id: newProfile.id,
    full_name: newProfile.full_name,
    display_name: newProfile.display_name,
    whatsapp: newProfile.whatsapp,
    avatar_url: newProfile.avatar_url,
  });

  if (error) {
    console.error("Erro ao criar perfil inicial:", error.message);
    return null;
  }

  return newProfile;
}

export async function fetchAdminCatalogFromSupabase(): Promise<{
  profiles: Profile[];
  providerDetails: ProviderDetails[];
} | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const [profRes, pdRes] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("provider_details").select("*"),
  ]);

  if (profRes.error) {
    console.error("Erro ao buscar perfis (admin):", profRes.error.message);
    return null;
  }

  return {
    profiles: (profRes.data ?? []) as Profile[],
    providerDetails: (pdRes.data ?? []) as ProviderDetails[],
  };
}

export async function fetchPublicCatalogFromSupabase(): Promise<{
  categories: Category[];
  banners: Banner[];
  profiles: Profile[];
  providerDetails: ProviderDetails[];
  providerCategories: Array<{ provider_id: string; category_id: number }>;
  interactions: Interaction[];
} | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const [catRes, banRes, provRes, pcRes, intRes] = await Promise.all([
    supabase.from("categories").select("*").order("id", { ascending: true }),
    supabase.from("banners").select("*").order("created_at", { ascending: false }),
    supabase.from("public_providers_view").select("*"),
    supabase.from("provider_categories").select("provider_id, category_id"),
    supabase
      .from("interactions")
      .select("*")
      .order("unlocked_at", { ascending: false }),
  ]);

  if (catRes.error) {
    console.error("Erro ao buscar categorias:", catRes.error.message);
    return null;
  }

  const profiles: Profile[] = [];
  const providerDetails: ProviderDetails[] = [];

  for (const row of provRes.data ?? []) {
    profiles.push({
      id: row.id,
      full_name: row.display_name,
      display_name: row.display_name,
      avatar_url: row.avatar_url,
      is_provider: true,
      is_admin: false,
      is_banned: false,
      client_rating_avg: Number(row.client_rating_avg ?? 0),
      client_reviews_count: Number(row.client_reviews_count ?? 0),
      created_at: new Date().toISOString(),
    });
    providerDetails.push({
      profile_id: row.id,
      bio: row.bio,
      experience_time: row.experience_time,
      neighborhoods: row.neighborhoods,
      is_available: Boolean(row.is_available),
      is_verified: Boolean(row.is_verified),
      avg_completion_days: Number(row.avg_completion_days ?? 1),
      pro_rating_avg: Number(row.pro_rating_avg ?? 0),
      pro_reviews_count: Number(row.pro_reviews_count ?? 0),
      updated_at: new Date().toISOString(),
    });
  }

  return {
    categories: (catRes.data ?? []) as Category[],
    banners: (banRes.data ?? []) as Banner[],
    profiles,
    providerDetails,
    providerCategories: (pcRes.data ?? []) as Array<{
      provider_id: string;
      category_id: number;
    }>,
    interactions: (intRes.data ?? []) as Interaction[],
  };
}
