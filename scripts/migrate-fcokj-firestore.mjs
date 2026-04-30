#!/usr/bin/env node
/**
 * 구 fcokj.org (CRA + Firebase) 커뮤니티 데이터 → Supabase community_posts 마이그레이션
 *
 * 소스:
 *   - Firestore `notices`  → 구 사이트 /community1 (공지사항)
 *   - Firestore `activities` → 구 사이트 /community2 (사업·활동 소식)
 * 각 문서 필드: title, content, createdAt(ms), views, attachmentUrl (단일 이미지/PDF 등 Storage URL)
 *
 * 실행 (프로젝트 루트에서, .env 에 SUPABASE_URL · SUPABASE_SERVICE_ROLE_KEY 설정 후):
 *   node scripts/migrate-fcokj-firestore.mjs
 *   node scripts/migrate-fcokj-firestore.mjs --dry-run
 *   node scripts/migrate-fcokj-firestore.mjs --only notices
 *   node scripts/migrate-fcokj-firestore.mjs --only activities
 *   node scripts/migrate-fcokj-firestore.mjs --no-title-prefix
 *
 * 커뮤니티 전체 삭제 후 notices 만 다시 넣기 (기존 글·상태 초기화):
 *   node scripts/migrate-fcokj-firestore.mjs --only notices --delete-all-community-posts --yes
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// 구 Firebase 웹 앱에 포함된 공개 API 키 (Firestore REST 읽기용 · 번들과 동일)
const FIREBASE_WEB_API_KEY = "AIzaSyAhgssAg8NCFCeGvgyVTGZFQkiy8O3zAwc";
const GCP_PROJECT_ID = "fcokj-f02d2";
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${GCP_PROJECT_ID}/databases/(default)/documents`;

const ATTACHMENT_BUCKET = "community-attachments";
/** 관리자 게시글 업로드 한도와 동일하게 맞춤 (바이트) */
const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;

const BLOCKED_EXTENSIONS = new Set([
  "exe", "bat", "cmd", "com", "msi", "scr", "vbs", "vbe", "js", "jse",
  "wsf", "wsh", "ps1", "ps1xml", "psc1", "psc2", "msh", "msh1", "msh2",
  "mshxml", "msh1xml", "msh2xml", "scf", "lnk", "inf", "reg", "jar",
  "app", "dmg", "iso", "img", "pkg", "deb", "rpm",
]);

