import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdminUser } from "../../../../lib/require-admin";
import { getSupabaseAdminClient } from "../../../../lib/supabase/server";
import { FormSubmitButton } from "../../../community/form-submit-button";
import { logoutAdmin } from "../../../actions";
import { updateSitePopupBannerFromAdmin } from "../../../popup-banner-actions";
import { DeletePopupBannerButton } from "../../delete-popup-banner-button";

const noticeMap: Record<string, string> = {
  "saved=1": "팝업 배너 설정을 저장했습니다.",
  "error=save": "저장에 실패했습니다. 잠시 후 다시 시도해 주세요.",
  "error=config": "서버 설정(Supabase)을 확인해 주세요.",
  "error=upload":
    "이미지 업로드에 실패했습니다. 형식(JPEG·PNG·WebP·AVIF·GIF)·용량(8MB 이하)을 확인한 뒤 다시 시도해 주세요.",
  "error=dates": "게시 시작일이 종료일보다 늦을 수 없습니다. 날짜를 확인해 주세요.",
};

function toDateInput(value: unknown): string {
  if (value == null) return "";
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (trimmed.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }
  return "";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `팝업 배너 #${id}`,
    description: "팝업 배너 편집",
  };
}

export default async function AdminPopupBannerEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminUser();
  const { id: idParam } = await params;
  const bannerId = Number.parseInt(idParam, 10);
  if (!Number.isFinite(bannerId) || bannerId < 1) {
    notFound();
  }

  const sp = await searchParams;
  const supabaseAdmin = getSupabaseAdminClient();

  const queryEntries = Object.entries(sp).flatMap(([key, value]) => {
    if (!value) return [];
    return `${key}=${Array.isArray(value) ? value[0] : value}`;
  });
  const noticeMessage = queryEntries.map((query) => noticeMap[query]).find(Boolean);

  if (!supabaseAdmin) {
    return (
      <section className="relative bg-[var(--color-ivory)] py-12 lg:py-16">
        <div className="mx-auto max-w-[720px] px-6 lg:px-10">
          <p className="text-sm text-[var(--color-ink-soft)]">Supabase 관리자 키가 없어 편집할 수 없습니다.</p>
        </div>
      </section>
    );
  }

  const { data, error } = await supabaseAdmin
    .from("site_popup_banners")
    .select(
      "id, sort_order, is_enabled, title, body, image_url, link_url, updated_at, publish_start_date, publish_end_date",
    )
    .eq("id", bannerId)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const row = {
    id: typeof data.id === "number" ? data.id : Number(data.id),
    sort_order: typeof data.sort_order === "number" ? data.sort_order : 0,
    is_enabled: Boolean(data.is_enabled),
    title: typeof data.title === "string" ? data.title : "",
    body: typeof data.body === "string" ? data.body : "",
    image_url: typeof data.image_url === "string" ? data.image_url : "",
    link_url: typeof data.link_url === "string" ? data.link_url : "",
    updated_at: typeof data.updated_at === "string" ? data.updated_at : "",
    publish_start_date: toDateInput(data.publish_start_date),
    publish_end_date: toDateInput(data.publish_end_date),
  };

  return (
    <section className="relative bg-[var(--color-ivory)] py-12 lg:py-16">
      <div className="mx-auto max-w-[720px] space-y-6 px-6 lg:px-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              ─ Site
            </p>
            <h1 className="mt-2 font-[var(--font-serif)] text-3xl font-medium text-[var(--color-ink)] md:text-4xl">
              팝업 배너 편집 <span className="text-[var(--color-ink-soft)]">#{row.id}</span>
            </h1>
            <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
              <Link href="/admin/popup-banner" className="text-[var(--color-terracotta)] underline">
                목록으로
              </Link>
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
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
          <form action={updateSitePopupBannerFromAdmin} className="grid gap-5">
            <input type="hidden" name="id" value={String(row.id)} />

            <label className="grid gap-1 text-sm">
              <span className="text-[var(--color-ink-soft)]">표시 순서</span>
              <input
                type="number"
                name="sort_order"
                defaultValue={row.sort_order}
                min={0}
                max={999999}
                className="max-w-[12rem] border border-[var(--color-line)] bg-white px-3 py-2 text-[var(--color-ink)] outline-none focus:border-[var(--color-terracotta)]"
              />
              <span className="text-xs text-[var(--color-muted)]">숫자가 작을수록 방문자에게 먼저 표시됩니다.</span>
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-ink-soft)]">
              <input
                type="checkbox"
                name="is_enabled"
                defaultChecked={row.is_enabled}
                className="size-4 accent-[var(--color-terracotta)]"
              />
              팝업 사용
            </label>

            <fieldset className="grid gap-3 rounded-sm border border-[var(--color-line)] bg-white/60 p-4 text-sm">
              <legend className="px-1 text-[var(--color-ink-soft)]">게시 기간 (선택)</legend>
              <p className="text-xs text-[var(--color-muted)]">
                비워 두면 기간 제한 없이 표시됩니다. 시작만 넣으면 그날부터, 종료만 넣으면 그날까지, 둘 다 넣으면 해당
                구간(한국 날짜 기준, 양 끝 포함)에만 방문자에게 보입니다.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1">
                  <span className="text-[var(--color-ink-soft)]">게시 시작일</span>
                  <input
                    type="date"
                    name="publish_start_date"
                    defaultValue={row.publish_start_date}
                    className="border border-[var(--color-line)] bg-white px-3 py-2 text-[var(--color-ink)] outline-none focus:border-[var(--color-terracotta)]"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-[var(--color-ink-soft)]">게시 종료일</span>
                  <input
                    type="date"
                    name="publish_end_date"
                    defaultValue={row.publish_end_date}
                    className="border border-[var(--color-line)] bg-white px-3 py-2 text-[var(--color-ink)] outline-none focus:border-[var(--color-terracotta)]"
                  />
                </label>
              </div>
            </fieldset>

            <label className="grid gap-1 text-sm">
              <span className="text-[var(--color-ink-soft)]">제목 (선택)</span>
              <input
                type="text"
                name="title"
                defaultValue={row.title}
                maxLength={200}
                className="border border-[var(--color-line)] bg-white px-3 py-2 text-[var(--color-ink)] outline-none focus:border-[var(--color-terracotta)]"
                placeholder="예: 안내"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-[var(--color-ink-soft)]">본문 (선택)</span>
              <textarea
                name="body"
                defaultValue={row.body}
                rows={8}
                maxLength={4000}
                className="border border-[var(--color-line)] bg-white px-3 py-2 text-[var(--color-ink)] outline-none focus:border-[var(--color-terracotta)]"
                placeholder="팝업에 표시할 안내 문구"
              />
            </label>

            <div className="grid gap-2 text-sm">
              <span className="text-[var(--color-ink-soft)]">이미지 첨부 (선택)</span>
              <input
                type="file"
                name="image_file"
                accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                className="max-w-full text-[var(--color-ink)] file:mr-3 file:border file:border-[var(--color-line)] file:bg-white file:px-3 file:py-1.5 file:text-sm file:text-[var(--color-ink)]"
              />
              <p className="text-xs text-[var(--color-muted)]">
                새 파일을 선택해 저장하면 스토리지에 올라가며, 아래 URL 입력보다 우선합니다. (최대 8MB)
              </p>
              {row.image_url ? (
                <div className="mt-1 grid gap-2">
                  <span className="text-xs text-[var(--color-muted)]">현재 저장된 이미지 미리보기</span>
                  <div className="inline-block max-w-full overflow-hidden rounded-sm border border-[var(--color-line)] bg-white p-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={row.image_url}
                      alt=""
                      className="max-h-48 max-w-full object-contain"
                      loading="lazy"
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <label className="grid gap-1 text-sm">
              <span className="text-[var(--color-ink-soft)]">이미지 URL (선택)</span>
              <input
                type="url"
                name="image_url"
                defaultValue={row.image_url}
                className="border border-[var(--color-line)] bg-white px-3 py-2 text-[var(--color-ink)] outline-none focus:border-[var(--color-terracotta)]"
                placeholder="https://… · 파일을 올리지 않을 때만 사용 (http/https)"
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-[var(--color-ink-soft)]">링크 URL (선택)</span>
              <input
                type="url"
                name="link_url"
                defaultValue={row.link_url}
                className="border border-[var(--color-line)] bg-white px-3 py-2 text-[var(--color-ink)] outline-none focus:border-[var(--color-terracotta)]"
                placeholder="https://…  · 「자세히 보기」버튼에 연결"
              />
            </label>

            <p className="text-xs text-[var(--color-muted)]">
              팝업을 켠 상태에서 제목·본문·이미지 중 하나 이상을 입력해야 방문자에게 표시됩니다. 게시 기간을 넣은 경우 그
              기간의 한국 날짜에만 표시됩니다. URL로 넣는 이미지·링크는 보안을 위해 http/https 만 허용됩니다.
            </p>

            {row.updated_at && (
              <p className="text-xs text-[var(--color-muted)]">
                마지막 반영: {new Date(row.updated_at).toLocaleString("ko-KR")}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <FormSubmitButton
                label="저장"
                pendingLabel="저장 중…"
                className="bg-[var(--color-terracotta)] px-4 py-2 text-sm font-semibold text-[var(--color-ivory)]"
              />
            </div>
          </form>

          <div className="mt-6 border-t border-[var(--color-line)] pt-4">
            <p className="mb-2 text-xs text-[var(--color-muted)]">이 팝업을 DB에서 삭제합니다.</p>
            <DeletePopupBannerButton bannerId={row.id} />
          </div>
        </article>
      </div>
    </section>
  );
}
