import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  parseCommunityAttachmentsFromDb,
  type CommunityAttachmentDisplay,
} from "../../lib/community-attachments";
import { getSupabaseAdminClient } from "../../lib/supabase/server";

type CommunityPostDetail = {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  view_count: number | null;
  attachments: unknown;
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** URL 의 id 파라미터를 안전하게 숫자로 변환 (실패 시 null) */
function parsePostId(rawId: string): number | null {
  const parsed = Number.parseInt(rawId, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return null;
  return parsed;
}

/** 게시글 단건 조회. 비공개/존재하지 않음/Supabase 미설정은 모두 null 로 통일 */
async function getCommunityPostById(postId: number): Promise<CommunityPostDetail | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("community_posts")
    .select("id, title, content, created_at, updated_at, view_count, attachments")
    .eq("id", postId)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !data) return null;
  return data as CommunityPostDetail;
}

/** 조회수 원자적 증가. 실패해도 페이지는 정상 렌더링되도록 에러 무시 */
async function incrementViewCount(postId: number): Promise<void> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return;

  try {
    await supabase.rpc("increment_community_post_view", { p_post_id: postId });
  } catch {
    // 카운트 누락이 페이지 렌더링을 막지 않도록 swallow
  }
}

/** 작성일을 한국어 표기로 포맷 */
function formatDate(value: string): string {
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

/** 첨부파일 크기를 사람이 읽기 좋은 단위로 변환 */
function formatFileSize(size?: number): string | null {
  if (!size || size <= 0) return null;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id: rawId } = await params;
  const postId = parsePostId(rawId);
  if (postId === null) {
    return { title: "게시글을 찾을 수 없습니다" };
  }

  const post = await getCommunityPostById(postId);
  if (!post) {
    return { title: "게시글을 찾을 수 없습니다" };
  }

  return {
    title: `${post.title} · 커뮤니티`,
    description: post.content.slice(0, 120),
  };
}

export default async function CommunityPostDetailPage({ params, searchParams }: PageProps) {
  const { id: rawId } = await params;
  await searchParams;

  const postId = parsePostId(rawId);
  if (postId === null) {
    notFound();
  }

  const post = await getCommunityPostById(postId);
  if (!post) {
    notFound();
  }

  // 조회수 증가는 결과를 기다리지 않고도 되지만, 표시 일관성을 위해 await 후 +1 한 값을 사용
  await incrementViewCount(postId);
  const displayedViewCount = (post.view_count ?? 0) + 1;

  const attachments: CommunityAttachmentDisplay[] = parseCommunityAttachmentsFromDb(
    post.attachments,
  );

  return (
    <section className="relative bg-[var(--color-ivory)] py-20 lg:py-28">
      <div className="mx-auto max-w-[860px] space-y-6 px-6 lg:px-10">
        {/* 페이지 헤더 */}
        <header>
          <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
            ─ Community · Post #{post.id}
          </p>
          <h1 className="mt-2 font-[var(--font-serif)] text-3xl font-medium leading-tight tracking-[-0.02em] text-[var(--color-ink)] md:text-4xl">
            {post.title}
          </h1>

          {/* 메타 정보: 작성일 · 조회수 · 첨부파일 수 */}
          <dl className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[var(--color-muted)]">
            <div className="flex items-center gap-1.5">
              <dt className="font-[var(--font-display)] uppercase tracking-[0.2em]">작성일</dt>
              <dd className="text-[var(--color-ink-soft)]">{formatDate(post.created_at)}</dd>
            </div>
            {post.updated_at !== post.created_at && (
              <div className="flex items-center gap-1.5">
                <dt className="font-[var(--font-display)] uppercase tracking-[0.2em]">수정일</dt>
                <dd className="text-[var(--color-ink-soft)]">{formatDate(post.updated_at)}</dd>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <dt className="font-[var(--font-display)] uppercase tracking-[0.2em]">조회수</dt>
              <dd className="text-[var(--color-ink-soft)]">{displayedViewCount.toLocaleString("ko-KR")}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="font-[var(--font-display)] uppercase tracking-[0.2em]">첨부파일</dt>
              <dd className="text-[var(--color-ink-soft)]">{attachments.length}건</dd>
            </div>
          </dl>
        </header>

        {/* 본문 */}
        <article className="border border-[var(--color-line)] bg-[var(--color-cream)] p-6 md:p-8">
          <div className="whitespace-pre-line text-[15px] leading-[1.9] text-[var(--color-ink)]">
            {post.content}
          </div>

          {/* 첨부파일 목록 */}
          {attachments.length > 0 && (
            <section className="mt-8 border-t border-[var(--color-line)] pt-6">
              <h2 className="mb-3 font-[var(--font-display)] text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                ─ Attachments
              </h2>
              <ul className="space-y-2">
                {attachments.map((file, index) => {
                  const fileName = file.name?.trim() || `첨부파일 ${index + 1}`;
                  const sizeLabel = formatFileSize(file.size);

                  return (
                    <li
                      key={`${file.url}-${index}`}
                      className="flex items-center justify-between gap-3 border border-[var(--color-line)] bg-[var(--color-ivory)] px-4 py-3 text-sm"
                    >
                      <div className="flex min-w-0 items-center gap-2 text-[var(--color-ink)]">
                        <PaperclipIcon />
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="truncate underline decoration-[var(--color-line)] underline-offset-2 hover:text-[var(--color-terracotta)]"
                        >
                          {fileName}
                        </a>
                      </div>
                      {sizeLabel && (
                        <span className="shrink-0 text-xs text-[var(--color-muted)]">{sizeLabel}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </article>

        {/* 하단 액션 */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Link
            href="/community"
            className="inline-flex items-center gap-2 border border-[var(--color-line)] bg-[var(--color-cream)] px-4 py-2 text-sm text-[var(--color-ink)] hover:border-[var(--color-terracotta)] hover:text-[var(--color-terracotta)]"
          >
            <ArrowLeftIcon />
            목록으로
          </Link>
          <p className="text-xs text-[var(--color-muted)]">
            관리자 수정은{" "}
            <Link href={`/admin/community/${post.id}/edit`} className="text-[var(--color-terracotta)] underline">
              /admin
            </Link>
            에서 가능합니다.
          </p>
        </div>
      </div>
    </section>
  );
}

/** 첨부파일 아이콘 (인라인 SVG) */
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

/** 좌측 화살표 아이콘 (인라인 SVG) */
function ArrowLeftIcon() {
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
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}
