/** DB site_popup_banners 한 행과 동일한 형태 */
export type SitePopupBannerRow = {
  id: number;
  /** 표시 순서(오름차순, 같으면 id 오름차순) */
  sort_order: number;
  is_enabled: boolean;
  title: string;
  body: string;
  image_url: string;
  link_url: string;
  updated_at: string;
  /** YYYY-MM-DD 또는 null — 게시 시작일(포함), null 이면 제한 없음 */
  publish_start_date: string | null;
  /** YYYY-MM-DD 또는 null — 게시 종료일(포함), null 이면 제한 없음 */
  publish_end_date: string | null;
};

/** 한국(Asia/Seoul) 기준 오늘 날짜를 YYYY-MM-DD 로 반환 */
export function getTodayDateStringKst(referenceDate: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(referenceDate);
}

/** 게시 기간 안이면 true — 날짜 미설정이면 항상 true */
export function isPopupBannerInPublishWindow(
  row: SitePopupBannerRow,
  referenceDate: Date = new Date(),
): boolean {
  const todayKst = getTodayDateStringKst(referenceDate);
  const start = (row.publish_start_date ?? "").trim();
  const end = (row.publish_end_date ?? "").trim();
  if (start.length > 0 && todayKst < start) return false;
  if (end.length > 0 && todayKst > end) return false;
  return true;
}

/** 팝업을 실제로 띄울지(켜짐 + 게시기간 + 내용 1개 이상) — 클라이언트에서도 동일 판단 */
export function isPopupBannerRenderable(row: SitePopupBannerRow | null): boolean {
  if (!row || !row.is_enabled) return false;
  if (!isPopupBannerInPublishWindow(row)) return false;
  return (
    row.title.trim().length > 0 ||
    row.body.trim().length > 0 ||
    row.image_url.trim().length > 0
  );
}
