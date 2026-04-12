export const SUPABASE_URL = "https://fxxfgbxnqhtlrwiyyafu.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_1RbCV4I_yhpFwZl4wK7e2Q_a6FSyoxC";

export function getSupabaseHeaders(extra = {}) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: "Bearer " + SUPABASE_ANON_KEY,
    ...extra
  };
}

export function getSupabaseRestUrl(path = "") {
  const cleanPath = String(path || "").replace(/^\/+/, "");
  return `${SUPABASE_URL}/rest/v1/${cleanPath}`;
}