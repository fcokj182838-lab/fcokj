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

  return { userId: user.id, supabaseAdmin };
}
