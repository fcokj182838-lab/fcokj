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

/** DB·스토리지에 저장되는 첨부 한 건 (관리자 업로드·수정 액션과 동일 형식) */
export type CommunityAttachmentRecord = {
  name: string;
  url: string;
  path: string;
  size: number;
  type?: string;
};

/**
 * 수정 시: path+url 이 있는 항목(스토리지 연동)과, path 없이 url 만 있는 레거시 항목을 분리한다.
 * 레거시는 스토리지 개별 삭제가 불가해 JSON 그대로 유지해 두고 배열 끝에 이어 붙인다.
 */
export function partitionCommunityAttachmentsForUpdate(raw: unknown): {
  withPath: CommunityAttachmentRecord[];
  legacyItems: unknown[];
} {
  if (!Array.isArray(raw)) {
    return { withPath: [], legacyItems: [] };
  }

  const withPath: CommunityAttachmentRecord[] = [];
  const legacyItems: unknown[] = [];

  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const path = typeof o.path === "string" && o.path.trim().length > 0 ? o.path.trim() : "";
    const url = typeof o.url === "string" && o.url.trim().length > 0 ? o.url.trim() : "";

    if (path && url) {
      const nameRaw = o.name;
      const name =
        typeof nameRaw === "string" && nameRaw.trim().length > 0 ? nameRaw.trim() : "첨부파일";
      const sizeRaw = o.size;
      const size =
        typeof sizeRaw === "number" && Number.isFinite(sizeRaw) && sizeRaw >= 0 ? sizeRaw : 0;
      const typeRaw = o.type;
      const type =
        typeof typeRaw === "string" && typeRaw.trim().length > 0 ? typeRaw.trim() : undefined;
      withPath.push({ path, url, name, size, type });
    } else if (url) {
      legacyItems.push(item);
    }
  }

  return { withPath, legacyItems };
}
