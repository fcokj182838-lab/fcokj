"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../lib/supabase/ssr";
import { requireAdminUser } from "../lib/require-admin";

// 첨부파일 관련 상수
const ATTACHMENT_BUCKET = "community-attachments";
const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024; // 파일당 20MB
const MAX_ATTACHMENT_COUNT = 10; // 게시글당 최대 10개
// 보안상 실행 가능한 확장자는 차단 (그 외에는 허용)
const BLOCKED_EXTENSIONS = new Set([
  "exe", "bat", "cmd", "com", "msi", "scr", "vbs", "vbe", "js", "jse",
  "wsf", "wsh", "ps1", "ps1xml", "psc1", "psc2", "msh", "msh1", "msh2",
  "mshxml", "msh1xml", "msh2xml", "scf", "lnk", "inf", "reg", "jar",
  "app", "dmg", "iso", "img", "pkg", "deb", "rpm",
]);

// DB attachments jsonb 배열에 들어가는 메타 형식
type AttachmentMeta = {
  name: string;
  url: string;
  path: string;
  size: number;
  type?: string;
};

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

/** 파일명을 Storage 경로에 안전한 형태로 변환 (슬래시·제어문자 제거, 길이 제한) */
function buildSafeFileName(originalName: string): string {
  const fallback = "file";
  const trimmed = (originalName ?? "").trim();
  if (trimmed.length === 0) return fallback;

  const dotIndex = trimmed.lastIndexOf(".");
  const baseRaw = dotIndex === -1 ? trimmed : trimmed.slice(0, dotIndex);
  const extRaw = dotIndex === -1 ? "" : trimmed.slice(dotIndex + 1);

  // 한글·영문·숫자·하이픈·언더스코어·점만 허용, 그 외 문자는 _
  const sanitize = (value: string) =>
    value
      .replace(/[^\p{L}\p{N}_.\-]/gu, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");

  const base = sanitize(baseRaw).slice(0, 80) || fallback;
  const ext = sanitize(extRaw).toLowerCase().slice(0, 10);
  return ext ? `${base}.${ext}` : base;
}

/** 차단 확장자 검사 (true 면 차단) */
function hasBlockedExtension(fileName: string): boolean {
  const dotIndex = fileName.lastIndexOf(".");
  if (dotIndex === -1) return false;
  const ext = fileName.slice(dotIndex + 1).toLowerCase();
  return BLOCKED_EXTENSIONS.has(ext);
}

/** FormData 에서 다중 파일을 추출하여 유효 File 만 반환 */
function extractAttachmentFiles(formData: FormData, fieldName: string): File[] {
  const entries = formData.getAll(fieldName);
  const files: File[] = [];
  for (const entry of entries) {
    if (entry instanceof File && entry.size > 0) {
      files.push(entry);
    }
  }
  return files;
}

/**
 * 첨부파일 다중 업로드.
 * 한 파일이라도 실패하면 이미 올린 파일들을 모두 삭제하고 null 반환.
 */
async function uploadAttachments(
  supabaseAdmin: Awaited<ReturnType<typeof requireAdminUser>>["supabaseAdmin"],
  files: File[],
  postFolderHint: string,
): Promise<{ metas: AttachmentMeta[]; uploadedPaths: string[] } | null> {
  const uploadedPaths: string[] = [];
  const metas: AttachmentMeta[] = [];

  for (const file of files) {
    if (file.size > MAX_ATTACHMENT_BYTES) {
      await rollbackUploadedAttachments(supabaseAdmin, uploadedPaths);
      return null;
    }
    if (hasBlockedExtension(file.name ?? "")) {
      await rollbackUploadedAttachments(supabaseAdmin, uploadedPaths);
      return null;
    }

    const safeName = buildSafeFileName(file.name ?? "file");
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const objectPath = `${postFolderHint}/${uniqueSuffix}-${safeName}`;

    const arrayBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(ATTACHMENT_BUCKET)
      .upload(objectPath, fileBytes, {
        contentType: file.type || "application/octet-stream",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      await rollbackUploadedAttachments(supabaseAdmin, uploadedPaths);
      return null;
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from(ATTACHMENT_BUCKET)
      .getPublicUrl(objectPath);

    if (!publicUrlData?.publicUrl) {
      await rollbackUploadedAttachments(supabaseAdmin, [...uploadedPaths, objectPath]);
      return null;
    }

    uploadedPaths.push(objectPath);
    metas.push({
      name: file.name ?? safeName,
      url: publicUrlData.publicUrl,
      path: objectPath,
      size: file.size,
      type: file.type || undefined,
    });
  }

  return { metas, uploadedPaths };
}

/** 업로드 실패 시 이미 올라간 파일들 일괄 삭제 (실패해도 무시) */
async function rollbackUploadedAttachments(
  supabaseAdmin: Awaited<ReturnType<typeof requireAdminUser>>["supabaseAdmin"],
  paths: string[],
) {
  if (paths.length === 0) return;
  try {
    await supabaseAdmin.storage.from(ATTACHMENT_BUCKET).remove(paths);
  } catch {
    // 정리 실패는 사용자에게 영향이 없으므로 swallow
  }
}

/** DB 의 attachments jsonb 에서 path 만 추출 (삭제용) */
function extractAttachmentPaths(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const paths: string[] = [];
  for (const item of value) {
    if (
      item &&
      typeof item === "object" &&
      "path" in item &&
      typeof (item as { path: unknown }).path === "string"
    ) {
      paths.push((item as { path: string }).path);
    }
  }
  return paths;
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
  const files = extractAttachmentFiles(formData, "attachments");

  if (files.length > MAX_ATTACHMENT_COUNT) {
    redirect("/admin/community/new?error=too_many");
  }

  // 게시글당 폴더로 묶기 (yyyymm 단위)
  const now = new Date();
  const folderHint = `posts/${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;

  let attachmentResult: { metas: AttachmentMeta[]; uploadedPaths: string[] } | null = null;
  if (files.length > 0) {
    attachmentResult = await uploadAttachments(supabaseAdmin, files, folderHint);
    if (!attachmentResult) {
      redirect("/admin/community/new?error=upload");
    }
  }

  const { error } = await supabaseAdmin.from("community_posts").insert({
    title,
    content,
    is_published: isPublished,
    author_id: userId,
    attachments: attachmentResult?.metas ?? [],
  });

  if (error) {
    // DB insert 실패 시 업로드된 파일 모두 정리
    if (attachmentResult) {
      await rollbackUploadedAttachments(supabaseAdmin, attachmentResult.uploadedPaths);
    }
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

  // 삭제 전 attachments 경로를 먼저 조회해 두기
  const { data: existing } = await supabaseAdmin
    .from("community_posts")
    .select("attachments")
    .eq("id", postId)
    .maybeSingle();

  const attachmentPaths = extractAttachmentPaths(existing?.attachments ?? null);

  const { error } = await supabaseAdmin.from("community_posts").delete().eq("id", postId);

  if (error) {
    redirect("/admin/community?error=delete");
  }

  // DB 삭제 성공 후 Storage 정리 (실패해도 사용자 흐름 영향 없음)
  await rollbackUploadedAttachments(supabaseAdmin, attachmentPaths);

  revalidatePath("/community");
  revalidatePath("/admin");
  revalidatePath("/admin/community");
  redirect("/admin/community?deleted=1");
}
