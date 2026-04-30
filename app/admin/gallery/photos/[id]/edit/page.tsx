import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { requireAdminUser } from "../../../../../lib/require-admin";
import { logoutAdmin } from "../../../../actions";
import { updateGalleryPhotoFromAdmin } from "../../../../photo-actions";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const noticeMap: Record<string, string> = {
  "error=invalid": "제목을 입력해 주세요.",
  "error=press_url": "언론으로 저장할 때는 기사 링크를 http(s) 주소로 입력해 주세요.",
  "error=upload": "이미지 업로드에 실패했습니다. (jpg/png/webp/avif/gif · 8MB 이하)",
  "error=update": "저장 중 오류가 발생했습니다.",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `사진 수정 #${id}`,
    description: "관리자용 갤러리 사진 수정",
  };
}

export default async function AdminGalleryPhotoEditPage({ params, searchParams }: PageProps) {
  const { supabaseAdmin } = await requireAdminUser();
  const { id: idParam } = await params;
  const sp = await searchParams;

  const photoId = Number.parseInt(idParam, 10);
  if (!Number.isFinite(photoId) || photoId < 1) {
    notFound();
  }

  const { data: photo, error } = await supabaseAdmin
    .from("gallery_photos")
    .select(
      "id, title, description, image_url, taken_at, sort_order, is_published, created_at, updated_at, gallery_kind, article_url",
    )
    .eq("id", photoId)
    .maybeSingle();

  if (error || !photo) {
    notFound();
  }

  const isPressItem = photo.gallery_kind === "press";

  const queryEntries = Object.entries(sp).flatMap(([key, value]) => {
    if (!value) return [];
    return `${key}=${Array.isArray(value) ? value[0] : value}`;
  });
  const noticeMessage = queryEntries.map((query) => noticeMap[query]).find(Boolean);

  return (
    <section className="relative bg-[var(--color-ivory)] py-20 lg:py-28">
      <div className="mx-auto max-w-[800px] space-y-6 px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              ─ Edit photo #{photo.id}
            </p>
            <h1 className="mt-2 font-[var(--font-serif)] text-3xl font-medium text-[var(--color-ink)] md:text-4xl">
              {isPressItem ? "언론 자료 수정" : "사진 수정"}
            </h1>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              등록 {new Date(photo.created_at).toLocaleString("ko-KR")}
              {photo.updated_at !== photo.created_at && (
                <> · 수정 {new Date(photo.updated_at).toLocaleString("ko-KR")}</>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/admin/gallery/photos" className="text-[var(--color-terracotta)] underline">
              목록
            </Link>
            <Link href="/admin" className="text-[var(--color-ink-soft)] underline">
              대시보드
            </Link>
            <form action={logoutAdmin}>
              <button type="submit" className="text-[var(--color-ink-soft)] underline">
                로그아웃
              </button>
            </form>
          </div>
        </div>

        {noticeMessage && (
          <p className="border-l-2 border-[var(--color-terracotta)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-ink-soft)]">
            {noticeMessage}
          </p>
        )}

        <article className="border border-[var(--color-line)] bg-[var(--color-cream)] p-6">
          <div className="mb-6">
            <p className="mb-2 text-xs text-[var(--color-ink-soft)]">현재 이미지</p>
            <div className="relative mx-auto aspect-[4/3] w-full max-w-[480px] overflow-hidden border border-[var(--color-line)] bg-[var(--color-ivory)]">
              <Image
                src={photo.image_url}
                alt={photo.title}
                fill
                sizes="(max-width: 640px) 100vw, 480px"
                className="object-cover"
              />
            </div>
          </div>

          <form action={updateGalleryPhotoFromAdmin} className="grid gap-4">
            <input type="hidden" name="id" value={String(photo.id)} />

            <label className="grid gap-1 text-sm">
              <span className="text-[var(--color-ink-soft)]">표시 구분</span>
              <select
                name="gallery_kind"
                defaultValue={photo.gallery_kind === "press" ? "press" : "activity"}
                className="border border-[var(--color-line)] bg-white px-3 py-2 text-[var(--color-ink)] outline-none focus:border-[var(--color-terracotta)]"
              >
                <option value="activity">활동사진 (/gallery/photos)</option>
                <option value="press">언론 (/gallery/press)</option>
              </select>
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-[var(--color-ink-soft)]">
                기사 링크
                <span className="ml-1 text-xs text-[var(--color-muted)]">
                  (표시 구분이「언론」일 때 필수 — 방문자 카드가 이 주소로 새 탭 이동)
                </span>
              </span>
              <input
                type="url"
                name="article_url"
                inputMode="url"
                autoComplete="url"
                maxLength={2000}
                defaultValue={photo.article_url ?? ""}
                className="border border-[var(--color-line)] bg-white px-3 py-2 text-[var(--color-ink)] outline-none focus:border-[var(--color-terracotta)]"
                placeholder="https:// …"
              />
              {isPressItem ? (
                <span className="text-xs text-[var(--color-muted)]">
                  링크를 바꾸면 저장 시 대표 이미지를 다시 가져옵니다. 직접 이미지를 올리면 그 파일이 우선합니다.
                </span>
              ) : null}
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-[var(--color-ink-soft)]">제목 *</span>
              <input
                type="text"
                name="title"
                required
                maxLength={200}
                defaultValue={photo.title}
                className="border border-[var(--color-line)] bg-white px-3 py-2 text-[var(--color-ink)] outline-none focus:border-[var(--color-terracotta)]"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-[var(--color-ink-soft)]">설명</span>
              <textarea
                name="description"
                rows={4}
                maxLength={2000}
                defaultValue={photo.description ?? ""}
                className="border border-[var(--color-line)] bg-white px-3 py-2 text-[var(--color-ink)] outline-none focus:border-[var(--color-terracotta)]"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="text-[var(--color-ink-soft)]">촬영일</span>
                <input
                  type="date"
                  name="taken_at"
                  defaultValue={photo.taken_at ?? ""}
                  className="border border-[var(--color-line)] bg-white px-3 py-2 text-[var(--color-ink)] outline-none focus:border-[var(--color-terracotta)]"
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-[var(--color-ink-soft)]">
                  정렬 우선순위
                  <span className="ml-1 text-xs text-[var(--color-muted)]">(높을수록 위)</span>
                </span>
                <input
                  type="number"
                  name="sort_order"
                  defaultValue={photo.sort_order}
                  step={1}
                  className="border border-[var(--color-line)] bg-white px-3 py-2 text-[var(--color-ink)] outline-none focus:border-[var(--color-terracotta)]"
                />
              </label>
            </div>

            <label className="grid gap-1 text-sm">
              <span className="text-[var(--color-ink-soft)]">
                {isPressItem ? "썸네일 이미지 직접 지정" : "이미지 교체"}
                <span className="ml-1 text-xs text-[var(--color-muted)]">
                  {isPressItem
                    ? "(선택 — 언론은 기본적으로 기사 OG 이미지를 사용합니다)"
                    : "(선택 시 기존 이미지가 교체되고 Storage에서 자동 정리됩니다)"}
                </span>
              </span>
              <input
                type="file"
                name="image"
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                className="border border-[var(--color-line)] bg-white px-3 py-2 text-[var(--color-ink)] outline-none focus:border-[var(--color-terracotta)] file:mr-3 file:rounded-none file:border file:border-[var(--color-line)] file:bg-[var(--color-ivory)] file:px-3 file:py-1 file:text-xs file:text-[var(--color-ink-soft)]"
              />
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-ink-soft)]">
              <input
                type="checkbox"
                name="is_published"
                defaultChecked={photo.is_published}
                className="size-4 accent-[var(--color-terracotta)]"
              />
              공개 (방문자 갤러리에 표시)
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="bg-[var(--color-terracotta)] px-4 py-2 text-sm font-semibold text-[var(--color-ivory)]"
              >
                저장
              </button>
              <Link
                href="/admin/gallery/photos"
                className="border border-[var(--color-line)] bg-white px-4 py-2 text-sm text-[var(--color-ink)]"
              >
                목록으로
              </Link>
            </div>
          </form>
        </article>
      </div>
    </section>
  );
}
