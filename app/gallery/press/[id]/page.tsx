import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSupabaseAdminClient } from "../../../lib/supabase/server";

type PressItemDetail = {
  id: number;
  title: string;
  description: string | null;
  image_url: string;
  article_url: string | null;
  taken_at: string | null;
  created_at: string;
  updated_at: string;
};

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parsePressId(rawId: string): number | null {
  const parsed = Number.parseInt(rawId, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return null;
  return parsed;
}

async function getPublishedPressById(id: number): Promise<PressItemDetail | null> {
  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("gallery_photos")
    .select("id, title, description, image_url, article_url, taken_at, created_at, updated_at")
    .eq("id", id)
    .eq("is_published", true)
    .eq("gallery_kind", "press")
    .maybeSingle();

  if (error || !data) return null;
  return data as PressItemDetail;
}

function formatDateOnly(value: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatDateTime(value: string): string {
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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id: rawId } = await params;
  const id = parsePressId(rawId);
  if (id === null) return { title: "자료를 찾을 수 없습니다" };

  const item = await getPublishedPressById(id);
  if (!item) return { title: "자료를 찾을 수 없습니다" };

  const desc =
    item.description && item.description.trim().length > 0
      ? item.description.trim().slice(0, 160)
      : `${item.title} · 언론 보도`;

  return {
    title: `${item.title} · 언론에 비친 법인`,
    description: desc,
  };
}

export default async function PressGalleryDetailPage({ params, searchParams }: PageProps) {
  const { id: rawId } = await params;
  await searchParams;

  const id = parsePressId(rawId);
  if (id === null) notFound();

  const item = await getPublishedPressById(id);
  if (!item) notFound();

  const articleHref = item.article_url?.trim() ?? "";
  if (articleHref.length > 0) {
    redirect(articleHref);
  }

  const takenLabel = formatDateOnly(item.taken_at);
  const createdLabel = formatDateTime(item.created_at);
  const updatedLabel = formatDateTime(item.updated_at);
  const showUpdated = item.updated_at !== item.created_at;

  return (
    <section className="relative bg-[var(--color-ivory)] py-20 lg:py-28">
      <div className="mx-auto max-w-[960px] space-y-8 px-6 lg:px-10">
        <header>
          <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
            ─ Gallery · Press #{item.id}
          </p>
          <h1 className="mt-2 font-[var(--font-serif)] text-3xl font-medium leading-tight tracking-[-0.02em] text-[var(--color-ink)] md:text-4xl">
            {item.title}
          </h1>

          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-xs text-[var(--color-muted)]">
            <div className="flex items-center gap-1.5">
              <dt className="font-[var(--font-display)] uppercase tracking-[0.2em]">일자</dt>
              <dd className="text-[var(--color-ink-soft)]">{takenLabel}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="font-[var(--font-display)] uppercase tracking-[0.2em]">등록</dt>
              <dd className="text-[var(--color-ink-soft)]">{createdLabel}</dd>
            </div>
            {showUpdated && (
              <div className="flex items-center gap-1.5">
                <dt className="font-[var(--font-display)] uppercase tracking-[0.2em]">수정</dt>
                <dd className="text-[var(--color-ink-soft)]">{updatedLabel}</dd>
              </div>
            )}
          </dl>
        </header>

        <article className="border border-[var(--color-line)] bg-[var(--color-cream)] p-4 md:p-8">
          <div className="relative mx-auto flex min-h-[200px] w-full max-w-4xl items-center justify-center bg-[var(--color-ivory)]">
            <Image
              src={item.image_url}
              alt={item.title}
              width={1600}
              height={1200}
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
              className="h-auto max-h-[min(85vh,900px)] w-full object-contain"
            />
          </div>

          {item.description && item.description.trim().length > 0 && (
            <div className="mt-8 border-t border-[var(--color-line)] pt-8">
              <h2 className="mb-3 font-[var(--font-display)] text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                ─ 설명
              </h2>
              <p className="whitespace-pre-line text-[15px] leading-[1.9] text-[var(--color-ink)]">
                {item.description}
              </p>
            </div>
          )}
        </article>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/gallery/press"
            className="inline-flex items-center gap-2 border border-[var(--color-line)] bg-[var(--color-cream)] px-4 py-2 text-sm text-[var(--color-ink)] hover:border-[var(--color-terracotta)] hover:text-[var(--color-terracotta)]"
          >
            ← 언론 보도 목록
          </Link>
          <p className="text-xs text-[var(--color-muted)]">
            수정은{" "}
            <Link href={`/admin/gallery/photos/${item.id}/edit`} className="text-[var(--color-terracotta)] underline">
              관리자
            </Link>
            에서 가능합니다.
          </p>
        </div>
      </div>
    </section>
  );
}
