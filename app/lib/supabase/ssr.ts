import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Next.js Server Components / Server Actions 용 Supabase 클라이언트
// - 쿠키 기반 세션을 사용합니다.
export async function createSupabaseServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components에서는 set이 제한될 수 있음 (Server Action/Route Handler에서 정상 동작)
        }
      },
    },
  });
}

