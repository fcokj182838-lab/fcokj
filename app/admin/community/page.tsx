import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminUser } from "../../lib/require-admin";
import { logoutAdmin } from "../actions";
import { DeleteCommunityPostButton } from "./delete-post-button";

export const metadata: Metadata = {
  title: "커뮤니티 게시글 관리",
  description: "관리자용 커뮤니티 게시글 목록 및 관리",
};

const noticeMap: Record<string, string> = {
  "created=1": "게시글이 등록되었습니다.",
  "updated=1": "게시글이 저장되었습니다.",
  "deleted=1": "게시글이 삭제되었습니다.",
  "error=invalid": "요청이 올바르지 않습니다.",
  "error=insert": "등록 중 오류가 발생했습니다.",
  "error=update": "저장 중 오류가 발생했습니다.",
  "error=delete": "삭제 중 오류가 발생했습니다.",
};

type CommunityPostRow = {
  id: number;
  title: string;
  is_published: boolean;
  created_at: string;
};

export default async function AdminCommunityListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { supabaseAdmin } = await requireAdminUser();
  const params = await searchParams;

  const { data, error } = await supabaseAdmin
    .from("community_posts")
    .select("id, title, is_published, created_at")
    .order("created_at", { ascending: false });

  const posts = (error ? [] : data ?? []) as CommunityPostRow[];

  const queryEntries = Object.entries(params).flatMap(([key, value]) => {
    if (!value) return [];
    return `${key}=${Array.isArray(value) ? value[0] : value}`;
  });
  const noticeMessage = queryEntries.map((query) => noticeMap[query]).find(Boolean);

  return (
    <section className="relative bg-[var(--color-ivory)] py-20 lg:py-28">
      <div className="mx-auto max-w-[1100px] space-y-6 px-6 lg:px-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              ─ Admin · Community
            </p>
            <h1 className="mt-2 font-[var(--font-serif)] text-3xl font-medium tracking-[-0.02em] text-[var(--color-ink)] md:text-5xl">
              커뮤니티 게시글
            </h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">전체 글 조회 · 등록 · 수정 · 삭제</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/community/new"
              className="bg-[var(--color-terracotta)] px-4 py-2 text-sm font-semibold text-[var(--color-ivory)]"
            >
              새 글 작성
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
            게시글을 불러오지 못했습니다. Supabase 테이블·환경변수를 확인해 주세요.
          </p>
        )}

        <div className="overflow-x-auto border border-[var(--color-line)] bg-[var(--color-cream)]">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line)] bg-[var(--color-ivory)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
                <th className="px-4 py-3 font-medium">제목</th>
                <th className="px-4 py-3 font-medium">공개</th>
                <th className="px-4 py-3 font-medium">작성일</th>
                <th className="px-4 py-3 font-medium">관리</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-[var(--color-ink-soft)]">
                    등록된 게시글이 없습니다.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="border-b border-[var(--color-line)] last:border-b-0">
                    <td className="max-w-[320px] px-4 py-3">
                      <Link
                        href={`/admin/community/${post.id}/edit`}
                        className="font-medium text-[var(--color-ink)] underline decoration-[var(--color-line)] underline-offset-2 hover:text-[var(--color-terracotta)]"
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-ink-soft)]">
                      {post.is_published ? (
                        <span className="text-emerald-700">공개</span>
                      ) : (
                        <span className="text-[var(--color-muted)]">비공개</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[var(--color-muted)]">
                      {new Date(post.created_at).toLocaleString("ko-KR")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/community/${post.id}/edit`}
                          className="text-xs text-[var(--color-terracotta)] underline"
                        >
                          수정
                        </Link>
                        <DeleteCommunityPostButton postId={post.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-[var(--color-muted)]">
          공개 글만{" "}
          <Link href="/community" className="text-[var(--color-terracotta)] underline">
            커뮤니티
          </Link>
          에 표시됩니다.
        </p>
      </div>
    </section>
  );
}
