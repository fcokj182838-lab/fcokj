import Link from "next/link";
import { SITE_MENU, SITE_INFO } from "../lib/site-config";

// 푸터 컴포넌트
// - 사이트맵, 연락처, 카피라이트 정보를 담은 풀 푸터
export function SiteFooter() {
  return (
    <footer className="relative bg-[var(--color-ink)] text-[var(--color-cream)]">
      {/* 상단 데코 라인 */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--color-terracotta)] to-transparent" />

      <div className="mx-auto max-w-[1280px] px-6 py-20 lg:px-10">
        {/* 메인 푸터 그리드 */}
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          {/* 좌측 - 브랜드 메시지 */}
          <div className="md:col-span-5">
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta-soft)]">
              Walking Together
            </p>
            <h3 className="mt-4 font-[var(--font-serif)] text-3xl leading-snug tracking-tight">
              여러분의 작은 힘이
              <br />
              많은 이들에게
              <br />
              <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta-soft)]">
                큰 힘
              </em>
              이 됩니다.
            </h3>

            <Link
              href="/support"
              className="mt-8 inline-flex items-center gap-2 border-b border-[var(--color-cream)] pb-1 text-sm font-medium tracking-tight transition-colors hover:text-[var(--color-terracotta-soft)] hover:border-[var(--color-terracotta-soft)]"
            >
              후원으로 동행하기
              <span>→</span>
            </Link>
          </div>

          {/* 우측 - 사이트맵 */}
          <div className="md:col-span-7">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
              {SITE_MENU.map((section) => (
                <div key={section.title}>
                  <h4 className="mb-4 font-[var(--font-serif)] text-[14px] font-semibold text-[var(--color-cream)]">
                    {section.title}
                  </h4>
                  <ul className="space-y-2.5">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="text-[13px] text-[var(--color-cream)]/60 transition-colors hover:text-[var(--color-terracotta-soft)]"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 구분선 */}
        <div className="my-14 h-px w-full bg-[var(--color-cream)]/15" />

        {/* 연락처 정보 */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <ContactBlock label="교육장 주소" value={SITE_INFO.address} />
          <ContactBlock
            label="전화"
            value={SITE_INFO.phone}
            href={`tel:${SITE_INFO.phone.replace(/-/g, "")}`}
          />
          <ContactBlock label="팩스" value={SITE_INFO.fax} />
          <ContactBlock
            label="이메일"
            value={SITE_INFO.email}
            href={`mailto:${SITE_INFO.email}`}
          />
        </div>

        {/* 하단 카피라이트 */}
        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-[var(--color-cream)]/15 pt-8 md:flex-row md:items-center">
          <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.2em] text-[var(--color-cream)]/45">
            {SITE_INFO.copyright}
          </p>
          <a
            href={SITE_INFO.cafe}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12px] tracking-tight text-[var(--color-cream)]/60 transition-colors hover:text-[var(--color-terracotta-soft)]"
          >
            센터카페 →
          </a>
        </div>
      </div>
    </footer>
  );
}

// 푸터 연락처 블록 - 라벨 + 값 (옵션: 링크)
function ContactBlock({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.25em] text-[var(--color-terracotta-soft)]">
        {label}
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-[var(--color-cream)]/85">
        {value}
      </p>
    </>
  );

  if (href) {
    return (
      <a href={href} className="block transition-opacity hover:opacity-80">
        {content}
      </a>
    );
  }
  return <div>{content}</div>;
}
