"use server";

import { randomUUID } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  partitionCommunityAttachmentsForUpdate,
  type CommunityAttachmentRecord,
} from "../lib/community-attachments";
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

/**
 * Storage 객체 키에 붙일 확장자만 ASCII 로 정규화한다.
 * Supabase Storage 는 경로에 한글·일부 유니코드가 있으면 "Invalid key" 로 거부하는 경우가 있어,
 * 실제 사용자에게 보이는 파일명은 AttachmentMeta.name 에 원본(file.name)을 그대로 둔다.
 */
function getAsciiSafeExtensionSuffixForStorage(originalName: string): string {
  const trimmed = (originalName ?? "").trim();
  const dotIndex = trimmed.lastIndexOf(".");
  if (dotIndex < 1 || dotIndex === trimmed.length - 1) return "";

  const extRaw = trimmed.slice(dotIndex + 1).toLowerCase();
  // 스토리지 키 — 영문 소문자·숫자만 (예: png, jpeg, pdf, 7z)
  const extClean = extRaw.replace(/[^a-z0-9]/g, "").slice(0, 10);
  return extClean.length > 0 ? `.${extClean}` : "";
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
  /** Storage 정책이 auth.uid() 를 쓰므로 로그인 세션 클라이언트(anon + 사용자 JWT)로 업로드 */
  storageClient: SupabaseClient,
  files: File[],
  postFolderHint: string,
): Promise<{ metas: CommunityAttachmentRecord[]; uploadedPaths: string[] } | null> {
  const uploadedPaths: string[] = [];
  const metas: CommunityAttachmentRecord[] = [];

  for (const file of files) {
    if (file.size > MAX_ATTACHMENT_BYTES) {
      await rollbackUploadedAttachments(storageClient, uploadedPaths);
      return null;
    }
    if (hasBlockedExtension(file.name ?? "")) {
      await rollbackUploadedAttachments(storageClient, uploadedPaths);
      return null;
    }

    // 객체 경로는 ASCII 만 — 원본 이름은 metas.name 에 보존
    const extensionSuffix = getAsciiSafeExtensionSuffixForStorage(file.name ?? "");
    const objectPath = `${postFolderHint}/${Date.now()}-${randomUUID()}${extensionSuffix}`;

    const arrayBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await storageClient.storage
      .from(ATTACHMENT_BUCKET)
      .upload(objectPath, fileBytes, {
        contentType: file.type || "application/octet-stream",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      // 운영에서 원인 파악용(메시지에 민감정보 없음)
      console.error("[community-attachments] upload failed:", uploadError.message);
      await rollbackUploadedAttachments(storageClient, uploadedPaths);
      return null;
    }

    const { data: publicUrlData } = storageClient.storage
      .from(ATTACHMENT_BUCKET)
      .getPublicUrl(objectPath);

    if (!publicUrlData?.publicUrl) {
      await rollbackUploadedAttachments(storageClient, [...uploadedPaths, objectPath]);
      return null;
    }

    uploadedPaths.push(objectPath);
    metas.push({
      // 다운로드·목록에 보이는 이름 — 스토리지 키와 별개로 원본 유지
      name: (file.name ?? "").trim() || "첨부파일",
      url: publicUrlData.publicUrl,
      path: objectPath,
      size: file.size,
      type: file.type || undefined,
    });
  }

  return { metas, uploadedPaths };
}

/** 업로드 실패 시 이미 올라간 파일들 일괄 삭제 (실패해도 무시) */
async function rollbackUploadedAttachments(storageClient: SupabaseClient, paths: string[]) {
  if (paths.length === 0) return;
  try {
    await storageClient.storage.from(ATTACHMENT_BUCKET).remove(paths);
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
  const { userId, supabaseAdmin, sessionSupabase } = await requireAdminUser();

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

  let attachmentResult: { metas: CommunityAttachmentRecord[]; uploadedPaths: string[] } | null =
    null;
  if (files.length > 0) {
    attachmentResult = await uploadAttachments(sessionSupabase, files, folderHint);
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
      await rollbackUploadedAttachments(sessionSupabase, attachmentResult.uploadedPaths);
    }
    redirect("/admin/community/new?error=insert");
  }

  revalidatePath("/community");
  revalidatePath("/admin");
  revalidatePath("/admin/community");
  redirect("/admin/community?created=1");
}

export async function updateCommunityPostFromAdmin(formData: FormData) {
  const { supabaseAdmin, sessionSupabase } = await requireAdminUser();
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

  const { data: existingRow, error: fetchError } = await supabaseAdmin
    .from("community_posts")
    .select("attachments")
    .eq("id", postId)
    .maybeSingle();

  if (fetchError || !existingRow) {
    redirect(`/admin/community/${postId}/edit?error=update`);
  }

  const { withPath: previousWithPath, legacyItems } = partitionCommunityAttachmentsForUpdate(
    existingRow.attachments,
  );

  const previousPathSet = new Set(previousWithPath.map((item) => item.path));

  const keepPathEntries = formData
    .getAll("keep_attachment_paths")
    .filter((value): value is string => typeof value === "string");

  const seenPaths = new Set<string>();
  const keepPathsOrdered: string[] = [];
  for (const path of keepPathEntries) {
    if (!previousPathSet.has(path)) {
      redirect(`/admin/community/${postId}/edit?error=invalid_keep`);
    }
    if (seenPaths.has(path)) continue;
    seenPaths.add(path);
    keepPathsOrdered.push(path);
  }

  const keptMetas: CommunityAttachmentRecord[] = keepPathsOrdered
    .map((path) => previousWithPath.find((item) => item.path === path))
    .filter((item): item is CommunityAttachmentRecord => item != null);

  const newFiles = extractAttachmentFiles(formData, "attachments");

  if (keptMetas.length + newFiles.length + legacyItems.length > MAX_ATTACHMENT_COUNT) {
    redirect(`/admin/community/${postId}/edit?error=too_many`);
  }

  const now = new Date();
  const folderHint = `posts/${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;

  let newUploadResult: { metas: CommunityAttachmentRecord[]; uploadedPaths: string[] } | null =
    null;
  if (newFiles.length > 0) {
    newUploadResult = await uploadAttachments(sessionSupabase, newFiles, folderHint);
    if (!newUploadResult) {
      redirect(`/admin/community/${postId}/edit?error=upload`);
    }
  }

  const finalAttachments: unknown[] = [
    ...keptMetas,
    ...(newUploadResult?.metas ?? []),
    ...legacyItems,
  ];

  const { error } = await supabaseAdmin
    .from("community_posts")
    .update({
      title,
      content,
      is_published: isPublished,
      attachments: finalAttachments,
    })
    .eq("id", postId);

  if (error) {
    if (newUploadResult) {
      await rollbackUploadedAttachments(sessionSupabase, newUploadResult.uploadedPaths);
    }
    redirect(`/admin/community/${postId}/edit?error=update`);
  }

  const keptPathSet = new Set(keptMetas.map((item) => item.path));
  const pathsToDeleteFromStorage = previousWithPath
    .map((item) => item.path)
    .filter((path) => !keptPathSet.has(path));

  await rollbackUploadedAttachments(sessionSupabase, pathsToDeleteFromStorage);

  revalidatePath("/community");
  revalidatePath(`/community/${postId}`);
  revalidatePath("/admin");
  revalidatePath("/admin/community");
  revalidatePath(`/admin/community/${postId}/edit`);
  redirect("/admin/community?updated=1");
}

export async function deleteCommunityPostFromAdmin(formData: FormData) {
  const { supabaseAdmin, sessionSupabase } = await requireAdminUser();
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
  await rollbackUploadedAttachments(sessionSupabase, attachmentPaths);

  revalidatePath("/community");
  revalidatePath("/admin");
  revalidatePath("/admin/community");
  redirect("/admin/community?deleted=1");
}
