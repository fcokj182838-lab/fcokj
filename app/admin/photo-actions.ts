"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  type ArticleOpenGraphResult,
  PRESS_GALLERY_PLACEHOLDER_PATH,
  downloadOgImageForUpload,
  fetchOpenGraphForArticleUrl,
} from "../lib/article-open-graph";
import { requireAdminUser } from "../lib/require-admin";

const STORAGE_BUCKET = "gallery-photos";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_GALLERY_IMAGES_PER_SUBMIT = 30;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);

/** form 의 정수형 id 검증 */
function parsePhotoIdFromForm(formData: FormData): number | null {
  const raw = formData.get("id");
  if (typeof raw !== "string") return null;
  const photoId = Number.parseInt(raw, 10);
  if (!Number.isFinite(photoId) || photoId < 1) return null;
  return photoId;
}

function parsePublishedFromForm(formData: FormData): boolean {
  const raw = formData.get("is_published");
  return raw === "on" || raw === "true";
}

/** 빈 문자열은 null 로 변환 */
function emptyToNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

/** https / http 기사 URL만 허용 */
function parseArticleUrlFromForm(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  try {
    const u = new URL(trimmed);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** FormData 에서 동일 name 으로 올라온 이미지 File 만 수집 (빈 항목 제외) */
function extractGalleryImageFiles(formData: FormData, fieldName: string): File[] {
  const out: File[] = [];
  for (const entry of formData.getAll(fieldName)) {
    if (entry instanceof File && entry.size > 0) {
      out.push(entry);
    }
  }
  return out;
}

/** 여러 장 등록 시 제목이 200자를 넘지 않도록 (1/N) 접미사 포함 */
function buildGalleryPhotoTitleForBulk(baseTitle: string, index: number, total: number): string {
  const trimmed = baseTitle.trim();
  if (total <= 1) return trimmed.slice(0, 200);
  const suffix = ` (${index + 1}/${total})`;
  const maxBaseLen = Math.max(0, 200 - suffix.length);
  return `${trimmed.slice(0, maxBaseLen)}${suffix}`;
}

/** 활동사진 vs 언론 (폼에 없거나 잘못된 값이면 activity) */
type GalleryKind = "activity" | "press";

function parseGalleryKindFromForm(formData: FormData): GalleryKind {
  const raw = formData.get("gallery_kind");
  return raw === "press" ? "press" : "activity";
}

/** 등록 폼 오류 시 kind=press 쿼리 유지 */
function buildAdminNewGalleryUrl(kind: GalleryKind, extra?: Record<string, string>): string {
  const search = new URLSearchParams();
  if (kind === "press") search.set("kind", "press");
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      search.set(key, value);
    }
  }
  const queryString = search.toString();
  return queryString.length > 0 ? `/admin/gallery/photos/new?${queryString}` : "/admin/gallery/photos/new";
}

/** sort_order 정수 파싱 (실패 시 0) */
function parseSortOrderFromForm(formData: FormData): number {
  const raw = formData.get("sort_order");
  if (typeof raw !== "string") return 0;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** taken_at 날짜(YYYY-MM-DD) 검증, 잘못된 값이면 null */
function parseTakenAtFromForm(formData: FormData): string | null {
  const raw = formData.get("taken_at");
  if (typeof raw !== "string" || raw.trim().length === 0) return null;
  const isoDateMatch = /^\d{4}-\d{2}-\d{2}$/.test(raw.trim());
  return isoDateMatch ? raw.trim() : null;
}

/** 파일 확장자 추출 (소문자) */
function getExtensionFromFile(file: File): string {
  const name = file.name ?? "";
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex === -1) return "bin";
  return name.slice(dotIndex + 1).toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
}

