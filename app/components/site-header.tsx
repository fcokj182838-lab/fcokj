"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE_MENU, SITE_INFO } from "../lib/site-config";

// 헤더 / 글로벌 네비게이션
// - 데스크톱: 호버 시 드롭다운으로 서브메뉴 노출
// - 모바일: 햄버거 버튼 클릭 시 풀스크린 오버레이 메뉴
export function SiteHeader() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // 스크롤 시 헤더 배경 변경 처리
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 모바일 메뉴 열렸을 때 body 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  // 페이지 이동 시 모바일 메뉴 자동 닫힘
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-[var(--color-cream)]/90 backdrop-blur-md border-b border-[var(--color-line)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="flex h-20 items-center justify-between gap-8">
          {/* 로고 - 이미지 1장으로 표시 (지구 마크 + 사이트명 통합 디자인) */}
          <Link
            href="/"
            aria-label={`${SITE_INFO.name} 홈으로 이동`}
            className="group flex items-center transition-opacity duration-300 hover:opacity-80"
          >
            <Image
              src="/logo.png"
              alt={SITE_INFO.name}
              width={1024}
              height={256}
              priority
              sizes="(max-width: 640px) 160px, 200px"
              className="h-10 w-auto sm:h-11"
            />
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden lg:block" aria-label="주 메뉴">
            <ul className="flex items-center gap-1">
              {SITE_MENU.map((section) => {
                const isOpen = openSection === section.title;
                const isActive = pathname.startsWith(section.href);
                return (
                  <li
                    key={section.title}
                    onMouseEnter={() => setOpenSection(section.title)}
                    onMouseLeave={() => setOpenSection(null)}
                    className="relative"
                  >
                    <Link
                      href={section.href}
                      className={`flex items-center gap-2 px-5 py-2 text-[14px] font-medium tracking-tight transition-colors duration-300 ${
                        isActive
                          ? "text-[var(--color-terracotta)]"
                          : "text-[var(--color-ink)] hover:text-[var(--color-terracotta)]"
                      }`}
                    >
                      {section.title}
                      {section.items.length > 1 && (
                        <span
                          className={`text-[10px] transition-transform duration-300 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        >
                          ▾
                        </span>
                      )}
                    </Link>

                    {/* 드롭다운 메뉴 */}
                    {section.items.length > 1 && (
                      <div
                        className={`absolute left-1/2 top-full -translate-x-1/2 pt-3 transition-all duration-300 ${
                          isOpen
                            ? "pointer-events-auto translate-y-0 opacity-100"
                            : "pointer-events-none translate-y-2 opacity-0"
                        }`}
                      >
                        <div className="w-[280px] overflow-hidden rounded-sm border border-[var(--color-line)] bg-[var(--color-ivory)] shadow-[0_24px_48px_-12px_rgba(26,35,50,0.18)]">
                          <div className="border-b border-[var(--color-line)] bg-[var(--color-cream)] px-5 py-3">
                            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                              {section.englishTitle}
                            </p>
                          </div>
                          <ul className="py-2">
                            {section.items.map((item) => (
                              <li key={item.href}>
                                <Link
                                  href={item.href}
                                  className="group/item flex items-baseline justify-between gap-3 px-5 py-3 transition-colors hover:bg-[var(--color-cream)]"
                                >
                                  <div className="flex flex-col">
                                    <span className="text-[14px] font-medium text-[var(--color-ink)]">
                                      {item.label}
                                    </span>
                                    {item.description && (
                                      <span className="mt-0.5 text-[11px] text-[var(--color-muted)]">
                                        {item.description}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[var(--color-terracotta)] opacity-0 transition-all duration-300 group-hover/item:translate-x-1 group-hover/item:opacity-100">
                                    →
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* 우측 액션 영역 (데스크톱) */}
          <div className="hidden items-center gap-4 lg:flex">
            <a
              href={`tel:${SITE_INFO.phone.replace(/-/g, "")}`}
              className="flex flex-col items-end leading-tight"
            >
              <span className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted)]">
                Contact
              </span>
              <span className="font-[var(--font-serif)] text-[14px] font-semibold tracking-tight text-[var(--color-ink)]">
                {SITE_INFO.phone}
              </span>
            </a>
            <Link
              href="/support"
              className="btn-primary group relative inline-flex items-center gap-2 overflow-hidden bg-[var(--color-terracotta)] px-5 py-2.5 text-[13px] font-semibold tracking-tight text-[var(--color-ivory)] transition-colors"
            >
              <span className="relative z-10">후원하기</span>
              <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

          {/* 모바일 햄버거 버튼 */}
          <button
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="relative flex h-10 w-10 items-center justify-center lg:hidden"
            aria-label={isMobileOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={isMobileOpen}
          >
            <span className="relative flex h-4 w-6 flex-col justify-between">
              <span
                className={`block h-[1.5px] w-full bg-[var(--color-ink)] transition-transform duration-400 ${
                  isMobileOpen ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`block h-[1.5px] w-full bg-[var(--color-ink)] transition-opacity duration-300 ${
                  isMobileOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-[1.5px] w-full bg-[var(--color-ink)] transition-transform duration-400 ${
                  isMobileOpen ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {/* 모바일 풀스크린 메뉴 */}
      <div
        className={`fixed inset-0 top-20 z-40 overflow-y-auto bg-[var(--color-cream)] transition-all duration-500 lg:hidden ${
          isMobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isMobileOpen}
      >
        <nav className="px-6 pb-16 pt-8" aria-label="모바일 메뉴">
          <ul className="space-y-2">
            {SITE_MENU.map((section, sectionIndex) => (
              <li
                key={section.title}
                className={`border-b border-[var(--color-line)] pb-4 transition-all duration-700 ${
                  isMobileOpen ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"
                }`}
                style={{ transitionDelay: isMobileOpen ? `${sectionIndex * 80}ms` : "0ms" }}
              >
                <div className="flex items-baseline justify-between py-3">
                  <Link
                    href={section.href}
                    className="font-[var(--font-serif)] text-2xl font-semibold tracking-tight text-[var(--color-ink)]"
                  >
                    {section.title}
                  </Link>
                  <span className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                    {section.englishTitle}
                  </span>
                </div>
                <ul className="space-y-2 pl-1 pt-1">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center justify-between py-1.5 text-[15px] text-[var(--color-ink-soft)]"
                      >
                        <span>— {item.label}</span>
                        <span className="text-[var(--color-terracotta)]">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          {/* 모바일 메뉴 하단 연락처 */}
          <div className="mt-10 space-y-3 border-t border-[var(--color-line)] pt-8">
            <a
              href={`tel:${SITE_INFO.phone.replace(/-/g, "")}`}
              className="flex items-baseline justify-between"
            >
              <span className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                Phone
              </span>
              <span className="font-[var(--font-serif)] text-lg font-semibold text-[var(--color-ink)]">
                {SITE_INFO.phone}
              </span>
            </a>
            <a
              href={`mailto:${SITE_INFO.email}`}
              className="flex items-baseline justify-between"
            >
              <span className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                Email
              </span>
              <span className="text-sm text-[var(--color-ink)]">{SITE_INFO.email}</span>
            </a>
            <Link
              href="/support"
              className="mt-6 flex items-center justify-center gap-2 bg-[var(--color-terracotta)] py-4 text-[14px] font-semibold tracking-tight text-[var(--color-ivory)]"
            >
              따뜻한 동행에 함께하기
              <span>→</span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
