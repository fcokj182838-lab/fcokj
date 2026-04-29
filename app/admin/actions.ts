"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../lib/supabase/ssr";
import { requireAdminUser } from "../lib/require-admin";

export async function logoutAdmin() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/admin/login?error=config");
  }

  await supabase.auth.signOut();
  redirect("/admin/login?logout=1");
}

/** 폼에서 넘어온 게시글 id 정수 검증 */
function parsePostIdFromForm(formData: FormData): number | null {
  const raw = formData.get("id");
  if (typeof raw !== "string") return null;
  const postId = Number.parseInt(raw, 10);
  if (!Number.isFinite(postId) || postId < 1) return null;
  return postId;
}

/** 체크박스: 체크 시에만 값이 전달됨 */
function parsePublishedFromForm(formData: FormData): boolean {
  const raw = formData.get("is_published");
  return raw === "on" || raw === "true";
}

export async function createCommunityPostFromAdmin(formData: FormData) {
  const { userId, supabaseAdmin } = await requireAdminUser();

  const rawTitle = formData.get("title");
  const rawContent = formData.get("content");
  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  const content = typeof rawContent === "string" ? rawContent.trim() : "";

  if (!title || !content) {
    redirect("/admin/community/new?error=invalid");
  }

  const isPublished = parsePublishedFromForm(formData);

  const { error } = await supabaseAdmin.from("community_posts").insert({
    title,
    content,
    is_published: isPublished,
    author_id: userId,
  });

  if (error) {
    redirect("/admin/community/new?error=insert");
  }

  revalidatePath("/community");
  revalidatePath("/admin");
  revalidatePath("/admin/community");
  redirect("/admin/community?created=1");
}

export async function updateCommunityPostFromAdmin(formData: FormData) {
  const { supabaseAdmin } = await requireAdminUser();
  const postId = parsePostIdFromForm(formData);
  if (!postId) {
    redirect("/admin/community?error=invalid");
  }

  const rawTitle = formData.get("title");
  const rawContent = formData.get("content");
  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  const content = typeof rawContent === "string" ? rawContent.trim() : "";

  if (!title || !content) {
    redirect(`/admin/community/${postId}/edit?error=invalid`);
  }

  const isPublished = parsePublishedFromForm(formData);

  const { error } = await supabaseAdmin
    .from("community_posts")
    .update({ title, content, is_published: isPublished })
    .eq("id", postId);

  if (error) {
    redirect(`/admin/community/${postId}/edit?error=update`);
  }

  revalidatePath("/community");
  revalidatePath("/admin");
  revalidatePath("/admin/community");
  revalidatePath(`/admin/community/${postId}/edit`);
  redirect("/admin/community?updated=1");
}

export async function deleteCommunityPostFromAdmin(formData: FormData) {
  const { supabaseAdmin } = await requireAdminUser();
  const postId = parsePostIdFromForm(formData);
  if (!postId) {
    redirect("/admin/community?error=invalid");
  }

  const { error } = await supabaseAdmin.from("community_posts").delete().eq("id", postId);

  if (error) {
    redirect("/admin/community?error=delete");
  }

  revalidatePath("/community");
  revalidatePath("/admin");
  revalidatePath("/admin/community");
  redirect("/admin/community?deleted=1");
}
