import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminUser } from "../../../../lib/require-admin";
import { logoutAdmin } from "../../../actions";
import { createGalleryPhotoFromAdmin } from "../../../photo-actions";
import { GalleryPhotoImageField } from "./gallery-photo-image-field";

export const metadata: Metadata = {
  title: "새 갤러리 사진",
  description: "관리자용 갤러리 사진 등록",
};

const noticeMap: Record<string, string> = {
  "error=invalid": "제목과 이미지 파일을 한 장 이상 선택해 주세요.",
  "error=too_many": "한 번에 올릴 수 있는 사진은 최대 30장입니다.",
  "error=upload": "이미지 업로드에 실패했습니다. (jpg/png/webp/avif/gif · 장당 8MB 이하)",
  "error=insert": "등록 중 오류가 발생했습니다.",
};

export default async function AdminGalleryPhotoNewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminUser();
  const params = await searchParams;

  const noticeMessage = Object.entries(params)
    .map(([key, value]) => {
      if (value === undefined) return null;
      const v = Array.isArray(value) ? value[0] : value;
      if (!v) return null;
      return noticeMap[`${key}=${v}`] ?? null;
    })
    .find(Boolean);

  return (
    <section className="relative bg-[var(--color-ivory)] py-20 lg:py-28">
      <div className="mx-auto max-w-[800px] space-y-6 px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              ─ New photo
            </p>
            <h1 className="mt-2 font-[var(--font-serif)] text-3xl font-medium text-[var(--color-ink)] md:text-4xl">
              새 사진 등록
            </h1>
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
          <form action={createGalleryPhotoFromAdmin} className="grid gap-4">
            <label className="grid gap-1 text-sm">
              <span className="text-[var(--color-ink-soft)]">제목 *</span>
              <input
                type="text"
                name="title"
                required
                maxLength={200}
                className="border border-[var(--color-line)] bg-white px-3 py-2 text-[var(--color-ink)] outline-none focus:border-[var(--color-terracotta)]"
                placeholder="예: 2026 봄 한국어 교실 수료식"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-[var(--color-ink-soft)]">설명</span>
              <textarea
                name="description"
                rows={4}
                maxLength={2000}
                className="border border-[var(--color-line)] bg-white px-3 py-2 text-[var(--color-ink)] outline-none focus:border-[var(--color-terracotta)]"
                placeholder="사진에 대한 간단한 설명 (선택)"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="grid gap-1 text-sm">
                <span className="text-[var(--color-ink-soft)]">촬영일</span>
                <input
                  type="date"
                  name="taken_at"
                  className="border border-[var(--color-line)] bg-white px-3 py-2 text-[var(--color-ink)] outline-none focus:border-[var(--color-terracotta)]"
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-[var(--color-ink-soft)]">
                  정렬 우선순위
                  <span className="ml-1 text-xs text-[var(--color-muted)]">(높을수록 위, 기본 0)</span>
                </span>
                <input
                  type="number"
                  name="sort_order"
                  defaultValue={0}
                  step={1}
                  className="border border-[var(--color-line)] bg-white px-3 py-2 text-[var(--color-ink)] outline-none focus:border-[var(--color-terracotta)]"
                />
              </label>
            </div>

            <div className="grid gap-1 text-sm">
              <span className="text-[var(--color-ink-soft)]">
                이미지 파일 * (여러 장 선택 가능)
                <span className="ml-1 text-xs text-[var(--color-muted)]">
                  jpg/png/webp/avif/gif · 장당 최대 8MB · 한 번에 최대 30장
                </span>
              </span>
              <GalleryPhotoImageField />
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-ink-soft)]">
              <input type="checkbox" name="is_published" defaultChecked className="size-4 accent-[var(--color-terracotta)]" />
              공개 (방문자 활동사진 페이지에 표시)
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="bg-[var(--color-terracotta)] px-4 py-2 text-sm font-semibold text-[var(--color-ivory)]"
              >
                등록
              </button>
              <Link
                href="/admin/gallery/photos"
                className="border border-[var(--color-line)] bg-white px-4 py-2 text-sm text-[var(--color-ink)]"
              >
                취소
              </Link>
            </div>
          </form>
        </article>
      </div>
    </section>
  );
}
