import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminUser } from "../../../lib/require-admin";
import { createCommunityPostFromAdmin, logoutAdmin } from "../../actions";

export const metadata: Metadata = {
  title: "새 커뮤니티 글",
  description: "관리자용 커뮤니티 게시글 등록",
};

const noticeMap: Record<string, string> = {
  "error=invalid": "제목과 내용을 모두 입력해 주세요.",
  "error=insert": "등록 중 오류가 발생했습니다.",
};

export default async function AdminCommunityNewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminUser();
  const params = await searchParams;

  const queryEntries = Object.entries(params).flatMap(([key, value]) => {
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
              ─ New post
            </p>
            <h1 className="mt-2 font-[var(--font-serif)] text-3xl font-medium text-[var(--color-ink)] md:text-4xl">
              새 게시글
            </h1>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/admin/community" className="text-[var(--color-terracotta)] underline">
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
          <form action={createCommunityPostFromAdmin} className="grid gap-4">
            <label className="grid gap-1 text-sm">
              <span className="text-[var(--color-ink-soft)]">제목</span>
              <input
                type="text"
                name="title"
                required
                maxLength={500}
                className="border border-[var(--color-line)] bg-white px-3 py-2 text-[var(--color-ink)] outline-none focus:border-[var(--color-terracotta)]"
                placeholder="제목"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-[var(--color-ink-soft)]">내용</span>
              <textarea
                name="content"
                required
                rows={10}
                className="border border-[var(--color-line)] bg-white px-3 py-2 text-[var(--color-ink)] outline-none focus:border-[var(--color-terracotta)]"
                placeholder="내용"
              />
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-ink-soft)]">
              <input type="checkbox" name="is_published" defaultChecked className="size-4 accent-[var(--color-terracotta)]" />
              공개 (방문자 커뮤니티 페이지에 표시)
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="bg-[var(--color-terracotta)] px-4 py-2 text-sm font-semibold text-[var(--color-ivory)]"
              >
                등록
              </button>
              <Link
                href="/admin/community"
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