/** Storage 에 이미지 업로드 후 public URL/경로 반환 */
async function uploadPhotoToStorage(
  supabaseAdmin: Awaited<ReturnType<typeof requireAdminUser>>["supabaseAdmin"],
  imageFile: File,
): Promise<{ imageUrl: string; imagePath: string } | null> {
  if (imageFile.size === 0 || imageFile.size > MAX_IMAGE_BYTES) {
    return null;
  }
  if (!ALLOWED_MIME_TYPES.has(imageFile.type)) {
    return null;
  }

  const ext = getExtensionFromFile(imageFile);
  const now = new Date();
  const yyyyMm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const uniqueSuffix = `${now.getTime()}-${Math.random().toString(36).slice(2, 10)}`;
  const imagePath = `${yyyyMm}/${uniqueSuffix}.${ext}`;

  const arrayBuffer = await imageFile.arrayBuffer();
  const fileBytes = new Uint8Array(arrayBuffer);

  const { error: uploadError } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(imagePath, fileBytes, {
      contentType: imageFile.type,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return null;
  }

  const { data: publicUrlData } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(imagePath);
  if (!publicUrlData?.publicUrl) {
    return null;
  }

  return { imageUrl: publicUrlData.publicUrl, imagePath };
}

/** 바이트 버퍼를 갤러리 Storage에 올리고 public URL 반환 (OG 이미지 복사용) */
async function uploadGalleryImageBytes(
  supabaseAdmin: Awaited<ReturnType<typeof requireAdminUser>>["supabaseAdmin"],
  fileBytes: Uint8Array,
  contentType: string,
  fileExtension: string,
): Promise<{ imageUrl: string; imagePath: string } | null> {
  const safeExt = fileExtension.replace(/[^a-z0-9]/g, "") || "jpg";
  const now = new Date();
  const yyyyMm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const uniqueSuffix = `${now.getTime()}-${Math.random().toString(36).slice(2, 10)}`;
  const imagePath = `${yyyyMm}/og-${uniqueSuffix}.${safeExt}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(imagePath, fileBytes, {
      contentType,
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return null;
  }

  const { data: publicUrlData } = supabaseAdmin.storage.from(STORAGE_BUCKET).getPublicUrl(imagePath);
  if (!publicUrlData?.publicUrl) {
    return null;
  }

  return { imageUrl: publicUrlData.publicUrl, imagePath };
}

/** 이미 받아 둔 OG 결과로 Storage 썸네일을 만들거나 플레이스홀더로 대체 */
async function resolveThumbnailFromOpenGraphResult(
  supabaseAdmin: Awaited<ReturnType<typeof requireAdminUser>>["supabaseAdmin"],
  og: ArticleOpenGraphResult,
): Promise<{ imageUrl: string; imagePath: string | null }> {
  for (const imageUrl of og.imageUrls) {
    const downloaded = await downloadOgImageForUpload(imageUrl);
    if (!downloaded) continue;
    const uploaded = await uploadGalleryImageBytes(
      supabaseAdmin,
      downloaded.bytes,
      downloaded.contentType,
      downloaded.extension,
    );
    if (uploaded) {
      return { imageUrl: uploaded.imageUrl, imagePath: uploaded.imagePath };
    }
  }
  return { imageUrl: PRESS_GALLERY_PLACEHOLDER_PATH, imagePath: null };
}

/** 기사 HTML을 한 번 받아 OG 추출 후 썸네일까지 처리 (등록 폼에서 OG 메타 한 번만 요청) */
async function resolvePressThumbnailFromArticleUrl(
  supabaseAdmin: Awaited<ReturnType<typeof requireAdminUser>>["supabaseAdmin"],
  articleUrl: string,
): Promise<{ imageUrl: string; imagePath: string | null }> {
  const og = await fetchOpenGraphForArticleUrl(articleUrl);
  return resolveThumbnailFromOpenGraphResult(supabaseAdmin, og);
}

/** 제목 최대 길이 (DB check 와 일치) */
function truncateTitle(title: string): string {
  return title.trim().slice(0, 200);
}

/** Storage 에서 단일 파일 삭제 (실패해도 무시) */
async function removePhotoFromStorage(
  supabaseAdmin: Awaited<ReturnType<typeof requireAdminUser>>["supabaseAdmin"],
  imagePath: string | null,
) {
  if (!imagePath) return;
  await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([imagePath]);
}

/** 새 사진 등록: 활동사진=이미지 다중, 언론=기사 링크(OG 썸네일) */
export async function createGalleryPhotoFromAdmin(formData: FormData) {
  const { userId, supabaseAdmin } = await requireAdminUser();
  const galleryKind = parseGalleryKindFromForm(formData);

  const titleInput = emptyToNull(formData.get("title"));
  const description = emptyToNull(formData.get("description"));
  const takenAt = parseTakenAtFromForm(formData);
  const sortOrder = parseSortOrderFromForm(formData);
  const isPublished = parsePublishedFromForm(formData);

  // ── 언론: 기사 URL만으로 등록 (이미지 파일 없음)
  if (galleryKind === "press") {
    const articleUrl = parseArticleUrlFromForm(formData.get("article_url"));
    if (!articleUrl) {
      redirect(buildAdminNewGalleryUrl("press", { error: "press_url" }));
    }

    const og = await fetchOpenGraphForArticleUrl(articleUrl);
    const resolvedTitle =
      (titleInput && titleInput.length > 0 ? truncateTitle(titleInput) : null) ??
      (og.title ? truncateTitle(og.title) : null) ??
      (() => {
        try {
          return truncateTitle(`${new URL(articleUrl).hostname.replace(/^www\./, "")} 기사`);
        } catch {
          return "언론 보도";
        }
      })();

    const { imageUrl, imagePath } = await resolveThumbnailFromOpenGraphResult(supabaseAdmin, og);

    const { error: insertError } = await supabaseAdmin.from("gallery_photos").insert({
      title: resolvedTitle,
      description,
      image_url: imageUrl,
      image_path: imagePath,
      taken_at: takenAt,
      sort_order: sortOrder,
      is_published: isPublished,
      gallery_kind: "press",
      article_url: articleUrl,
      author_id: userId,
    });

    if (insertError) {
      if (imagePath) {
        await removePhotoFromStorage(supabaseAdmin, imagePath);
      }
      redirect(buildAdminNewGalleryUrl("press", { error: "insert" }));
    }

    revalidatePath("/gallery/photos");
    revalidatePath("/gallery/press");
    revalidatePath("/admin/gallery/photos");
    revalidatePath("/admin");
    redirect("/admin/gallery/photos?created=1");
  }

  // ── 활동사진: 기존과 동일 (파일 다중 업로드)
  const title = (titleInput ?? "");
  const imageFiles = extractGalleryImageFiles(formData, "images");
  if (!title || imageFiles.length === 0) {
    redirect(buildAdminNewGalleryUrl(galleryKind, { error: "invalid" }));
  }
  if (imageFiles.length > MAX_GALLERY_IMAGES_PER_SUBMIT) {
    redirect(buildAdminNewGalleryUrl(galleryKind, { error: "too_many" }));
  }

  const uploadedList: { imageUrl: string; imagePath: string }[] = [];

  for (const file of imageFiles) {
    const uploaded = await uploadPhotoToStorage(supabaseAdmin, file);
    if (!uploaded) {
      for (const u of uploadedList) {
        await removePhotoFromStorage(supabaseAdmin, u.imagePath);
      }
      redirect(buildAdminNewGalleryUrl(galleryKind, { error: "upload" }));
    }
    uploadedList.push(uploaded);
  }

  const total = imageFiles.length;
  const rows = uploadedList.map((uploaded, index) => ({
    title: buildGalleryPhotoTitleForBulk(title, index, total),
    description,
    image_url: uploaded.imageUrl,
    image_path: uploaded.imagePath,
    taken_at: takenAt,
    sort_order: sortOrder,
    is_published: isPublished,
    gallery_kind: galleryKind,
    author_id: userId,
  }));

  const { error } = await supabaseAdmin.from("gallery_photos").insert(rows);

  if (error) {
    for (const u of uploadedList) {
      await removePhotoFromStorage(supabaseAdmin, u.imagePath);
    }
    redirect(buildAdminNewGalleryUrl(galleryKind, { error: "insert" }));
  }

  revalidatePath("/gallery/photos");
  revalidatePath("/gallery/press");
  revalidatePath("/admin/gallery/photos");
  revalidatePath("/admin");
  redirect(`/admin/gallery/photos?bulk=${total}`);
}

/** 사진 메타데이터 수정 (이미지 교체 선택 · 언론 기사 링크 수정 시 OG 재반영) */
export async function updateGalleryPhotoFromAdmin(formData: FormData) {
  const { supabaseAdmin } = await requireAdminUser();
  const photoId = parsePhotoIdFromForm(formData);
  if (!photoId) {
    redirect("/admin/gallery/photos?error=invalid");
  }

  const title = emptyToNull(formData.get("title")) ?? "";
  const description = emptyToNull(formData.get("description"));
  const takenAt = parseTakenAtFromForm(formData);
  const sortOrder = parseSortOrderFromForm(formData);
  const isPublished = parsePublishedFromForm(formData);
  const galleryKind = parseGalleryKindFromForm(formData);

  const { data: existingRow, error: existingError } = await supabaseAdmin
    .from("gallery_photos")
    .select("image_path, article_url, gallery_kind, image_url")
    .eq("id", photoId)
    .maybeSingle();

  if (existingError || !existingRow) {
    redirect(`/admin/gallery/photos/${photoId}/edit?error=update`);
  }

  const priorArticleUrl = (existingRow.article_url ?? null) as string | null;
  const priorImagePath = (existingRow.image_path ?? null) as string | null;

  if (!title) {
    redirect(`/admin/gallery/photos/${photoId}/edit?error=invalid`);
  }

  const formArticleUrl = parseArticleUrlFromForm(formData.get("article_url"));

  const updatePayload: Record<string, unknown> = {
    title,
    description,
    taken_at: takenAt,
    sort_order: sortOrder,
    is_published: isPublished,
    gallery_kind: galleryKind,
  };

  if (galleryKind === "press") {
    if (!formArticleUrl) {
      redirect(`/admin/gallery/photos/${photoId}/edit?error=press_url`);
    }
    updatePayload.article_url = formArticleUrl;
  } else {
    updatePayload.article_url = null;
  }

  // 이미지가 새로 첨부된 경우 — 수동 파일이 최우선
  const imageFile = formData.get("image");
  let oldImagePathToRemove: string | null = null;
  let newUploadedPathForRollback: string | null = null;

  if (imageFile instanceof File && imageFile.size > 0) {
    const uploaded = await uploadPhotoToStorage(supabaseAdmin, imageFile);
    if (!uploaded) {
      redirect(`/admin/gallery/photos/${photoId}/edit?error=upload`);
    }
    updatePayload.image_url = uploaded.imageUrl;
    updatePayload.image_path = uploaded.imagePath;
    oldImagePathToRemove = priorImagePath;
    newUploadedPathForRollback = uploaded.imagePath;
  } else if (galleryKind === "press" && formArticleUrl && formArticleUrl !== priorArticleUrl) {
    // 언론: 기사 URL이 바뀌었고 새 파일이 없으면 OG 썸네일 다시 시도
    const { imageUrl, imagePath } = await resolvePressThumbnailFromArticleUrl(supabaseAdmin, formArticleUrl);
    updatePayload.image_url = imageUrl;
    updatePayload.image_path = imagePath;
    if (priorImagePath && priorImagePath !== imagePath) {
      oldImagePathToRemove = priorImagePath;
    }
    if (imagePath) {
      newUploadedPathForRollback = imagePath;
    }
  }

  const { error } = await supabaseAdmin.from("gallery_photos").update(updatePayload).eq("id", photoId);

  if (error) {
    if (newUploadedPathForRollback && newUploadedPathForRollback !== priorImagePath) {
      await removePhotoFromStorage(supabaseAdmin, newUploadedPathForRollback);
    }
    redirect(`/admin/gallery/photos/${photoId}/edit?error=update`);
  }

  if (oldImagePathToRemove) {
    await removePhotoFromStorage(supabaseAdmin, oldImagePathToRemove);
  }

  revalidatePath("/gallery/photos");
  revalidatePath("/gallery/press");
  revalidatePath("/admin/gallery/photos");
  revalidatePath(`/admin/gallery/photos/${photoId}/edit`);
  revalidatePath(`/gallery/press/${photoId}`);
  revalidatePath("/admin");
  redirect("/admin/gallery/photos?updated=1");
}

/** 사진 삭제 (DB + Storage 동기 정리) */
export async function deleteGalleryPhotoFromAdmin(formData: FormData) {
  const { supabaseAdmin } = await requireAdminUser();
  const photoId = parsePhotoIdFromForm(formData);
  if (!photoId) {
    redirect("/admin/gallery/photos?error=invalid");
  }

  const { data: existing } = await supabaseAdmin
    .from("gallery_photos")
    .select("image_path")
    .eq("id", photoId)
    .maybeSingle();

  const { error } = await supabaseAdmin.from("gallery_photos").delete().eq("id", photoId);

  if (error) {
    redirect("/admin/gallery/photos?error=delete");
  }

  await removePhotoFromStorage(supabaseAdmin, (existing?.image_path ?? null) as string | null);

  revalidatePath("/gallery/photos");
  revalidatePath("/gallery/press");
  revalidatePath("/admin/gallery/photos");
  revalidatePath("/admin");
  redirect("/admin/gallery/photos?deleted=1");
}
