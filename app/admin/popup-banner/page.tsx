import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminUser } from "../../lib/require-admin";
import { getSupabaseAdminClient } from "../../lib/supabase/server";
import { logoutAdmin } from "../actions";
import { createSitePopupBannerAction } from "../popup-banner-actions";
import { DeletePopupBannerButton } from "./delete-popup-banner-button";

export const metadata: Metadata = {
  title: "팝업 배너",
  description: "사이트 방문자용 팝업 배너 목록",
};

const noticeMap: Record<string, string> = {
  "deleted=1": "팝업 배너를 삭제했습니다.",
  "error=save": "저장·등록에 실패했습니다. 잠시 후 다시 시도해 주세요.",
  "error=delete": "삭제에 실패했습니다. 잠시 후 다시 시도해 주세요.",
  "error=config": "서버 설정(Supabase)을 확인해 주세요.",
  "error=invalid": "요청이 올바르지 않습니다.",
};

type PopupBannerListRow = {
  id: number;
  sort_order: number;
  is_enabled: boolean;
  title: string;
  publish_start_date: string | null;
  publish_end_date: string | null;
  updated_at: string;
};

function formatDateRange(start: string | null, end: string | null): string {
  const s = start?.trim() ?? "";
  const e = end?.trim() ?? "";
  if (!s && !e) return "—";
  if (s && e) return `${s} ~ ${e}`;
  if (s) return `${s} ~`;
  return `~ ${e}`;
}

