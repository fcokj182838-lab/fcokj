"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { logoutAdmin } from "./actions";

/** 메뉴 활성 상태 판별 방식 (갤러리 신규는 쿼리로 활동/언론 구분) */
type NavMatchMode = "exact" | "prefix" | "new-activity" | "new-press";

type NavLeaf = { label: string; href: string; match?: NavMatchMode };

type NavGroup = {
  heading: string;
  items: NavLeaf[];
};

/** 관리자 영역 왼쪽 메뉴 구조 (URL 기준) */
const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    heading: "개요",
    items: [
      { label: "대시보드", href: "/admin", match: "exact" },
      { label: "팝업 배너", href: "/admin/popup-banner", match: "prefix" },
    ],
  },
  {
    heading: "커뮤니티",
    items: [
      { label: "게시글 목록", href: "/admin/community", match: "prefix" },
      { label: "새 글 작성", href: "/admin/community/new", match: "exact" },
    ],
  },
  {
    heading: "갤러리",
    items: [
      { label: "사진·언론 목록", href: "/admin/gallery/photos", match: "prefix" },
      { label: "새 활동사진", href: "/admin/gallery/photos/new", match: "new-activity" },
      { label: "새 언론 자료", href: "/admin/gallery/photos/new?kind=press", match: "new-press" },
    ],
  },
];

function isNavItemActive(
  pathname: string,
  searchParams: URLSearchParams,
  item: NavLeaf,
): boolean {
  const [pathOnly, query] = item.href.split("?");
  if (item.match === "exact") {
    return pathname === pathOnly;
  }
  if (item.match === "prefix") {
    return pathname === pathOnly || pathname.startsWith(`${pathOnly}/`);
  }
  if (item.match === "new-activity") {
    return pathname === "/admin/gallery/photos/new" && searchParams.get("kind") !== "press";
  }
  if (item.match === "new-press") {
    return pathname === "/admin/gallery/photos/new" && searchParams.get("kind") === "press";
  }
  return pathname === pathOnly;
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 로그인 화면은 사이트 공통 레이아웃만 사용 (어사이드 없음)
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="flex w-full min-w-0 flex-col lg:flex-row">
      <aside
        className="shrink-0 border-[var(--color-line)] bg-[var(--color-ivory)] px-4 py-6 lg:sticky lg:top-20 lg:w-56 lg:self-start lg:border-b-0 lg:border-r lg:px-5 lg:py-8"
        aria-label="관리자 메뉴"
      >
        <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.28em] text-[var(--color-terracotta)]">
          ─ Admin
        </p>
        <p className="mt-2 font-[var(--font-serif)] text-lg font-medium text-[var(--color-ink)]">관리 패널</p>

        <nav className="mt-6 space-y-6">
          {ADMIN_NAV_GROUPS.map((group) => (
            <div key={group.heading}>
              <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
                {group.heading}
              </p>
              <ul className="mt-2 space-y-1">
                {group.items.map((item) => {
                  const active = isNavItemActive(pathname, searchParams, item);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`block rounded-sm border px-2.5 py-2 text-sm transition-colors ${
                          active
                            ? "border-[var(--color-terracotta)] bg-[var(--color-cream)] text-[var(--color-terracotta)]"
                            : "border-transparent text-[var(--color-ink-soft)] hover:border-[var(--color-line)] hover:bg-[var(--color-cream)]/80 hover:text-[var(--color-ink)]"
                        }`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-8 space-y-2 border-t border-[var(--color-line)] pt-6">
          <Link
            href="/"
            className="block text-xs text-[var(--color-ink-soft)] underline underline-offset-2 hover:text-[var(--color-terracotta)]"
          >
            사이트 홈으로
          </Link>
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="text-left text-xs text-[var(--color-muted)] underline underline-offset-2 hover:text-[var(--color-terracotta)]"
            >
              로그아웃
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
