import { createSupabaseServerClient } from "./supabase/ssr";
import type { SitePopupBannerRow } from "./site-popup-banner-shared";
import { isPopupBannerRenderable } from "./site-popup-banner-shared";

export type { SitePopupBannerRow } from "./site-popup-banner-shared";
export { isPopupBannerRenderable } from "./site-popup-banner-shared";

/** DB에서 온 값을 Row 형태로 보정 */
function normalizePopupBannerRow(raw: Record<string, unknown>): SitePopupBannerRow {
  /** Postgres date / timestamptz 등 → YYYY-MM-DD 로 맞춤(문자열 비교·게시 기간 판정 안정화) */
  const dateOrNull = (value: unknown): string | null => {
    if (value == null) return null;
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    const ymd = trimmed.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(ymd) ? ymd : null;
  };

  const rawId = raw.id;
  const id =
    typeof rawId === "number" && Number.isFinite(rawId)
      ? rawId
      : typeof rawId === "string"
        ? Number.parseInt(rawId, 10)
        : NaN;

  const rawSort = raw.sort_order;
  const sort_order =
    typeof rawSort === "number" && Number.isFinite(rawSort)
      ? rawSort
      : typeof rawSort === "string"
        ? Number.parseInt(rawSort, 10)
        : 0;

  return {
    id: Number.isFinite(id) ? id : 0,
    sort_order: Number.isFinite(sort_order) ? sort_order : 0,
    is_enabled: Boolean(raw.is_enabled),
    title: typeof raw.title === "string" ? raw.title : "",
    body: typeof raw.body === "string" ? raw.body : "",
    image_url: typeof raw.image_url === "string" ? raw.image_url : "",
    link_url: typeof raw.link_url === "string" ? raw.link_url : "",
    updated_at: typeof raw.updated_at === "string" ? raw.updated_at : "",
    publish_start_date: dateOrNull(raw.publish_start_date),
    publish_end_date: dateOrNull(raw.publish_end_date),
  };
}

/**
 * 방문자·레이아웃용 — 표시 가능한 팝업만 sort_order·id 오름차순 배열로 반환.
 */
export async function getSitePopupBannersPublic(): Promise<SitePopupBannerRow[]> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("site_popup_banners")
    .select("id, sort_order, is_enabled, title, body, image_url, link_url, updated_at, publish_start_date, publish_end_date")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error || !data?.length) return [];

  const rows: SitePopupBannerRow[] = [];
  for (const item of data) {
    const row = normalizePopupBannerRow(item as Record<string, unknown>);
    if (!isPopupBannerRenderable(row)) continue;
    rows.push(row);
  }
  return rows;
}