export default async function AdminPopupBannerListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminUser();
  const sp = await searchParams;
  const supabaseAdmin = getSupabaseAdminClient();

  const queryEntries = Object.entries(sp).flatMap(([key, value]) => {
    if (!value) return [];
    return `${key}=${Array.isArray(value) ? value[0] : value}`;
  });
  const noticeMessage = queryEntries.map((query) => noticeMap[query]).find(Boolean);

  let rows: PopupBannerListRow[] = [];
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("site_popup_banners")
      .select("id, sort_order, is_enabled, title, publish_start_date, publish_end_date, updated_at")
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });
    if (!error && data) {
      rows = data.map((r) => ({
        id: typeof r.id === "number" ? r.id : Number(r.id),
        sort_order: typeof r.sort_order === "number" ? r.sort_order : 0,
        is_enabled: Boolean(r.is_enabled),
        title: typeof r.title === "string" ? r.title : "",
        publish_start_date: typeof r.publish_start_date === "string" ? r.publish_start_date : null,
        publish_end_date: typeof r.publish_end_date === "string" ? r.publish_end_date : null,
        updated_at: typeof r.updated_at === "string" ? r.updated_at : "",
      }));
    }
  }

  return (
    <section className="relative bg-[var(--color-ivory)] py-12 lg:py-16">
      <div className="mx-auto max-w-[960px] space-y-6 px-6 lg:px-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              ─ Site
            </p>
            <h1 className="mt-2 font-[var(--font-serif)] text-3xl font-medium text-[var(--color-ink)] md:text-4xl">
              팝업 배너
            </h1>
            <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
              여러 개를 등록할 수 있습니다. 숫자가 작을수록 먼저 표시됩니다. 「오늘 하루 보지 않기」로 닫은 뒤에는 같은
              날(한국)에 다음 순서 팝업이 이어서 뜹니다. 방문자 화면에서 팝업 카드 최대 너비는 약{" "}
              <strong className="font-medium text-[var(--color-ink)]">512px</strong>, 이미지는 세로 최대 약{" "}
              <strong className="font-medium text-[var(--color-ink)]">208px</strong> 안에서 비율을 유지해 보입니다. 자세한
              권장 해상도는 각 팝업 「편집」에서 확인하세요.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {supabaseAdmin ? (
              <form action={createSitePopupBannerAction}>
                <button
                  type="submit"
                  className="border border-[var(--color-terracotta)] bg-[var(--color-terracotta)] px-3 py-1.5 text-sm font-semibold text-[var(--color-ivory)]"
                >
                  팝업 추가
                </button>
              </form>
            ) : null}
            <Link href="/admin" className="text-[var(--color-terracotta)] underline">
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

        {!supabaseAdmin && (
          <p className="border-l-2 border-[var(--color-terracotta)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-ink-soft)]">
            Supabase 관리자 키가 없어 목록을 불러오거나 추가할 수 없습니다.
          </p>
        )}

        <details className="rounded-sm border border-[var(--color-line)] bg-white/70 px-4 py-3 text-sm text-[var(--color-ink-soft)]">
          <summary className="cursor-pointer font-medium text-[var(--color-ink)]">
            방문 사이트에서 팝업이 안 보일 때
          </summary>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs leading-relaxed">
            <li>
              <strong className="text-[var(--color-ink)]">「오늘 하루 보지 않기」</strong> 또는{" "}
              <strong className="text-[var(--color-ink)]">「자세히 보기」</strong>를 누른 날(한국 날짜)에는,{" "}
              <strong className="text-[var(--color-ink)]">새로고침해도</strong> 같은 공지는 브라우저에 저장되어 다시 안
              뜹니다. 내일(한국 자정 이후)이 되거나, 관리자가 해당 팝업을 저장해 내용이 바뀌면(`updated_at` 변경) 다시
              표시됩니다.
            </li>
            <li>
              <strong className="text-[var(--color-ink)]">「닫기」</strong>·배경 클릭·Esc만 쓴 경우에는 새로고침 후
              다시 나올 수 있습니다(탭 안에서만 건너뜀).
            </li>
            <li>
              관리자 설정: <strong className="text-[var(--color-ink)]">팝업 사용</strong> 켜짐, 제목·본문·이미지 중 하나
              이상, <strong className="text-[var(--color-ink)]">게시 기간</strong>이 오늘(한국)을 포함하는지 확인하세요.
            </li>
            <li>
              테스트용으로 숨김만 지우려면 브라우저 개발자 도구 → Application → Local Storage에서 키{" "}
              <code className="rounded bg-[var(--color-cream)] px-1 text-[11px]">fcokj_popup_banner_dismiss_map</code>{" "}
              항목을 삭제하세요.
            </li>
          </ul>
        </details>

        <article className="overflow-x-auto border border-[var(--color-line)] bg-[var(--color-cream)]">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-line)] bg-white/80 text-[var(--color-ink-soft)]">
                <th className="px-3 py-2 font-medium">순서</th>
                <th className="px-3 py-2 font-medium">사용</th>
                <th className="px-3 py-2 font-medium">제목</th>
                <th className="px-3 py-2 font-medium">게시 기간</th>
                <th className="px-3 py-2 font-medium">수정일</th>
                <th className="px-3 py-2 font-medium">관리</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-[var(--color-muted)]">
                    등록된 팝업이 없습니다. 「팝업 추가」로 새로 만드세요.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--color-line)] last:border-b-0">
                    <td className="px-3 py-2 tabular-nums text-[var(--color-ink)]">{row.sort_order}</td>
                    <td className="px-3 py-2 text-[var(--color-ink)]">{row.is_enabled ? "예" : "아니오"}</td>
                    <td className="max-w-[220px] px-3 py-2">
                      <span className="line-clamp-2 text-[var(--color-ink)]">
                        {row.title.trim() ? row.title : "(제목 없음)"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-[var(--color-ink-soft)]">
                      {formatDateRange(row.publish_start_date, row.publish_end_date)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-[var(--color-ink-soft)]">
                      {row.updated_at ? new Date(row.updated_at).toLocaleString("ko-KR") : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/popup-banner/${row.id}/edit`}
                          className="text-[var(--color-terracotta)] underline"
                        >
                          편집
                        </Link>
                        {supabaseAdmin ? <DeletePopupBannerButton bannerId={row.id} /> : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </article>
      </div>
    </section>
  );
}
