"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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

/** Storage 에서 단일 파일 삭제 (실패해도 무시) */
async function removePhotoFromStorage(
  supabaseAdmin: Awaited<ReturnType<typeof requireAdminUser>>["supabaseAdmin"],
  imagePath: string | null,
) {
  if (!imagePath) return;
  await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([imagePath]);
}

/** 새 사진 등록: 이미지 1장 이상(최대 MAX_GALLERY_IMAGES_PER_SUBMIT) + 공통 메타데이터 */
export async function createGalleryPhotoFromAdmin(formData: FormData) {
  const { userId, supabaseAdmin } = await requireAdminUser();

  const title = (emptyToNull(formData.get("title")) ?? "");
  const description = emptyToNull(formData.get("description"));
  const takenAt = parseTakenAtFromForm(formData);
  const sortOrder = parseSortOrderFromForm(formData);
  const isPublished = parsePublishedFromForm(formData);

  const imageFiles = extractGalleryImageFiles(formData, "images");
  if (!title || imageFiles.length === 0) {
    redirect("/admin/gallery/photos/new?error=invalid");
  }
  if (imageFiles.length > MAX_GALLERY_IMAGES_PER_SUBMIT) {
    redirect("/admin/gallery/photos/new?error=too_many");
  }

  const uploadedList: { imageUrl: string; imagePath: string }[] = [];

  for (const file of imageFiles) {
    const uploaded = await uploadPhotoToStorage(supabaseAdmin, file);
    if (!uploaded) {
      for (const u of uploadedList) {
        await removePhotoFromStorage(supabaseAdmin, u.imagePath);
      }
      redirect("/admin/gallery/photos/new?error=upload");
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
    author_id: userId,
  }));

  const { error } = await supabaseAdmin.from("gallery_photos").insert(rows);

  if (error) {
    for (const u of uploadedList) {
      await removePhotoFromStorage(supabaseAdmin, u.imagePath);
    }
    redirect("/admin/gallery/photos/new?error=insert");
  }

  revalidatePath("/gallery/photos");
  revalidatePath("/admin/gallery/photos");
  revalidatePath("/admin");
  redirect(`/admin/gallery/photos?bulk=${total}`);
}

/** 사진 메타데이터 수정 (이미지 교체 선택) */
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

  if (!title) {
    redirect(`/admin/gallery/photos/${photoId}/edit?error=invalid`);
  }

  const updatePayload: Record<string, unknown> = {
    title,
    description,
    taken_at: takenAt,
    sort_order: sortOrder,
    is_published: isPublished,
  };

  // 이미지가 새로 첨부된 경우에만 교체
  const imageFile = formData.get("image");
  let oldImagePathToRemove: string | null = null;

  if (imageFile instanceof File && imageFile.size > 0) {
    const { data: existing } = await supabaseAdmin
      .from("gallery_photos")
      .select("image_path")
      .eq("id", photoId)
      .maybeSingle();

    const uploaded = await uploadPhotoToStorage(supabaseAdmin, imageFile);
    if (!uploaded) {
      redirect(`/admin/gallery/photos/${photoId}/edit?error=upload`);
    }
    updatePayload.image_url = uploaded.imageUrl;
    updatePayload.image_path = uploaded.imagePath;
    oldImagePathToRemove = (existing?.image_path ?? null) as string | null;
  }

  const { error } = await supabaseAdmin
    .from("gallery_photos")
    .update(updatePayload)
    .eq("id", photoId);

  if (error) {
    // 새 이미지 업로드 후 DB 실패 시 롤백
    if (typeof updatePayload.image_path === "string") {
      await removePhotoFromStorage(supabaseAdmin, updatePayload.image_path as string);
    }
    redirect(`/admin/gallery/photos/${photoId}/edit?error=update`);
  }

  // 기존 이미지 정리 (실패해도 무시)
  if (oldImagePathToRemove) {
    await removePhotoFromStorage(supabaseAdmin, oldImagePathToRemove);
  }

  revalidatePath("/gallery/photos");
  revalidatePath("/admin/gallery/photos");
  revalidatePath(`/admin/gallery/photos/${photoId}/edit`);
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
  revalidatePath("/admin/gallery/photos");
  revalidatePath("/admin");
  redirect("/admin/gallery/photos?deleted=1");
}
