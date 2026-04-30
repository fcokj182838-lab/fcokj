import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getSupabaseAdminClient } from "../../lib/supabase/server";

export const metadata: Metadata = {
  title: "활동사진",
  description: "사단법인 외국인과 동행의 활동사진 모음입니다.",
};

type GalleryPhoto = {
  id: number;
  title: string;
  description: string | null;
  image_url: string;
  taken_at: string | null;
  created_at: string;
};

/** 한 페이지에 표시할 활동사진 개수 (3열 × 6행) */
const PAGE_SIZE = 18;

type FetchResult = {
  photos: GalleryPhoto[];
  total: number;
  totalPages: number;
  currentPage: number;
  hasConfig: boolean;
  hasError: boolean;
};

/** URL 의 page 쿼리를 1 이상의 정수로 파싱 (없거나 잘못되면 1) */
function parseListPage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number.parseInt(value ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

/** 페이지 링크 (page 외 쿼리 유지) */
function buildGalleryPhotosPageHref(
  targetPage: number,
  currentParams: Record<string, string | string[] | undefined>,
): string {
  const searchParams = new URLSearchParams();
  for (const [key, rawVal] of Object.entries(currentParams)) {
    if (key === "page") continue;
    if (rawVal === undefined) continue;
    const val = Array.isArray(rawVal) ? rawVal[0] : rawVal;
    if (val) searchParams.set(key, val);
  }
  if (targetPage > 1) searchParams.set("page", String(targetPage));
  const query = searchParams.toString();
  return query ? `/gallery/photos?${query}` : "/gallery/photos";
}

/** 공개 활동사진만 · 정렬 동일 · 페이지당 PAGE_SIZE 건 */
async function getPublishedPhotosPage(pageFromUrl: number): Promise<FetchResult> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return {
      photos: [],
      total: 0,
      totalPages: 1,
      currentPage: 1,
      hasConfig: false,
      hasError: false,
    };
  }

  const { count: totalCount, error: countError } = await supabase
    .from("gallery_photos")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true)
    .eq("gallery_kind", "activity");

  if (countError) {
    return {
      photos: [],
      total: 0,
      totalPages: 1,
      currentPage: 1,
      hasConfig: true,
      hasError: true,
    };
  }

  const total = totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, pageFromUrl), totalPages);
  const rangeFrom = (currentPage - 1) * PAGE_SIZE;
  const rangeTo = rangeFrom + PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from("gallery_photos")
    .select("id, title, description, image_url, taken_at, created_at")
    .eq("is_published", true)
    .eq("gallery_kind", "activity")
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false })
    .range(rangeFrom, rangeTo);

  if (error || !data) {
    return {
      photos: [],
      total,
      totalPages,
      currentPage,
      hasConfig: true,
      hasError: true,
    };
  }

  return {
    photos: data as GalleryPhoto[],
    total,
    totalPages,
    currentPage,
    hasConfig: true,
    hasError: false,
  };
}

/** 표시용 날짜 포맷 (촬영일 우선, 없으면 등록일) */
function formatPhotoDate(takenAt: string | null, createdAt: string): string {
  const target = takenAt ?? createdAt;
  try {
    const date = new Date(target);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "";
  }
}

