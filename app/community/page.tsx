import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseAdminClient } from "../lib/supabase/server";

export const metadata: Metadata = {
  title: "커뮤니티",
  description: "사단법인 외국인과 동행 커뮤니티 게시글 목록입니다.",
};

// 첨부파일 한 건의 메타데이터 (DB 의 attachments jsonb 배열 요소 형태)
type CommunityAttachment = {
  name?: string;
  url?: string;
  size?: number;
};

type CommunityPostRow = {
  id: number;
  title: string;
  created_at: string;
  view_count: number | null;
  attachments: CommunityAttachment[] | null;
};

type FetchResult = {
  posts: CommunityPostRow[];
  total: number;
  totalPages: number;
  currentPage: number;
  rangeFrom: number;
  hasConfig: boolean;
  hasError: boolean;
};

const PAGE_SIZE = 20;

/** URL 의 page 쿼리를 1 이상의 정수로 파싱 */
function parseListPage(raw: string | string[] | undefined): number {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const n = Number.parseInt(value ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

/** 페이지 링크 (page 외 쿼리 유지) */
function buildCommunityPageHref(
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
  return query ? `/community?${query}` : "/community";
}

/** 공개 글만 최신순 · 페이지당 PAGE_SIZE 건 */
async function getCommunityPostsPage(
  pageFromUrl: number,
): Promise<FetchResult> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return {
      posts: [],
      total: 0,
      totalPages: 1,
      currentPage: 1,
      rangeFrom: 0,
      hasConfig: false,
      hasError: false,
    };
  }

  const { count: totalCount, error: countError } = await supabase
    .from("community_posts")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true);

  if (countError) {
    return {
      posts: [],
      total: 0,
      totalPages: 1,
      currentPage: 1,
      rangeFrom: 0,
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
    .from("community_posts")
    .select("id, title, created_at, view_count, attachments")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .range(rangeFrom, rangeTo);

  if (error || !data) {
    return {
      posts: [],
      total,
      totalPages,
      currentPage,
      rangeFrom,
      hasConfig: true,
      hasError: true,
    };
  }

  return {
    posts: data as CommunityPostRow[],
    total,
    totalPages,
    currentPage,
    rangeFrom,
    hasConfig: true,
    hasError: false,
  };
}

/** 작성일을 "YYYY. M. D." 형태로 표시 */
function formatPostDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** 첨부파일 개수를 안전하게 추출 */
function getAttachmentCount(attachments: CommunityAttachment[] | null): number {
  if (!Array.isArray(attachments)) return 0;
  return attachments.length;
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { posts, total, totalPages, currentPage, rangeFrom, hasConfig, hasError } =
    await getCommunityPostsPage(parseListPage(params.page));

  return (
    <section className="relative bg-[var(--color-ivory)] py-20 lg:py-28">
      <div className="mx-auto max-w-[1100px] space-y-6 px-6 lg:px-10">
        {/* 페이지 헤더 */}
        <header>
          <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
            ─ Community
          </p>
          <h1 className="mt-2 font-[var(--font-serif)] text-3xl font-medium tracking-[-0.02em] text-[var(--color-ink)] md:text-5xl">
            커뮤니티 게시글
          </h1>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            전체 공개 글 목록 · 번호 · 제목 · 작성일 · 조회수 · 첨부파일
            {total > 0 && (
              <span className="ml-1 text-[var(--color-ink-soft)]">
                (총 {total.toLocaleString("ko-KR")}건, 페이지당 {PAGE_SIZE}건)
              </span>
            )}
          </p>
        </header>

        {!hasConfig && (
          <p className="border-l-2 border-[var(--color-terracotta)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-ink-soft)]">
            Supabase 환경변수가 설정되지 않아 게시글을 불러올 수 없습니다.
          </p>
        )}

        {hasError && (
          <p className="border-l-2 border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900">
            게시글을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
          </p>
        )}

        {/* 게시글 목록 표 */}
        <div className="overflow-x-auto border border-[var(--color-line)] bg-[var(--color-cream)]">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line)] bg-[var(--color-ivory)] text-xs uppercase tracking-wide text-[var(--color-muted)]">
                <th className="w-16 px-4 py-3 text-center font-medium">번호</th>
                <th className="px-4 py-3 font-medium">제목</th>
                <th className="w-40 px-4 py-3 font-medium">작성일</th>
                <th className="w-20 px-4 py-3 text-center font-medium">
                  조회수
                </th>
                <th className="w-24 px-4 py-3 text-center font-medium">
                  첨부파일
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-[var(--color-ink-soft)]"
                  >
                    아직 등록된 커뮤니티 글이 없습니다.
                  </td>
                </tr>
              ) : (
                // 최신글이 위이므로 번호는 전체 역순(페이지 경계 포함)
                posts.map((post, rowIndex) => {
                  const rowNumber = total - rangeFrom - rowIndex;
                  const attachmentCount = getAttachmentCount(post.attachments);
                  const viewCount = post.view_count ?? 0;

                  return (
                    <tr
                      key={post.id}
                      className="border-b border-[var(--color-line)] last:border-b-0 transition-colors hover:bg-[var(--color-ivory)]/60"
                    >
                      <td className="px-4 py-3 text-center tabular-nums text-[var(--color-muted)]">
                        {rowNumber.toLocaleString("ko-KR")}
                      </td>
                      <td className="max-w-[520px] px-4 py-3">
                        <Link
                          href={`/community/${post.id}`}
                          className="block truncate font-medium text-[var(--color-ink)] underline decoration-transparent underline-offset-2 transition-colors hover:text-[var(--color-terracotta)] hover:decoration-[var(--color-terracotta)]"
                        >
                          {post.title}
                        </Link>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-[var(--color-muted)]">
                        {formatPostDate(post.created_at)}
                      </td>
                      <td className="px-4 py-3 text-center text-[var(--color-ink-soft)]">
                        {viewCount.toLocaleString("ko-KR")}
                      </td>
                      <td className="px-4 py-3 text-center text-[var(--color-ink-soft)]">
                        {attachmentCount > 0 ? (
                          <span
                            className="inline-flex items-center gap-1 text-[var(--color-terracotta)]"
                            aria-label={`첨부파일 ${attachmentCount}개`}
                            title={`첨부파일 ${attachmentCount}개`}
                          >
                            <PaperclipIcon />
                            {attachmentCount}
                          </span>
                        ) : (
                          <span className="text-[var(--color-muted)]">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && totalPages > 1 && (
          <nav
            className="flex flex-wrap items-center justify-between gap-3 border border-[var(--color-line)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-ink)]"
            aria-label="커뮤니티 목록 페이지"
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
                  href={buildCommunityPageHref(currentPage - 1, params)}
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
                  href={buildCommunityPageHref(currentPage + 1, params)}
                  className="border border-[var(--color-line)] bg-[var(--color-ivory)] px-3 py-1 hover:border-[var(--color-terracotta)] hover:text-[var(--color-terracotta)]"
                >
                  다음
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </section>
  );
}

/** 첨부파일 아이콘 (간단한 인라인 SVG, 외부 의존성 없음) */
function PaperclipIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.49" />
    </svg>
  );
}
