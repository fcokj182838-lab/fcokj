import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminUser } from "../../../../lib/require-admin";
import { logoutAdmin, updateCommunityPostFromAdmin } from "../../../actions";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const noticeMap: Record<string, string> = {
  "error=invalid": "제목과 내용을 모두 입력해 주세요.",
  "error=update": "저장 중 오류가 발생했습니다.",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `게시글 수정 #${id}`,
    description: "관리자용 커뮤니티 게시글 수정",
  };
}

export default async function AdminCommunityEditPage({ params, searchParams }: PageProps) {
  const { supabaseAdmin } = await requireAdminUser();
  const { id: idParam } = await params;
  const sp = await searchParams;

  const postId = Number.parseInt(idParam, 10);
  if (!Number.isFinite(postId) || postId < 1) {
    notFound();
  }

  const { data: post, error } = await supabaseAdmin
    .from("community_posts")
    .select("id, title, content, is_published, created_at, updated_at")
    .eq("id", postId)
    .maybeSingle();

  if (error || !post) {
    notFound();
  }

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
              ─ Edit #{post.id}
            </p>
            <h1 className="mt-2 font-[var(--font-serif)] text-3xl font-medium text-[var(--color-ink)] md:text-4xl">
              게시글 수정
            </h1>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              작성 {new Date(post.created_at).toLocaleString("ko-KR")}
              {post.updated_at !== post.created_at && (
                <> · 수정 {new Date(post.updated_at).toLocaleString("ko-KR")}</>
              )}
            </p>
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
          <form action={updateCommunityPostFromAdmin} className="grid gap-4">
            <input type="hidden" name="id" value={String(post.id)} />
            <label className="grid gap-1 text-sm">
              <span className="text-[var(--color-ink-soft)]">제목</span>
              <input
                type="text"
                name="title"
                required
                maxLength={500}
                defaultValue={post.title}
                className="border border-[var(--color-line)] bg-white px-3 py-2 text-[var(--color-ink)] outline-none focus:border-[var(--color-terracotta)]"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-[var(--color-ink-soft)]">내용</span>
              <textarea
                name="content"
                required
                rows={10}
                defaultValue={post.content}
                className="border border-[var(--color-line)] bg-white px-3 py-2 text-[var(--color-ink)] outline-none focus:border-[var(--color-terracotta)]"
              />
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-ink-soft)]">
              <input
                type="checkbox"
                name="is_published"
                defaultChecked={post.is_published}
                className="size-4 accent-[var(--color-terracotta)]"
              />
              공개 (방문자 커뮤니티 페이지에 표시)
            </label>
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="bg-[var(--color-terracotta)] px-4 py-2 text-sm font-semibold text-[var(--color-ivory)]"
              >
                저장
              </button>
              <Link
                href="/admin/community"
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
