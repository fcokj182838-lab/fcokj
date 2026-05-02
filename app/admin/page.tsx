import type { Metadata } from "next";
import Link from "next/link";
import { getSupabaseAdminClient } from "../lib/supabase/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../lib/supabase/ssr";
import { logoutAdmin } from "./actions";

export const metadata: Metadata = {
  title: "관리자 대시보드",
  description: "사단법인 외국인과 동행 관리자 전용 대시보드입니다.",
};

const noticeMap: Record<string, string> = {
  "login=1": "관리자 로그인에 성공했습니다.",
  "logout=1": "로그아웃되었습니다.",
  "created=1": "게시글이 등록되었습니다.",
  "error=invalid": "제목과 내용을 모두 입력해 주세요.",
  "error=insert": "저장 중 오류가 발생했습니다.",
};

async function getDashboardSummary() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return {
      hasConfig: false,
      totalPosts: 0,
      totalPhotos: 0,
      latestPosts: [] as { id: number; title: string; created_at: string }[],
    };
  }

  const [{ count: postsCount }, { data: latestPosts }, { count: photosCount }] = await Promise.all([
    supabase.from("community_posts").select("*", { count: "exact", head: true }),
    supabase
      .from("community_posts")
      .select("id, title, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("gallery_photos").select("*", { count: "exact", head: true }),
  ]);

  return {
    hasConfig: true,
    totalPosts: postsCount ?? 0,
    totalPhotos: photosCount ?? 0,
    latestPosts: (latestPosts ?? []) as { id: number; title: string; created_at: string }[],
  };
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/admin/login?error=config");
  }

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) {
    redirect("/admin/login");
  }

  const supabaseAdmin = getSupabaseAdminClient();
  if (!supabaseAdmin) {
    redirect("/admin/login?error=config");
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "admin") {
    redirect("/admin/login?error=forbidden");
  }

  const summary = await getDashboardSummary();

  const queryEntries = Object.entries(params).flatMap(([key, value]) => {
    if (!value) return [];
    return `${key}=${Array.isArray(value) ? value[0] : value}`;
  });
  const noticeMessage = queryEntries.map((query) => noticeMap[query]).find(Boolean);

  return (
    <section className="relative bg-[var(--color-ivory)] py-20 lg:py-28">
      <div className="mx-auto max-w-[1000px] space-y-6 px-6 lg:px-10">
        <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
          ─ Admin
        </p>
        <h1 className="font-[var(--font-serif)] text-4xl font-medium tracking-[-0.02em] text-[var(--color-ink)] md:text-6xl">
          관리자 대시보드
        </h1>

        {noticeMessage && (
          <p className="border-l-2 border-[var(--color-terracotta)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-ink-soft)]">
            {noticeMessage}
          </p>
        )}

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border border-[var(--color-line)] bg-[var(--color-cream)] p-4">
            <p className="text-sm text-[var(--color-ink-soft)]">로그인 상태: 관리자</p>
            <form action={logoutAdmin}>
              <button type="submit" className="text-sm text-[var(--color-terracotta)] underline">
                로그아웃
              </button>
            </form>
          </div>

          {!summary.hasConfig && (
            <p className="border-l-2 border-[var(--color-terracotta)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-ink-soft)]">
              Supabase 환경변수가 없어 통계 데이터를 불러올 수 없습니다.
            </p>
          )}

          {summary.hasConfig && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <article className="border border-[var(--color-line)] bg-[var(--color-cream)] p-5">
                <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                  Community Posts
                </p>
                <p className="mt-2 font-[var(--font-display)] text-4xl text-[var(--color-ink)]">
                  {summary.totalPosts}
                </p>
                <Link
                  href="/admin/community"
                  className="mt-4 inline-block text-sm font-medium text-[var(--color-terracotta)] underline"
                >
                  커뮤니티 게시글 관리 →
                </Link>
              </article>
              <article className="border border-[var(--color-line)] bg-[var(--color-cream)] p-5">
                <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                  Gallery Photos
                </p>
                <p className="mt-2 font-[var(--font-display)] text-4xl text-[var(--color-ink)]">
                  {summary.totalPhotos}
                </p>
                <Link
                  href="/admin/gallery/photos"
                  className="mt-4 inline-block text-sm font-medium text-[var(--color-terracotta)] underline"
                >
                  활동사진 관리 →
                </Link>
              </article>
              <article className="border border-[var(--color-line)] bg-[var(--color-cream)] p-5">
                <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                  Quick Links
                </p>
                <div className="mt-3 flex flex-col gap-2 text-sm">
                  <Link href="/admin/community/new" className="text-[var(--color-terracotta)] underline">
                    새 커뮤니티 글 작성
                  </Link>
                  <Link href="/admin/gallery/photos/new" className="text-[var(--color-terracotta)] underline">
                    새 활동사진 등록
                  </Link>
                  <Link href="/gallery/photos" className="text-[var(--color-terracotta)] underline">
                    활동사진 페이지 (방문자 보기)
                  </Link>
                  <Link href="/community" className="text-[var(--color-ink-soft)] underline">
                    커뮤니티 페이지 (방문자 보기)
                  </Link>
                  <Link href="/admin/popup-banner" className="text-[var(--color-terracotta)] underline">
                    팝업 배너 설정
                  </Link>
                </div>
              </article>
            </div>
          )}

          {summary.hasConfig && (
            <article className="border border-[var(--color-line)] bg-[var(--color-cream)] p-5">
              <h2 className="font-[var(--font-serif)] text-2xl text-[var(--color-ink)]">최근 게시글</h2>
              <ul className="mt-4 space-y-2">
                {summary.latestPosts.length === 0 ? (
                  <li className="text-sm text-[var(--color-ink-soft)]">등록된 게시글이 없습니다.</li>
                ) : (
                  summary.latestPosts.map((post) => (
                    <li key={post.id} className="border-b border-[var(--color-line)] pb-2 text-sm">
                      <Link
                        href={`/admin/community/${post.id}/edit`}
                        className="text-[var(--color-ink)] underline decoration-[var(--color-line)] underline-offset-2 hover:text-[var(--color-terracotta)]"
                      >
                        {post.title}
                      </Link>
                      <p className="text-xs text-[var(--color-muted)]">
                        {new Date(post.created_at).toLocaleString("ko-KR")}
                      </p>
                    </li>
                  ))
                )}
              </ul>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
