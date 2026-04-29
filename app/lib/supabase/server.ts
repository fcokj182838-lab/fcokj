import { createClient } from "@supabase/supabase-js";

// 서버 전용 Supabase 관리자 클라이언트 생성
// - service_role 키는 절대 클라이언트로 노출되면 안 됩니다.
export function getSupabaseAdminClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
