/**
 * community_posts.attachments(jsonb) 를 공개 페이지에서 안전하게 표시하기 위한 파서.
 * PostgREST/드라이버에 따라 배열이 JSON 문자열로 올 수 있고,
 * 레거시(Firebase 등) 필드명은 downloadURL·link 일 수 있음.
 */

export type CommunityAttachmentDisplay = {
  name?: string;
  url: string;
  size?: number;
};

/** 레코드에서 문자열 URL 후보만 추출 */
function pickUrlFromRecord(record: Record<string, unknown>): string {
  const candidates = ["url", "downloadURL", "downloadUrl", "link"] as const;
  for (const key of candidates) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return "";
}

/**
 * DB에서 읽은 attachments 컬럼(raw) → 표시용 배열.
 * - jsonb 배열 / JSON 문자열 / 단일 객체(잘못 저장된 경우) 처리
 * - url 이 없으면 해당 항목은 제외(다운로드 불가)
 */
export function parseCommunityAttachmentsFromDb(raw: unknown): CommunityAttachmentDisplay[] {
  let list: unknown[] = [];

  if (Array.isArray(raw)) {
    list = raw;
  } else if (typeof raw === "string") {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        list = parsed;
      } else if (parsed && typeof parsed === "object") {
        list = [parsed];
      }
    } catch {
      return [];
    }
  } else if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    list = [raw];
  } else {
    return [];
  }

  const result: CommunityAttachmentDisplay[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const url = pickUrlFromRecord(record);
    if (!url) continue;

    const nameRaw = record.name;
    const name = typeof nameRaw === "string" && nameRaw.trim() ? nameRaw.trim() : undefined;

    const sizeRaw = record.size;
    const size =
      typeof sizeRaw === "number" && Number.isFinite(sizeRaw) && sizeRaw >= 0 ? sizeRaw : undefined;

    result.push({ name, url, size });
  }

  return result;
}
