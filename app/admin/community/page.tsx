import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminUser } from "../../lib/require-admin";
import { logoutAdmin } from "../actions";
import { DeleteCommunityPostButton } from "./delete-post-button";

export const metadata: Metadata = {
  title: "커뮤니티 게시글 관리",
  description: "관리자용 커뮤니티 게시글 목록 및 관리",
};

/** 목록 한 페이지당 게시글 수 */
const POSTS_PER_PAGE = 20;

const noticeMap: Record<string, string> = {
  "created=1": "게시글이 등록되었습니다.",
  "updated=1": "게시글이 저장되었습니다.",
  "deleted=1": "게시글이 삭제되었습니다.",
  "error=invalid": "요청이 올바르지 않습니다.",
  "error=insert": "등록 중 오류가 발생했습니다.",
  "error=update": "저장 중 오류가 발생했습니다.",
  "error=delete": "삭제 중 오류가 발생했습니다.",
};

/** URL 의 page 쿼리를 1 이상의 정수로 파싱 (없거나 잘못되면 1) */
function parseListPage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number.parseInt(value ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

/** 페이지 링크용 쿼리스트링 (page 외 기존 파라미터 유지, 알림용 created=1 등) */
function buildCommunityListHref(
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
  return query ? `/admin/community?${query}` : "/admin/community";
}

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

  // 전체 건수 → 현재 페이지 클램프 후 구간 조회
  const { count: totalCount, error: countError } = await supabaseAdmin
    .from("community_posts")
    .select("*", { count: "exact", head: true });

  const total = totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE));
  const currentPage = Math.min(parseListPage(params.page), totalPages);
  const rangeFrom = (currentPage - 1) * POSTS_PER_PAGE;
  const rangeTo = rangeFrom + POSTS_PER_PAGE - 1;

  const { data, error } = await supabaseAdmin
    .from("community_posts")
    .select("id, title, is_published, created_at")
    .order("created_at", { ascending: false })
    .range(rangeFrom, rangeTo);

  const posts = (error ? [] : data ?? []) as CommunityPostRow[];
  const listError = countError ?? error;

  // 알림 쿼리(예: created=1) — flatMap 에 문자열을 넣으면 글자 단위로 깨지므로 배열로 조합
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
      <div className="mx-auto max-w-[1100px] space-y-6 px-6 lg:px-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              ─ Admin · Community
            </p>
            <h1 className="mt-2 font-[var(--font-serif)] text-3xl font-medium tracking-[-0.02em] text-[var(--color-ink)] md:text-5xl">
              커뮤니티 게시글
            </h1>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              전체 글 조회 · 등록 · 수정 · 삭제
              {total > 0 && (
                <span className="ml-1 text-[var(--color-ink-soft)]">
                  (총 {total.toLocaleString("ko-KR")}건, 페이지당 {POSTS_PER_PAGE}건)
                </span>
              )}
            </p>
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

        {listError && (
          <p className="border-l-2 border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
            게시글을 불러오지 못했습니다. Supabase 테이블·환경변수를 확인해 주세요.
          </p>
        )}

        <div className="overflow-x-auto border border-[var(--color-line)] bg-[var(--color-cream)]">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line)] bg-[var(--color-ivory)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
                <th className="w-16 whitespace-nowrap px-3 py-3 text-center font-medium">번호</th>
                <th className="px-4 py-3 font-medium">제목</th>
                <th className="px-4 py-3 font-medium">공개</th>
                <th className="px-4 py-3 font-medium">작성일</th>
                <th className="px-4 py-3 font-medium">관리</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-[var(--color-ink-soft)]">
                    등록된 게시글이 없습니다.
                  </td>
                </tr>
              ) : (
                posts.map((post, rowIndex) => (
                  <tr key={post.id} className="border-b border-[var(--color-line)] last:border-b-0">
                    {/* 목록 역순 번호: 최신 글이 가장 큰 번호 (작성일 내림차순과 동일) */}
                    <td className="whitespace-nowrap px-3 py-3 text-center tabular-nums text-[var(--color-muted)]">
                      {(total - rangeFrom - rowIndex).toLocaleString("ko-KR")}
                    </td>
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

        {/* 페이지네이션: 20건 단위 */}
        {total > 0 && totalPages > 1 && (
          <nav
            className="flex flex-wrap items-center justify-between gap-3 border border-[var(--color-line)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-ink)]"
            aria-label="게시글 목록 페이지"
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
                  href={buildCommunityListHref(currentPage - 1, params)}
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
                  href={buildCommunityListHref(currentPage + 1, params)}
                  className="border border-[var(--color-line)] bg-[var(--color-ivory)] px-3 py-1 hover:border-[var(--color-terracotta)] hover:text-[var(--color-terracotta)]"
                >
                  다음
                </Link>
              )}
            </div>
          </nav>
        )}

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
