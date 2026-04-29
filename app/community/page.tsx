import type { Metadata } from "next";
import { getSupabaseAdminClient } from "../lib/supabase/server";
import Link from "next/link";

export const metadata: Metadata = {
  title: "커뮤니티",
  description: "사단법인 외국인과 동행 커뮤니티 게시글 목록입니다.",
};

type CommunityPost = {
  id: number;
  title: string;
  content: string;
  created_at: string;
};

async function getCommunityPosts() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return { posts: [] as CommunityPost[], hasConfig: false };
  }

  const { data, error } = await supabase
    .from("community_posts")
    .select("id, title, content, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !data) {
    return { posts: [] as CommunityPost[], hasConfig: true };
  }

  return { posts: data as CommunityPost[], hasConfig: true };
}

export default async function CommunityPage({
  searchParams: _searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { posts, hasConfig } = await getCommunityPosts();
  await _searchParams;

  return (
    <section className="relative bg-[var(--color-ivory)] py-20 lg:py-28">
      <div className="mx-auto max-w-[1100px] space-y-8 px-6 lg:px-10">
        <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
          ─ Community
        </p>
        <h1 className="mt-4 font-[var(--font-serif)] text-4xl font-medium tracking-[-0.02em] text-[var(--color-ink)] md:text-6xl">
          커뮤니티
        </h1>

        {!hasConfig && (
          <p className="border-l-2 border-[var(--color-terracotta)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-ink-soft)]">
            Supabase 환경변수가 설정되지 않아 게시글을 불러올 수 없습니다.
          </p>
        )}

        <p className="text-sm text-[var(--color-muted)]">
          이 페이지는 읽기 전용입니다. 관리자 글쓰기/수정은{" "}
          <Link href="/admin" className="text-[var(--color-terracotta)] underline">
            /admin
          </Link>
          에서 가능합니다.
        </p>

        <div className="space-y-4">
          {posts.length === 0 ? (
            <p className="text-[15px] leading-[1.9] text-[var(--color-ink-soft)]">
              아직 등록된 커뮤니티 글이 없습니다.
            </p>
          ) : (
            posts.map((post) => (
              <article
                key={post.id}
                className="border border-[var(--color-line)] bg-[var(--color-cream)] p-5"
              >
                <h2 className="font-[var(--font-serif)] text-2xl text-[var(--color-ink)]">{post.title}</h2>
                <p className="mt-2 text-xs text-[var(--color-muted)]">
                  {new Date(post.created_at).toLocaleString("ko-KR")}
                </p>
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-[var(--color-ink-soft)]">
                  {post.content}
                </p>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
