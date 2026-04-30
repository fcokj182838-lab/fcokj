import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseAdminClient } from "../../../lib/supabase/server";

type GalleryPhotoDetail = {
  id: number;
  title: string;
  description: string | null;
  image_url: string;
  taken_at: string | null;
  created_at: string;
  updated_at: string;
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** URL id → 양의 정수 id (실패 시 null) */
function parseGalleryPhotoId(rawId: string): number | null {
  const parsed = Number.parseInt(rawId, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return null;
  return parsed;
}

/** 공개된 활동사진 1건 (없으면 null) */
async function getPublishedGalleryPhotoById(photoId: number): Promise<GalleryPhotoDetail | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("gallery_photos")
    .select("id, title, description, image_url, taken_at, created_at, updated_at")
    .eq("id", photoId)
    .eq("is_published", true)
    .eq("gallery_kind", "activity")
    .maybeSingle();

  if (error || !data) return null;
  return data as GalleryPhotoDetail;
}

/** 날짜만 한국어로 (촬영일 등) */
function formatDateOnly(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** 날짜+시간 한국어로 */
function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id: rawId } = await params;
  const photoId = parseGalleryPhotoId(rawId);
  if (photoId === null) {
    return { title: "사진을 찾을 수 없습니다" };
  }

  const photo = await getPublishedGalleryPhotoById(photoId);
  if (!photo) {
    return { title: "사진을 찾을 수 없습니다" };
  }

  const desc =
    photo.description && photo.description.trim().length > 0
      ? photo.description.trim().slice(0, 160)
      : `${photo.title} 활동사진`;

  return {
    title: `${photo.title} · 활동사진`,
    description: desc,
  };
}

export default async function GalleryPhotoDetailPage({ params, searchParams }: PageProps) {
  const { id: rawId } = await params;
  await searchParams;

  const photoId = parseGalleryPhotoId(rawId);
  if (photoId === null) {
    notFound();
  }

  const photo = await getPublishedGalleryPhotoById(photoId);
  if (!photo) {
    notFound();
  }

  const takenLabel = formatDateOnly(photo.taken_at);
  const createdLabel = formatDateTime(photo.created_at);
  const updatedLabel = formatDateTime(photo.updated_at);
  const showUpdated = photo.updated_at !== photo.created_at;

  return (
    <section className="relative bg-[var(--color-ivory)] py-20 lg:py-28">
      <div className="mx-auto max-w-[960px] space-y-8 px-6 lg:px-10">
        <header>
          <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
            ─ Gallery · Photo #{photo.id}
          </p>
          <h1 className="mt-2 font-[var(--font-serif)] text-3xl font-medium leading-tight tracking-[-0.02em] text-[var(--color-ink)] md:text-4xl">
            {photo.title}
          </h1>

          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-xs text-[var(--color-muted)]">
            <div className="flex items-center gap-1.5">
              <dt className="font-[var(--font-display)] uppercase tracking-[0.2em]">촬영일</dt>
              <dd className="text-[var(--color-ink-soft)]">{takenLabel}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="font-[var(--font-display)] uppercase tracking-[0.2em]">등록</dt>
              <dd className="text-[var(--color-ink-soft)]">{createdLabel}</dd>
            </div>
            {showUpdated && (
              <div className="flex items-center gap-1.5">
                <dt className="font-[var(--font-display)] uppercase tracking-[0.2em]">수정</dt>
                <dd className="text-[var(--color-ink-soft)]">{updatedLabel}</dd>
              </div>
            )}
          </dl>
        </header>

        <article className="border border-[var(--color-line)] bg-[var(--color-cream)] p-4 md:p-8">
          <div className="relative mx-auto flex min-h-[200px] w-full max-w-4xl items-center justify-center bg-[var(--color-ivory)]">
            <Image
              src={photo.image_url}
              alt={photo.title}
              width={1600}
              height={1200}
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
              className="h-auto max-h-[min(85vh,900px)] w-full object-contain"
            />
          </div>

          {photo.description && photo.description.trim().length > 0 && (
            <div className="mt-8 border-t border-[var(--color-line)] pt-8">
              <h2 className="mb-3 font-[var(--font-display)] text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                ─ 설명
              </h2>
              <p className="whitespace-pre-line text-[15px] leading-[1.9] text-[var(--color-ink)]">
                {photo.description}
              </p>
            </div>
          )}
        </article>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/gallery/photos"
            className="inline-flex items-center gap-2 border border-[var(--color-line)] bg-[var(--color-cream)] px-4 py-2 text-sm text-[var(--color-ink)] hover:border-[var(--color-terracotta)] hover:text-[var(--color-terracotta)]"
          >
            ← 활동사진 목록
          </Link>
          <p className="text-xs text-[var(--color-muted)]">
            수정은{" "}
            <Link href={`/admin/gallery/photos/${photo.id}/edit`} className="text-[var(--color-terracotta)] underline">
              관리자
            </Link>
            에서 가능합니다.
          </p>
        </div>
      </div>
    </section>
  );
}
