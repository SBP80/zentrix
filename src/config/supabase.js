import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = "https://fxxfgbxnqhtlrwiyyafu.supabase.co";
const SUPABASE_KEY = "sb_publishable_1RbCV4I_yhpFwZ14wK7e2Q_a6FSyoxC";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);