export default async function PhotosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { photos, total, totalPages, currentPage, hasConfig, hasError } = await getPublishedPhotosPage(
    parseListPage(params.page),
  );

  return (
    <section className="relative bg-[var(--color-ivory)] py-20 lg:py-28">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
        {/* 페이지 헤더 */}
        <header className="mb-12 max-w-2xl">
          <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
            ─ Gallery · Photos
          </p>
          <h1 className="mt-4 font-[var(--font-serif)] text-4xl font-medium tracking-[-0.02em] text-[var(--color-ink)] md:text-6xl">
            활동사진
          </h1>
          <p className="mt-4 text-[15px] leading-[1.9] text-[var(--color-ink-soft)]">
            한국어 교실, 문화체험, 봉사활동 등 사단법인 외국인과 동행이 함께한 순간들을 모았습니다.
            {total > 0 && (
              <span className="mt-2 block text-sm text-[var(--color-muted)]">
                총 {total.toLocaleString("ko-KR")}건 · 페이지당 {PAGE_SIZE}건
              </span>
            )}
          </p>
        </header>

        {!hasConfig && (
          <p className="mb-8 border-l-2 border-[var(--color-terracotta)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-ink-soft)]">
            Supabase 환경변수가 설정되지 않아 사진을 불러올 수 없습니다.
          </p>
        )}

        {hasError && (
          <p className="mb-8 border-l-2 border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
            사진을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        )}

        {hasConfig && photos.length === 0 && !hasError ? (
          <div className="border border-dashed border-[var(--color-line)] bg-[var(--color-cream)] p-12 text-center">
            <p className="font-[var(--font-serif)] text-2xl text-[var(--color-ink)]">
              아직 등록된 사진이 없습니다
            </p>
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              곧 다양한 활동의 순간들을 만나보실 수 있습니다.
            </p>
            <Link
              href="/admin"
              className="mt-6 inline-block text-xs text-[var(--color-terracotta)] underline"
            >
              관리자로 이동
            </Link>
          </div>
        ) : (
          <>
            {/* 모바일 1열 → sm 2열 → md 이상 3열 */}
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {photos.map((photo) => {
                const dateLabel = formatPhotoDate(photo.taken_at, photo.created_at);
                return (
                  <li key={photo.id} className="h-full">
                    <Link
                      href={`/gallery/photos/${photo.id}`}
                      className="group flex h-full flex-col overflow-hidden border border-[var(--color-line)] bg-[var(--color-cream)] transition-all duration-300 hover:border-[var(--color-terracotta)] hover:shadow-[0_18px_40px_-18px_rgba(26,35,50,0.18)]"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-ivory)]">
                        <Image
                          src={photo.image_url}
                          alt={photo.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      </div>

                      <div className="flex flex-1 flex-col gap-3 p-5">
                        {dateLabel && (
                          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                            {dateLabel}
                          </p>
                        )}
                        <h2 className="font-[var(--font-serif)] text-xl leading-snug text-[var(--color-ink)] underline decoration-transparent decoration-2 underline-offset-2 transition-colors group-hover:decoration-[var(--color-terracotta)] group-hover:text-[var(--color-terracotta)]">
                          {photo.title}
                        </h2>
                        {photo.description && (
                          <p className="line-clamp-3 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                            {photo.description}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {total > 0 && totalPages > 1 && (
              <nav
                className="mt-10 flex flex-wrap items-center justify-between gap-3 border border-[var(--color-line)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-ink)]"
                aria-label="활동사진 목록 페이지"
              >
                <span className="text-[var(--color-muted)]">
                  {currentPage.toLocaleString("ko-KR")} / {totalPages.toLocaleString("ko-KR")} 페이지
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {currentPage <= 1 ? (
                    <span className="cursor-not-allowed px-3 py-1 text-[var(--color-muted)] opacity-50">
                      이전
                    </span>
                  ) : (
                    <Link
                      href={buildGalleryPhotosPageHref(currentPage - 1, params)}
                      className="border border-[var(--color-line)] bg-[var(--color-ivory)] px-3 py-1 hover:border-[var(--color-terracotta)] hover:text-[var(--color-terracotta)]"
                    >
                      이전
                    </Link>
                  )}
                  {currentPage >= totalPages ? (
                    <span className="cursor-not-allowed px-3 py-1 text-[var(--color-muted)] opacity-50">
                      다음
                    </span>
                  ) : (
                    <Link
                      href={buildGalleryPhotosPageHref(currentPage + 1, params)}
                      className="border border-[var(--color-line)] bg-[var(--color-ivory)] px-3 py-1 hover:border-[var(--color-terracotta)] hover:text-[var(--color-terracotta)]"
                    >
                      다음
                    </Link>
                  )}
                </div>
              </nav>
            )}
          </>
        )}
      </div>
    </section>
  );
}
