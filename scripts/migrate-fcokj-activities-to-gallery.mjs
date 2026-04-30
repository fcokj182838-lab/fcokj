#!/usr/bin/env node
/**
 * 구 fcokj.org /community2 → Supabase `gallery_photos` 마이그레이션
 *
 * 소스: Firebase Firestore 컬렉션 `activities`
 * (구 CRA 앱에서 community2 가 이 컬렉션을 구독함)
 *
 * 문서 필드 예: title, content, createdAt(ms), attachmentUrl(Storage URL), views
 * → gallery_photos: title, description←content, image_url/path(Supabase Storage),
 *    taken_at(createdAt 날짜), sort_order(시간순), is_published=true, author_id=null,
 *    created_at/updated_at(Firestore 시각)
 *
 * 선행 조치 (필수에 가까움):
 *   - Firebase Storage가 Spark 플랜 402로 막혀 있으면 attachmentUrl 다운로드가 실패합니다.
 *     → [Firebase 콘솔에서 Blaze 업그레이드](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024)
 *       후 이 스크립트를 실행하거나, 로컬에 이미지 백업이 있으면 수동 업로드하세요.
 *   - `.env` 에 SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (gallery-photos 버킷 쓰기 권한)
 *
 * 실행 (프로젝트 루트):
 *   node scripts/migrate-fcokj-activities-to-gallery.mjs
 *   node scripts/migrate-fcokj-activities-to-gallery.mjs --dry-run
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const FIREBASE_WEB_API_KEY = "AIzaSyAhgssAg8NCFCeGvgyVTGZFQkiy8O3zAwc";
const GCP_PROJECT_ID = "fcokj-f02d2";
const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${GCP_PROJECT_ID}/databases/(default)/documents`;

const GALLERY_BUCKET = "gallery-photos";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_SORT_ORDER = 2147483647;
const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

const STATE_PATH = join(__dirname, "migrate-gallery-activities-state.json");

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

function parseDocName(fullName) {
  const parts = fullName.split("/");
  return { collectionId: parts[parts.length - 2], docId: parts[parts.length - 1] };
}

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

function guessExtFromMime(mime) {
  if (!mime || typeof mime !== "string") return "jpg";
  const base = mime.toLowerCase().split(";")[0].trim();
  const map = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/avif": "avif",
  };
  return map[base] ?? "jpg";
}

function isoDateOnlyFromMs(ms) {
  if (typeof ms !== "number" || !Number.isFinite(ms)) return null;
  try {
    return new Date(ms).toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

function isoTimestamptzFromMs(ms) {
  if (typeof ms !== "number" || !Number.isFinite(ms)) return new Date().toISOString();
  try {
    return new Date(ms).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function sortOrderFromCreatedAtMs(ms) {
  if (typeof ms !== "number" || !Number.isFinite(ms)) return 0;
  const v = Math.floor(ms / 1000);
  return Math.min(MAX_SORT_ORDER, Math.max(0, v));
}

function loadState() {
  if (!existsSync(STATE_PATH)) return { migratedKeys: [] };
  try {
    const parsed = JSON.parse(readFileSync(STATE_PATH, "utf8"));
    return { migratedKeys: Array.isArray(parsed.migratedKeys) ? parsed.migratedKeys : [] };
  } catch {
    return { migratedKeys: [] };
  }
}

function saveState(state) {
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), "utf8");
}

async function downloadAndUploadToGallery(supabase, docId, attachmentUrl) {
  if (!attachmentUrl || typeof attachmentUrl !== "string" || !attachmentUrl.startsWith("http")) {
    return null;
  }

  let response;
  try {
    response = await fetch(attachmentUrl, { redirect: "follow" });
  } catch (err) {
    console.warn(`  [건너뜀] 다운로드 오류: ${err?.message ?? err}`);
    return null;
  }

  if (!response.ok) {
    console.warn(
      `  [건너뜀] Storage HTTP ${response.status} (Spark/402면 Blaze 전환 필요) — ${attachmentUrl.slice(0, 80)}…`,
    );
    return null;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length === 0 || buffer.length > MAX_IMAGE_BYTES) {
    console.warn(`  [건너뜀] 용량 0바이트 또는 8MB 초과 (${buffer.length}B)`);
    return null;
  }

  const mimeHeader = response.headers.get("content-type") ?? "image/jpeg";
  const mime = mimeHeader.toLowerCase().split(";")[0].trim();
  if (!ALLOWED_IMAGE_MIME.has(mime)) {
    console.warn(`  [건너뜀] 갤러리 미지원 MIME: ${mime}`);
    return null;
  }

  const ext = guessExtFromMime(mime);
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const now = new Date();
  const yyyyMm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const imagePath = `migrate/activities/${docId}/${yyyyMm}-${uniqueSuffix}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(GALLERY_BUCKET).upload(imagePath, buffer, {
    contentType: mime,
    cacheControl: "3600",
    upsert: false,
  });

  if (uploadError) {
    console.warn(`  [건너뜀] Supabase 업로드 실패:`, uploadError.message);
    return null;
  }

  const { data: publicUrlData } = supabase.storage.from(GALLERY_BUCKET).getPublicUrl(imagePath);
  const publicUrl = publicUrlData?.publicUrl;
  if (!publicUrl) {
    await supabase.storage.from(GALLERY_BUCKET).remove([imagePath]);
    return null;
  }

  return { imageUrl: publicUrl, imagePath };
}

function main() {
  loadEnvFile();
  const dryRun = process.argv.includes("--dry-run");

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!dryRun && (!supabaseUrl || !serviceKey)) {
    console.error("SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 가 필요합니다. --dry-run 이면 생략 가능.");
    process.exit(1);
  }

  const supabase = dryRun ? null : createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const state = dryRun ? { migratedKeys: [] } : loadState();
  const migratedSet = new Set(state.migratedKeys);

  (async () => {
    console.log('=== Firestore "activities" → gallery_photos ===\n');
    const docs = await fetchFirestoreCollection("activities");
    console.log(`문서 ${docs.length}건\n`);

    let inserted = 0;
    let skipped = 0;

    for (const doc of docs) {
      const { docId } = parseDocName(doc.name);
      const key = `activities/${docId}`;
      if (migratedSet.has(key)) {
        console.log(`[건너뜀] 이미 처리: ${key}`);
        continue;
      }

      const fields = doc.fields ?? {};
      const titleRaw = unwrapFirestoreValue(fields.title) ?? "";
      const contentRaw = unwrapFirestoreValue(fields.content) ?? "";
      const createdAtMs = unwrapFirestoreValue(fields.createdAt);
      const attachmentUrl = unwrapFirestoreValue(fields.attachmentUrl);

      const title = String(titleRaw).trim().slice(0, 200);
      const description =
        String(contentRaw).trim().length > 0 ? String(contentRaw).trim().slice(0, 2000) : null;

      if (!title) {
        console.warn(`→ ${key} 제목 없음 — 건너뜀`);
        skipped += 1;
        continue;
      }

      if (!attachmentUrl) {
        console.warn(`→ ${key} | ${title.slice(0, 50)}… — attachmentUrl 없음, 건너뜀`);
        skipped += 1;
        continue;
      }

      console.log(`→ ${key} | ${title.slice(0, 60)}${title.length > 60 ? "…" : ""}`);

      let uploadResult = null;
      if (!dryRun && supabase) {
        uploadResult = await downloadAndUploadToGallery(supabase, docId, attachmentUrl);
      }

      if (dryRun) {
        console.log("  [dry-run] 업로드·insert 생략");
        continue;
      }

      if (!uploadResult) {
        skipped += 1;
        continue;
      }

      const takenAt = isoDateOnlyFromMs(createdAtMs);
      const createdIso = isoTimestamptzFromMs(createdAtMs);
      const sortOrder = sortOrderFromCreatedAtMs(createdAtMs);

      const row = {
        title,
        description,
        image_url: uploadResult.imageUrl,
        image_path: uploadResult.imagePath,
        taken_at: takenAt,
        sort_order: sortOrder,
        is_published: true,
        gallery_kind: "activity",
        author_id: null,
        created_at: createdIso,
        updated_at: createdIso,
      };

      const { error } = await supabase.from("gallery_photos").insert(row);
      if (error) {
        console.error(`  [실패] insert:`, error.message);
        await supabase.storage.from(GALLERY_BUCKET).remove([uploadResult.imagePath]);
        process.exitCode = 1;
        break;
      }

      migratedSet.add(key);
      state.migratedKeys = [...migratedSet];
      saveState(state);
      inserted += 1;
      console.log(`  OK (누적 ${inserted}건)`);
    }

    console.log(`\n완료: 삽입 ${inserted}건, 건너뜀·실패 ${skipped}건`);
    if (!dryRun) console.log(`상태 파일: ${STATE_PATH}`);
    else console.log("[dry-run] DB·Storage 반영 없음");
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

main();
