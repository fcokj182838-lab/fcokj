"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdminClient } from "../lib/supabase/server";
import { requireAdminUser } from "../lib/require-admin";

const MAX_TITLE = 200;
const MAX_BODY = 4000;

/** 갤러리와 동일 버킷 — 경로 접두사로 팝업 전용 구분 */
const POPUP_BANNER_STORAGE_BUCKET = "gallery-photos";
const POPUP_BANNER_STORAGE_PREFIX = "site-popup-banner";
const MAX_POPUP_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_POPUP_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

const ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/** 폼의 date 입력값을 검증해 YYYY-MM-DD 또는 null */
function parseOptionalIsoDateFromForm(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (!ISO_DATE_ONLY.test(trimmed)) return null;
  return trimmed;
}

/** http(s) 만 허용 — img src / 링크에 javascript: 등 차단 */
function normalizeHttpUrl(raw: string): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.href;
  } catch {
    return "";
  }
}

/** 폼에서 팝업 배너 id 파싱 (실패 시 null) */
function parsePopupBannerIdFromForm(formData: FormData): number | null {
  const raw = formData.get("id");
  if (typeof raw !== "string") return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 1 ? n : null;
}

/** 표시 순서 0 이상 정수 */
function parseSortOrderFromForm(formData: FormData): number {
  const raw = formData.get("sort_order");
  if (typeof raw !== "string") return 0;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return 0;
  return Math.min(999_999, Math.max(0, n));
}

/** 파일명에서 확장자만 안전하게 추출 */
function getImageExtensionFromFile(imageFile: File): string {
  const name = imageFile.name ?? "";
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex === -1) return "bin";
  return name.slice(dotIndex + 1).toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
}

/**
 * 팝업 배너용 이미지를 Storage에 올리고 public URL 반환.
 * 실패 시 null (용량·MIME·업로드 오류).
 */
async function uploadPopupBannerImage(
  supabaseAdmin: SupabaseClient,
  imageFile: File,
): Promise<string | null> {
  if (imageFile.size === 0 || imageFile.size > MAX_POPUP_IMAGE_BYTES) {
    return null;
  }
  if (!ALLOWED_POPUP_IMAGE_MIME.has(imageFile.type)) {
    return null;
  }

  const ext = getImageExtensionFromFile(imageFile);
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const uniqueSuffix = `${now.getTime()}-${Math.random().toString(36).slice(2, 10)}`;
  const objectPath = `${POPUP_BANNER_STORAGE_PREFIX}/${yearMonth}/${uniqueSuffix}.${ext}`;

  const fileBytes = new Uint8Array(await imageFile.arrayBuffer());

  const { error: uploadError } = await supabaseAdmin.storage
    .from(POPUP_BANNER_STORAGE_BUCKET)
    .upload(objectPath, fileBytes, {
      contentType: imageFile.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.error("[popup-banner] storage upload failed:", uploadError.message);
    return null;
  }

  const { data: publicUrlData } = supabaseAdmin.storage
    .from(POPUP_BANNER_STORAGE_BUCKET)
    .getPublicUrl(objectPath);

  if (!publicUrlData?.publicUrl) {
    return null;
  }

  return publicUrlData.publicUrl;
}

/** 목록에서 「팝업 추가」— 빈 행 생성 후 편집 화면으로 이동 */
export async function createSitePopupBannerAction(_formData: FormData) {
  await requireAdminUser();
  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin) {
    redirect("/admin/popup-banner?error=config");
  }

  const { data: maxRow } = await supabaseAdmin
    .from("site_popup_banners")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder =
    maxRow && typeof maxRow.sort_order === "number" && Number.isFinite(maxRow.sort_order)
      ? maxRow.sort_order + 1
      : 0;

  const { data: inserted, error } = await supabaseAdmin
    .from("site_popup_banners")
    .insert({ is_enabled: false, sort_order: nextOrder })
    .select("id")
    .single();

  if (error || inserted == null) {
    redirect("/admin/popup-banner?error=save");
  }

  const newId =
    typeof inserted.id === "number" && Number.isFinite(inserted.id)
      ? inserted.id
      : Number.parseInt(String(inserted.id), 10);
  if (!Number.isFinite(newId) || newId < 1) {
    redirect("/admin/popup-banner?error=save");
  }

  revalidatePath("/admin/popup-banner");
  redirect(`/admin/popup-banner/${newId}/edit`);
}

/** 목록·편집에서 삭제 */
export async function deleteSitePopupBannerFromAdmin(formData: FormData) {
  await requireAdminUser();
  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin) {
    redirect("/admin/popup-banner?error=config");
  }

  const id = parsePopupBannerIdFromForm(formData);
  if (!id) {
    redirect("/admin/popup-banner?error=invalid");
  }

  const { error } = await supabaseAdmin.from("site_popup_banners").delete().eq("id", id);

  if (error) {
    redirect("/admin/popup-banner?error=delete");
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/popup-banner");
  redirect("/admin/popup-banner?deleted=1");
}

export async function updateSitePopupBannerFromAdmin(formData: FormData) {
  await requireAdminUser();
  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin) {
    redirect("/admin/popup-banner?error=config");
  }

  const id = parsePopupBannerIdFromForm(formData);
  if (!id) {
    redirect("/admin/popup-banner?error=invalid");
  }

  const isEnabled = formData.get("is_enabled") === "on" || formData.get("is_enabled") === "true";
  const sort_order = parseSortOrderFromForm(formData);

  const rawTitle = formData.get("title");
  const rawBody = formData.get("body");
  const title = typeof rawTitle === "string" ? rawTitle.trim().slice(0, MAX_TITLE) : "";
  const body = typeof rawBody === "string" ? rawBody.trim().slice(0, MAX_BODY) : "";

  const rawLink = formData.get("link_url");
  const link_url = typeof rawLink === "string" ? normalizeHttpUrl(rawLink) : "";

  const imageFileEntry = formData.get("image_file");
  let image_url = "";
  if (imageFileEntry instanceof File && imageFileEntry.size > 0) {
    const uploadedPublicUrl = await uploadPopupBannerImage(supabaseAdmin, imageFileEntry);
    if (!uploadedPublicUrl) {
      redirect(`/admin/popup-banner/${id}/edit?error=upload`);
    }
    image_url = uploadedPublicUrl;
  } else {
    const rawImage = formData.get("image_url");
    image_url = typeof rawImage === "string" ? normalizeHttpUrl(rawImage) : "";
  }

  const publish_start_date = parseOptionalIsoDateFromForm(formData.get("publish_start_date"));
  const publish_end_date = parseOptionalIsoDateFromForm(formData.get("publish_end_date"));
  if (publish_start_date && publish_end_date && publish_start_date > publish_end_date) {
    redirect(`/admin/popup-banner/${id}/edit?error=dates`);
  }

  const { error } = await supabaseAdmin
    .from("site_popup_banners")
    .update({
      is_enabled: isEnabled,
      title,
      body,
      image_url,
      link_url,
      publish_start_date,
      publish_end_date,
      sort_order,
    })
    .eq("id", id);

  if (error) {
    redirect(`/admin/popup-banner/${id}/edit?error=save`);
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/popup-banner");
  revalidatePath(`/admin/popup-banner/${id}/edit`);
  redirect(`/admin/popup-banner/${id}/edit?saved=1`);
}
