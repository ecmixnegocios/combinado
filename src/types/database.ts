export interface Profile {
  id: string;
  full_name: string;
  display_name: string;
  whatsapp?: string; // Nunca exposto na listagem pública para deslogados
  avatar_url: string | null;
  is_provider: boolean;
  is_admin: boolean;
  is_banned: boolean;
  client_rating_avg: number;
  client_reviews_count: number;
  created_at: string;
}

export interface ProviderDetails {
  profile_id: string;
  cpf?: string; // Nunca exposto na listagem pública
  bio: string;
  experience_time: string;
  neighborhoods: string;
  is_available: boolean;
  is_verified?: boolean;
  avg_completion_days?: number;
  pro_rating_avg: number;
  pro_reviews_count: number;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon_name: string;
  is_active: boolean;
  available_count?: number;
}

export interface Banner {
  id: string;
  title: string;
  image_url: string;
  target_url: string;
  is_active: boolean;
  category_slug?: string | null;
  scheduled_date?: string | null;
  created_at: string;
}

export interface Interaction {
  id: string;
  client_id: string;
  provider_id: string;
  unlocked_at: string;
  client_rating: number | null;
  client_comment: string | null;
  client_reviewed_at: string | null;
  provider_rating: number | null;
  provider_comment: string | null;
  provider_reviewed_at: string | null;
  review_due_at?: string;
  deal_status?: "completed" | "in_progress" | "not_closed";
  // Joins para exibição
  client_name?: string;
  client_avatar?: string | null;
  provider_name?: string;
  provider_avatar?: string | null;
}

export interface ProviderCatalogItem {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
  experience_time: string;
  neighborhoods: string;
  is_available: boolean;
  is_verified?: boolean;
  avg_completion_days?: number;
  pro_rating_avg: number;
  pro_reviews_count: number;
  client_rating_avg: number;
  client_reviews_count: number;
  categories: Category[];
}

export interface ProviderFullProfile extends ProviderCatalogItem {
  full_name: string;
  reviews: Interaction[];
}

export interface PendingReviewItem {
  interaction_id: string;
  role_to_review: "provider" | "client";
  target_id: string;
  target_name: string;
  target_avatar: string | null;
  unlocked_at: string;
  is_overdue: boolean; // true se > 24h
}
