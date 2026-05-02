"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import type { SitePopupBannerRow } from "../lib/site-popup-banner-shared";
import { getTodayDateStringKst, isPopupBannerRenderable } from "../lib/site-popup-banner-shared";

type SitePopupBannerProps = {
  /** 서버에서 읽은 표시 가능한 팝업 목록(순서 정렬됨) */
  banners: SitePopupBannerRow[];
};

/** 배너 id → { revision: updated_at, dayKst } — 배너마다 오늘 하루 숨김 */
const STORAGE_KEY_DISMISS_MAP = "fcokj_popup_banner_dismiss_map";

type DismissDayPayload = { revision: string; dayKst: string };
type DismissMap = Record<string, DismissDayPayload>;

function readDismissMap(): DismissMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DISMISS_MAP);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const out: DismissMap = {};
    for (const [key, val] of Object.entries(parsed as Record<string, unknown>)) {
      if (!val || typeof val !== "object") continue;
      const revision = (val as { revision?: unknown }).revision;
      const dayKst = (val as { dayKst?: unknown }).dayKst;
      if (typeof revision === "string" && typeof dayKst === "string") {
        out[key] = { revision, dayKst };
      }
    }
    return out;
  } catch {
    return {};
  }
}

function writeDismissMap(map: DismissMap): void {
  try {
    localStorage.setItem(STORAGE_KEY_DISMISS_MAP, JSON.stringify(map));
  } catch {
    /* 저장 실패 시 무시 */
  }
}

function isDismissedForTodayKst(banner: SitePopupBannerRow): boolean {
  const today = getTodayDateStringKst();
  const payload = readDismissMap()[String(banner.id)];
  if (!payload) return false;
  return payload.revision === banner.updated_at && payload.dayKst === today;
}

function dismissBannerForToday(banner: SitePopupBannerRow): void {
  const map = readDismissMap();
  map[String(banner.id)] = { revision: banner.updated_at, dayKst: getTodayDateStringKst() };
  writeDismissMap(map);
}

/**
 * 전역 팝업 배너 — 여러 건을 순서대로 표시.
 * - 닫기: 이번 방문(탭)에서만 건너뜀 — 새로고침·다음 방문 시 다시 표시될 수 있음.
 * - 오늘 하루 보지 않기: 해당 배너는 한국 날짜 기준 오늘은 저장소로 숨김, 다음 순서 배너가 있으면 이어서 표시.
 */
export function SitePopupBanner({ banners }: SitePopupBannerProps) {
  const pathname = usePathname();
  const titleId = useId();
  const descId = useId();

  const eligibleOrdered = useMemo(
    () => (banners ?? []).filter((b) => isPopupBannerRenderable(b)),
    [banners],
  );

  const [uiReady, setUiReady] = useState(false);
  /** 닫기 버튼·배경으로만 건너뛴 id (localStorage 미사용, 새로고침 시 초기화) */
  const [sessionSkippedBannerIds, setSessionSkippedBannerIds] = useState<Set<number>>(() => new Set());
  /** 오늘 하루 저장 후 localStorage 를 다시 반영하기 위한 틱 */
  const [dismissMapTick, setDismissMapTick] = useState(0);

  const isAdminRoute = pathname.startsWith("/admin");

  // dismissMapTick: 오늘 하루 저장 후 localStorage 반영해 다음 배너를 고름
  const currentBanner = useMemo(() => {
    for (const b of eligibleOrdered) {
      if (isDismissedForTodayKst(b)) continue;
      if (sessionSkippedBannerIds.has(b.id)) continue;
      return b;
    }
    return null;
  }, [eligibleOrdered, sessionSkippedBannerIds, dismissMapTick]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setUiReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [eligibleOrdered]);

  /** 이번 방문에서만 현재 팝업 건너뛰기 */
  const handleCloseSession = useCallback(() => {
    if (!currentBanner) return;
    setSessionSkippedBannerIds((prev) => {
      const next = new Set(prev);
      next.add(currentBanner.id);
      return next;
    });
  }, [currentBanner]);

  /** 오늘(한국) 동안 이 팝업 숨김 + 다음 팝업으로 */
  const handleDismissToday = useCallback(() => {
    if (!currentBanner) return;
    dismissBannerForToday(currentBanner);
    setDismissMapTick((n) => n + 1);
  }, [currentBanner]);

  useEffect(() => {
    if (!uiReady || !currentBanner || isAdminRoute) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleCloseSession();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [uiReady, currentBanner, isAdminRoute, handleCloseSession]);

  if (isAdminRoute) return null;
  if (!uiReady) return null;
  if (!currentBanner) return null;

  const hasTitle = currentBanner.title.trim().length > 0;
  const hasBody = currentBanner.body.trim().length > 0;
  const hasImage = currentBanner.image_url.trim().length > 0;
  const hasLink = currentBanner.link_url.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-ink)]/40 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={hasTitle ? titleId : undefined}
      aria-describedby={hasBody ? descId : undefined}
    >
      <button
        type="button"
        className="absolute inset-0"
        aria-label="배경 닫기 (이번에만 닫기)"
        onClick={handleCloseSession}
      />

      <div className="relative z-[101] w-full max-w-lg border border-[var(--color-line)] bg-[var(--color-ivory)] shadow-lg">
        <div className="max-h-[85vh] overflow-y-auto p-0">
          {hasImage && (
            <div className="overflow-hidden bg-[var(--color-cream)]">
              {/* eslint-disable-next-line @next/next/no-img-element -- 관리자가 입력한 임의 도메인 URL */}
              <img
                src={currentBanner.image_url}
                alt=""
                className="max-h-[min(52vh,13rem)] w-full object-contain"
                loading="lazy"
              />
            </div>
          )}

          {(hasTitle || hasBody) && (
            <div className="px-3 py-2">
              {hasTitle && (
                <h2 id={titleId} className="font-[var(--font-serif)] text-lg font-medium text-[var(--color-ink)] sm:text-xl">
                  {currentBanner.title}
                </h2>
              )}

              {hasBody && (
                <p
                  id={descId}
                  className={`whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-ink-soft)] ${hasTitle ? "mt-1.5" : ""}`}
                >
                  {currentBanner.body}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[var(--color-line)] px-3 py-2">
            {hasLink && (
              <Link
                href={currentBanner.link_url}
                className="inline-flex border border-[var(--color-terracotta)] bg-[var(--color-terracotta)] px-3 py-1.5 text-sm font-semibold text-[var(--color-ivory)]"
                onClick={handleDismissToday}
              >
                자세히 보기
              </Link>
            )}
            <button
              type="button"
              onClick={handleCloseSession}
              className="inline-flex border border-[var(--color-line)] bg-white px-3 py-1.5 text-sm text-[var(--color-ink)]"
            >
              닫기
            </button>
            <button
              type="button"
              onClick={handleDismissToday}
              className="inline-flex border border-[var(--color-line)] bg-[var(--color-cream)] px-3 py-1.5 text-sm text-[var(--color-ink)]"
            >
              오늘 하루 보지 않기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
