import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { requireAdminUser } from "../../../lib/require-admin";
import { logoutAdmin } from "../../actions";
import { DeleteGalleryPhotoButton } from "./delete-photo-button";

export const metadata: Metadata = {
  title: "갤러리 사진 관리",
  description: "관리자용 갤러리 사진 목록 및 관리",
};

const noticeMap: Record<string, string> = {
  "created=1": "사진이 등록되었습니다.",
  "updated=1": "사진이 저장되었습니다.",
  "deleted=1": "사진이 삭제되었습니다.",
  "error=invalid": "요청이 올바르지 않습니다.",
  "error=insert": "등록 중 오류가 발생했습니다.",
  "error=update": "저장 중 오류가 발생했습니다.",
  "error=delete": "삭제 중 오류가 발생했습니다.",
  "error=upload": "이미지 업로드에 실패했습니다.",
};

/** ?bulk=N 다중 등록 완료 메시지 (기존 ?created=1 도 유지) */
function resolveGalleryNotice(
  params: Record<string, string | string[] | undefined>,
): string | undefined {
  const bulkRaw = params.bulk;
  const bulkStr = Array.isArray(bulkRaw) ? bulkRaw[0] : bulkRaw;
  if (bulkStr !== undefined && bulkStr !== "") {
    const n = Number.parseInt(String(bulkStr), 10);
    if (Number.isFinite(n) && n >= 1) {
      return n === 1 ? "사진이 등록되었습니다." : `${n}장의 사진이 등록되었습니다.`;
    }
  }

  const fromQuery = Object.entries(params)
    .map(([key, value]) => {
      if (value === undefined) return null;
      const v = Array.isArray(value) ? value[0] : value;
      if (!v) return null;
      return noticeMap[`${key}=${v}`] ?? null;
    })
    .find((msg): msg is string => typeof msg === "string");
  return fromQuery;
}

type GalleryPhotoRow = {
  id: number;
  title: string;
  image_url: string;
  taken_at: string | null;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  gallery_kind: string | null;
};

export default async function AdminGalleryPhotosListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabaseAdmin } = await requireAdminUser();
  const params = await searchParams;

  const { data, error } = await supabaseAdmin
    .from("gallery_photos")
    .select("id, title, image_url, taken_at, sort_order, is_published, created_at, gallery_kind")
    .order("sort_order", { ascending: false })
    .order("created_at", { ascending: false });

  const photos = (error ? [] : data ?? []) as GalleryPhotoRow[];

  const noticeMessage = resolveGalleryNotice(params);

  return (
    <section className="relative bg-[var(--color-ivory)] py-20 lg:py-28">
      <div className="mx-auto max-w-[1100px] space-y-6 px-6 lg:px-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              ─ Admin · Gallery
            </p>
            <h1 className="mt-2 font-[var(--font-serif)] text-3xl font-medium tracking-[-0.02em] text-[var(--color-ink)] md:text-5xl">
              갤러리 사진
            </h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              활동사진·언론 자료 등록 · 수정 · 삭제 (Supabase Storage)
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/gallery/photos/new"
              className="bg-[var(--color-terracotta)] px-4 py-2 text-sm font-semibold text-[var(--color-ivory)]"
            >
              새 활동사진
            </Link>
            <Link
              href="/admin/gallery/photos/new?kind=press"
              className="border border-[var(--color-terracotta)] bg-transparent px-4 py-2 text-sm font-semibold text-[var(--color-terracotta)]"
            >
              새 언론 자료
            </Link>
            <Link href="/admin" className="text-sm text-[var(--color-terracotta)] underline">
              대시보드
            </Link>
            <form action={logoutAdmin}>
              <button type="submit" className="text-sm text-[var(--color-ink-soft)] underline">
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

        {error && (
          <p className="border-l-2 border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
            사진을 불러오지 못했습니다. Supabase 테이블/마이그레이션 적용 여부를 확인해 주세요.
          </p>
        )}

        {photos.length === 0 ? (
          <div className="border border-dashed border-[var(--color-line)] bg-[var(--color-cream)] p-10 text-center text-sm text-[var(--color-ink-soft)]">
            등록된 사진이 없습니다. 우측 상단의 “새 사진 등록” 버튼으로 첫 사진을 올려보세요.
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <li
                key={photo.id}
                className="flex flex-col overflow-hidden border border-[var(--color-line)] bg-[var(--color-cream)]"
              >
                <Link
                  href={`/admin/gallery/photos/${photo.id}/edit`}
                  className="relative block aspect-[4/3] overflow-hidden bg-[var(--color-ivory)]"
                >
                  <Image
                    src={photo.image_url}
                    alt={photo.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </Link>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/admin/gallery/photos/${photo.id}/edit`}
                      className="font-[var(--font-serif)] text-lg leading-snug text-[var(--color-ink)] hover:text-[var(--color-terracotta)]"
                    >
                      {photo.title}
                    </Link>
                    <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                      {photo.gallery_kind === "press" && (
                        <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                          언론
                        </span>
                      )}
                      {photo.is_published ? (
                        <span className="rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                          공개
                        </span>
                      ) : (
                        <span className="rounded-full border border-[var(--color-line)] bg-[var(--color-ivory)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-muted)]">
                          비공개
                        </span>
                      )}
                    </div>
                  </div>
                  <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-muted)]">
                    <div className="flex gap-1">
                      <dt className="text-[var(--color-ink-soft)]">촬영일</dt>
                      <dd>{photo.taken_at ?? "-"}</dd>
                    </div>
                    <div className="flex gap-1">
                      <dt className="text-[var(--color-ink-soft)]">정렬</dt>
                      <dd>{photo.sort_order}</dd>
                    </div>
                    <div className="flex gap-1">
                      <dt className="text-[var(--color-ink-soft)]">등록</dt>
                      <dd>{new Date(photo.created_at).toLocaleDateString("ko-KR")}</dd>
                    </div>
                  </dl>
                  <div className="mt-auto flex items-center gap-3 pt-2">
                    <Link
                      href={`/admin/gallery/photos/${photo.id}/edit`}
                      className="text-xs text-[var(--color-terracotta)] underline"
                    >
                      수정
                    </Link>
                    <DeleteGalleryPhotoButton photoId={photo.id} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="text-xs text-[var(--color-muted)]">
          공개 항목만{" "}
          <Link href="/gallery/photos" className="text-[var(--color-terracotta)] underline">
            활동사진
          </Link>
          ·
          <Link href="/gallery/press" className="text-[var(--color-terracotta)] underline">
            언론
          </Link>
          페이지에 표시됩니다. (구분은 등록·수정에서 설정)
        </p>
      </div>
    </section>
  );
}