/** .env 를 읽어 process.env 에 병합 (dotenv 미사용) */
function loadEnvFile() {
  const envPath = join(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

/** Firestore REST 필드 값 언랩 */
function unwrapFirestoreValue(field) {
  if (!field || typeof field !== "object") return undefined;
  if ("nullValue" in field) return null;
  if ("stringValue" in field) return field.stringValue;
  if ("integerValue" in field) return Number.parseInt(String(field.integerValue), 10);
  if ("doubleValue" in field) return field.doubleValue;
  if ("booleanValue" in field) return field.booleanValue;
  if ("timestampValue" in field) return field.timestampValue;
  return undefined;
}

/**
 * Firestore 문서에서 첨부 URL 목록 추출 (단일 문자열·배열·대체 필드명)
 * @param {Record<string, unknown>} fields Firestore document.fields
 * @returns {string[]}
 */
function collectLegacyAttachmentUrls(fields) {
  if (!fields || typeof fields !== "object") return [];

  /** @type {string[]} */
  const out = [];
  const pushHttp = (value) => {
    if (typeof value !== "string") return;
    const trimmed = value.trim();
    if (trimmed.startsWith("http")) out.push(trimmed);
  };

  const singleField =
    fields.attachmentUrl ?? fields.attachment_url ?? fields.fileUrl ?? fields.file_url;
  if (singleField && typeof singleField === "object") {
    const unwrapped = unwrapFirestoreValue(singleField);
    pushHttp(unwrapped);
    if ("arrayValue" in singleField && singleField.arrayValue?.values) {
      for (const v of singleField.arrayValue.values) {
        pushHttp(unwrapFirestoreValue(v));
      }
    }
  }

  const listField = fields.attachmentUrls ?? fields.files;
  if (listField && typeof listField === "object" && "arrayValue" in listField) {
    const values = listField.arrayValue?.values;
    if (Array.isArray(values)) {
      for (const v of values) {
        pushHttp(unwrapFirestoreValue(v));
      }
    }
  }

  return [...new Set(out)];
}

/** 문서 이름에서 컬렉션과 문서 ID 추출 (경로: .../documents/{collectionId}/{docId}) */
function parseDocName(fullName) {
  const parts = fullName.split("/");
  const docId = parts[parts.length - 1];
  const collectionId = parts[parts.length - 2];
  return { collectionId, docId };
}

/** 파일명으로 업로드 허용 여부 */
function hasBlockedExtension(fileName) {
  const dot = fileName.lastIndexOf(".");
  if (dot === -1) return false;
  return BLOCKED_EXTENSIONS.has(fileName.slice(dot + 1).toLowerCase());
}

/** 업로드 경로용 안전 파일명 (관리자 액션과 동일 규칙) */
function buildSafeFileName(originalName) {
  const fallback = "file";
  const trimmed = (originalName ?? "").trim();
  if (!trimmed.length) return fallback;

  const dotIndex = trimmed.lastIndexOf(".");
  const baseRaw = dotIndex === -1 ? trimmed : trimmed.slice(0, dotIndex);
  const extRaw = dotIndex === -1 ? "" : trimmed.slice(dotIndex + 1);

  const sanitize = (value) =>
    value
      .replace(/[^\p{L}\p{N}_.\-]/gu, "_")
      .replace(/_+/g, "_")
      .replace(/^_+|_+$/g, "");

  const base = sanitize(baseRaw).slice(0, 80) || fallback;
  const ext = sanitize(extRaw).toLowerCase().slice(0, 10);
  return ext ? `${base}.${ext}` : base;
}

/** MIME → 간단 확장자 추정 */
function guessExtFromMime(mime) {
  if (!mime || typeof mime !== "string") return "bin";
  const map = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "application/pdf": "pdf",
  };
  return map[mime.toLowerCase().split(";")[0].trim()] ?? "bin";
}

/**
 * 첨부 1건: Supabase Storage에 업로드 시도, 실패 시 구 Firebase URL만 메타로 보존
 */
async function buildAttachmentMeta(supabase, collectionId, docId, attachmentUrl) {
  const fallbackName = `legacy-${collectionId}-${docId}`;
  if (!attachmentUrl || typeof attachmentUrl !== "string" || !attachmentUrl.startsWith("http")) {
    return [];
  }

  let response;
  try {
    response = await fetch(attachmentUrl, { redirect: "follow" });
  } catch (err) {
    console.warn(`  [경고] 첨부 다운로드 실패 → 원본 URL만 저장: ${attachmentUrl}`, err?.message ?? err);
    return [
      {
        name: `${fallbackName}-remote`,
        url: attachmentUrl,
        path: "",
        size: 0,
        type: undefined,
      },
    ];
  }

  if (!response.ok) {
    console.warn(`  [경고] 첨부 HTTP ${response.status} → 원본 URL만 저장`);
    return [
      {
        name: `${fallbackName}-remote`,
        url: attachmentUrl,
        path: "",
        size: 0,
        type: undefined,
      },
    ];
  }

  const contentLength = Number.parseInt(response.headers.get("content-length") ?? "0", 10);
  if (contentLength > MAX_ATTACHMENT_BYTES) {
    console.warn(`  [경고] 첨부 용량 초과(${contentLength}B) → 원본 URL만 저장`);
    return [
      {
        name: `${fallbackName}-remote`,
        url: attachmentUrl,
        path: "",
        size: 0,
        type: undefined,
      },
    ];
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > MAX_ATTACHMENT_BYTES) {
    console.warn(`  [경고] 첨부 용량 초과(${buffer.length}B) → 원본 URL만 저장`);
    return [
      {
        name: `${fallbackName}-remote`,
        url: attachmentUrl,
        path: "",
        size: 0,
        type: undefined,
      },
    ];
  }

  const mime = response.headers.get("content-type") ?? "application/octet-stream";
  const ext = guessExtFromMime(mime);
  const originalFilename = buildSafeFileName(`import-${docId}.${ext}`);
  if (hasBlockedExtension(originalFilename)) {
    console.warn(`  [경고] 차단 확장자 → 원본 URL만 저장`);
    return [
      {
        name: `${fallbackName}-remote`,
        url: attachmentUrl,
        path: "",
        size: 0,
        type: undefined,
      },
    ];
  }

  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const folderHint = `migrate/${collectionId}/${docId}`;
  const objectPath = `${folderHint}/${uniqueSuffix}-${originalFilename}`;

  const { error: uploadError } = await supabase.storage
    .from(ATTACHMENT_BUCKET)
    .upload(objectPath, buffer, {
      contentType: mime || "application/octet-stream",
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    console.warn(`  [경고] Storage 업로드 실패 → 원본 URL만 저장:`, uploadError.message);
    return [
      {
        name: originalFilename,
        url: attachmentUrl,
        path: "",
        size: buffer.length,
        type: mime,
      },
    ];
  }

  const { data: publicUrlData } = supabase.storage.from(ATTACHMENT_BUCKET).getPublicUrl(objectPath);
  const publicUrl = publicUrlData?.publicUrl;
  if (!publicUrl) {
    return [
      {
        name: originalFilename,
        url: attachmentUrl,
        path: objectPath,
        size: buffer.length,
        type: mime,
      },
    ];
  }

  return [
    {
      name: originalFilename,
      url: publicUrl,
      path: objectPath,
      size: buffer.length,
      type: mime,
    },
  ];
}

/** 컬렉션 전체 페이지네이션 조회 */
async function fetchFirestoreCollection(collectionId) {
  const out = [];
  let pageToken = "";
  for (;;) {
    const url = new URL(`${FIRESTORE_BASE}/${collectionId}`);
    url.searchParams.set("pageSize", "300");
    url.searchParams.set("key", FIREBASE_WEB_API_KEY);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Firestore ${collectionId} 목록 실패: ${res.status} ${await res.text()}`);
    }
    const data = await res.json();
    if (Array.isArray(data.documents)) out.push(...data.documents);
    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }
  return out;
}

const STATE_PATH = join(__dirname, "migrate-fcokj-state.json");

function loadState() {
  if (!existsSync(STATE_PATH)) return { migratedKeys: [] };
  try {
    const raw = readFileSync(STATE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return {
      migratedKeys: Array.isArray(parsed.migratedKeys) ? parsed.migratedKeys : [],
    };
  } catch {
    return { migratedKeys: [] };
  }
}

function saveState(state) {
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), "utf8");
}

function parseArgs(argv) {
  const dryRun = argv.includes("--dry-run");
  const noTitlePrefix = argv.includes("--no-title-prefix");
  const deleteAllCommunityPosts = argv.includes("--delete-all-community-posts");
  const confirmYes = argv.includes("--yes");
  let only = null;
  const oi = argv.indexOf("--only");
  if (oi !== -1 && argv[oi + 1]) {
    only = argv[oi + 1];
  }
  return { dryRun, noTitlePrefix, only, deleteAllCommunityPosts, confirmYes };
}

function main() {
  loadEnvFile();
  const { dryRun, noTitlePrefix, only, deleteAllCommunityPosts, confirmYes } = parseArgs(
    process.argv.slice(2),
  );

  if (deleteAllCommunityPosts && !confirmYes) {
    console.error(
      "--delete-all-community-posts 는 실수 방지를 위해 같은 명령에 --yes 가 필요합니다.",
    );
    process.exit(1);
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!dryRun && (!supabaseUrl || !serviceKey)) {
    console.error(
      "SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 가 필요합니다 (.env 또는 환경변수). --dry-run 이면 생략 가능.",
    );
    process.exit(1);
  }

  const supabase = dryRun ? null : createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const tasks = [];
  if (!only || only === "notices") tasks.push({ id: "notices", titlePrefix: "[공지]" });
  if (!only || only === "activities") tasks.push({ id: "activities", titlePrefix: "[활동]" });

  if (only && !["notices", "activities"].includes(only)) {
    console.error('--only 값은 "notices" 또는 "activities" 만 허용합니다.');
    process.exit(1);
  }

  const state = dryRun ? { migratedKeys: [] } : loadState();
  const migratedSet = new Set(state.migratedKeys);

  (async () => {
    let totalInserted = 0;

    if (deleteAllCommunityPosts) {
      if (dryRun) {
        console.log("[dry-run] community_posts 전체 삭제 및 상태 초기화 생략");
      } else {
        console.log("\n=== Supabase community_posts 전체 삭제 중… ===");
        const { error: delErr } = await supabase.from("community_posts").delete().neq("id", 0);
        if (delErr) {
          console.error("삭제 실패:", delErr.message);
          process.exit(1);
        }
        const cleared = { migratedKeys: [] };
        saveState(cleared);
        migratedSet.clear();
        console.log("삭제 완료. migrate-fcokj-state.json 의 migratedKeys 를 비웠습니다.");
      }
    }

    for (const task of tasks) {
      console.log(`\n=== Firestore "${task.id}" 조회 중… ===`);
      const docs = await fetchFirestoreCollection(task.id);
      console.log(`문서 ${docs.length}건`);

      for (const doc of docs) {
        const { collectionId, docId } = parseDocName(doc.name);
        const key = `${collectionId}/${docId}`;
        if (migratedSet.has(key)) {
          console.log(`[건너뜀] 이미 처리됨: ${key}`);
          continue;
        }

        const fields = doc.fields ?? {};
        const titleRaw = unwrapFirestoreValue(fields.title) ?? "";
        const contentRaw = unwrapFirestoreValue(fields.content) ?? "";
        const createdAtMs = unwrapFirestoreValue(fields.createdAt);
        const viewsRaw = unwrapFirestoreValue(fields.views);
        const attachmentUrls = collectLegacyAttachmentUrls(fields);

        const titleBase = String(titleRaw).replace(/^\s+/, "").trim();
        const title =
          noTitlePrefix || !task.titlePrefix
            ? titleBase.slice(0, 500)
            : `${task.titlePrefix} ${titleBase}`.trim().slice(0, 500);

        let content = String(contentRaw).trim();
        if (!content) content = titleBase || "(내용 없음)";

        const createdAt =
          typeof createdAtMs === "number" && Number.isFinite(createdAtMs)
            ? new Date(createdAtMs).toISOString()
            : new Date().toISOString();

        const viewCount =
          typeof viewsRaw === "number" && Number.isFinite(viewsRaw) && viewsRaw >= 0
            ? Math.floor(viewsRaw)
            : 0;

        console.log(`→ ${key} | ${titleBase.slice(0, 60)}${titleBase.length > 60 ? "…" : ""}`);

        let attachments = [];
        if (attachmentUrls.length > 0 && supabase) {
          for (let urlIndex = 0; urlIndex < attachmentUrls.length; urlIndex += 1) {
            const oneUrl = attachmentUrls[urlIndex];
            const metas = await buildAttachmentMeta(
              supabase,
              collectionId,
              attachmentUrls.length > 1 ? `${docId}-${urlIndex}` : docId,
              oneUrl,
            );
            attachments.push(...metas);
          }
        } else if (attachmentUrls.length > 0 && dryRun) {
          console.log(`  [dry-run] 첨부 URL ${attachmentUrls.length}건 (업로드 생략)`);
        }

        const row = {
          title,
          content,
          is_published: true,
          author_id: null,
          created_at: createdAt,
          updated_at: createdAt,
          view_count: viewCount,
          attachments,
        };

        if (dryRun) {
          console.log("  [dry-run] insert 생략", {
            created_at: row.created_at,
            view_count: row.view_count,
            // dry-run 에서는 Storage 업로드를 생략하므로 URL 건수로 표시
            attachmentUrlCount: attachmentUrls.length,
          });
        } else {
          const { error } = await supabase.from("community_posts").insert(row);
          if (error) {
            console.error(`  [실패] insert:`, error.message);
            process.exitCode = 1;
            break;
          }
          migratedSet.add(key);
          state.migratedKeys = [...migratedSet];
          saveState(state);
          totalInserted += 1;
          console.log(`  OK (누적 ${totalInserted}건)`);
        }
      }
    }

    if (!dryRun) {
      console.log(`\n완료: 새로 삽입 ${totalInserted}건 (상태 파일: ${STATE_PATH})`);
    } else {
      console.log("\n[dry-run] 종료 — 실제 반영 없음");
    }
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

main();
