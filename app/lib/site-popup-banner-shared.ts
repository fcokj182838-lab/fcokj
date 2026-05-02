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

/** DB/직렬화로 긴 ISO 가 들어와도 앞 10자만 써서 YYYY-MM-DD 로 비교(형식 깨지면 빈 문자열 = 미설정 취급) */
function toComparableYmd(value: string | null | undefined): string {
  const t = (value ?? "").trim();
  if (t.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(t)) return t.slice(0, 10);
  return "";
}

/** 게시 기간 안이면 true — 날짜 미설정이면 항상 true */
export function isPopupBannerInPublishWindow(
  row: SitePopupBannerRow,
  referenceDate: Date = new Date(),
): boolean {
  const todayKst = getTodayDateStringKst(referenceDate);
  const start = toComparableYmd(row.publish_start_date);
  const end = toComparableYmd(row.publish_end_date);
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
