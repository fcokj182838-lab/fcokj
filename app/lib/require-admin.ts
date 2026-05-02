import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "./supabase/ssr";
import { getSupabaseAdminClient } from "./supabase/server";

/** 관리자 세션·profiles.role 검증 후 userId 반환, 실패 시 redirect */
export async function requireAdminUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/admin/login?error=config");
  }

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) {
    redirect("/admin/login?error=auth");
  }

  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin) {
    redirect("/admin/login?error=config");
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    redirect("/admin/login?error=forbidden");
  }

  // Storage RLS(community_attachments_*)는 auth.uid() 기준 — 서비스 롤 JWT에는 uid 가 없어 업로드가 막힐 수 있음
  return { userId: user.id, supabaseAdmin, sessionSupabase: supabase };
}
