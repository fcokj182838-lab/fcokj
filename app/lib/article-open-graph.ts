/**
 * 기사 URL에서 Open Graph 메타(제목·대표 이미지)를 추출합니다.
 * 뉴스 사이트마다 마크업이 달라 정규식으로 완벽하진 않으나, 대부분의 og:image / og:title 을 커버합니다.
 */

const FETCH_HTML_TIMEOUT_MS = 18_000;
const FETCH_IMAGE_TIMEOUT_MS = 20_000;

/** 로컬 공개 자산 — OG 이미지를 가져오지 못했을 때 썸네일 대체 */
export const PRESS_GALLERY_PLACEHOLDER_PATH = "/images/press-placeholder.svg";

function decodeHtmlEntities(raw: string): string {
  return raw
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/** HTML 스니펫에서 og:image 후보를 추출 */
function extractOgImageUrls(html: string): string[] {
  const out: string[] = [];
  const patterns: RegExp[] = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/gi,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/gi,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/gi,
  ];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    const r = new RegExp(re.source, re.flags);
    while ((m = r.exec(html)) !== null) {
      const u = m[1]?.trim();
      if (u) out.push(decodeHtmlEntities(u));
    }
  }
  return out;
}

function extractOgTitle(html: string): string | undefined {
  const m =
    html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i) ??
    html.match(/<meta[^>]+property=["']twitter:title["'][^>]+content=["']([^"']+)["']/i);
  const t = m?.[1]?.trim();
  return t ? decodeHtmlEntities(t) : undefined;
}

/** 상대 경로 이미지 URL을 절대 URL로 만듦 */
export function resolveUrlAgainstBase(relativeOrAbsolute: string, baseUrl: string): string {
  const trimmed = relativeOrAbsolute.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }
  try {
    return new URL(trimmed, baseUrl).href;
  } catch {
    return trimmed;
  }
}

export type ArticleOpenGraphResult = {
  title?: string;
  /** 추출된 이미지 URL (절대 경로) */
  imageUrls: string[];
};

/**
 * 기사 페이지 HTML을 받아 OG 메타를 파싱합니다.
 * @param html 원문 HTML
 * @param pageUrl 기사 페이지 URL (상대 경로 이미지 해석용)
 */
export function parseOpenGraphFromHtml(html: string, pageUrl: string): ArticleOpenGraphResult {
  const title = extractOgTitle(html);
  const rawImages = extractOgImageUrls(html);
  const imageUrls = [...new Set(rawImages.map((u) => resolveUrlAgainstBase(u, pageUrl)).filter(Boolean))];
  return { title, imageUrls };
}

/** 기사 URL에서 HTML을 가져와 OG 정보를 추출합니다 (실패 시 빈 결과). */
export async function fetchOpenGraphForArticleUrl(articleUrl: string): Promise<ArticleOpenGraphResult> {
  try {
    const res = await fetch(articleUrl, {
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_HTML_TIMEOUT_MS),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; fcokj-gallery/1.0; +https://fcokj.org) AppleWebKit/537.36 (KHTML, like Gecko)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
      },
    });
    if (!res.ok) {
      return { imageUrls: [] };
    }
    const html = await res.text();
    return parseOpenGraphFromHtml(html, articleUrl);
  } catch {
    return { imageUrls: [] };
  }
}

const ALLOWED_OG_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);

function extensionFromMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  if (mime === "image/avif") return "avif";
  return "jpg";
}

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export type FetchedOgImageBytes = {
  bytes: Uint8Array;
  contentType: string;
  extension: string;
};

/**
 * OG 이미지 URL에서 바이너리를 내려받습니다 (썸네일 Storage 업로드용).
 * 일부 언론사는 직접 링크를 차단하므로 실패할 수 있습니다.
 */
export async function downloadOgImageForUpload(imageUrl: string): Promise<FetchedOgImageBytes | null> {
  try {
    const res = await fetch(imageUrl, {
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_IMAGE_TIMEOUT_MS),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; fcokj-gallery/1.0) AppleWebKit/537.36 (KHTML, like Gecko)",
        Accept: "image/*,*/*;q=0.8",
      },
    });
    if (!res.ok) return null;
    const contentType = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    if (!ALLOWED_OG_MIME.has(contentType)) {
      return null;
    }
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.length === 0 || buf.length > MAX_IMAGE_BYTES) {
      return null;
    }
    const extension = extensionFromMime(contentType);
    return { bytes: buf, contentType, extension };
  } catch {
    return null;
  }
}
