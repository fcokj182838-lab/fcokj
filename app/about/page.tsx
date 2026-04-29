import type { Metadata } from "next";
import Link from "next/link";
import { SITE_INFO } from "../lib/site-config";

// 법인소개 - 인사말 페이지
// - 원본 fcokj.org/intro1 의 인사말 콘텐츠를 매거진 스타일로 재구성
export const metadata: Metadata = {
  title: "인사말 · 법인소개",
  description:
    "사단법인 외국인과 동행 이사장이 전하는 인사말입니다. 외국인근로자의 인권보호와 복지증진을 위한 동행의 가치를 소개합니다.",
};

export default function AboutGreetingPage() {
  return (
    <>
      <PageHero />
      <SubNavigation />
      <GreetingSection />
      <CoreValuesSection />
      <NextStepsSection />
    </>
  );
}

/* ─────────────────────────────────────────────────────────
 *  페이지 히어로 - 브레드크럼 + 섹션 타이틀
 * ──────────────────────────────────────────────────────── */
function PageHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="paper-texture absolute inset-0 -z-10" />
      <div className="absolute -right-32 -top-24 -z-10 h-[500px] w-[500px] rounded-full bg-[var(--color-terracotta)]/8 blur-3xl" />
      <div className="absolute -left-24 top-32 -z-10 h-[400px] w-[400px] rounded-full bg-[var(--color-sage)]/10 blur-3xl" />

      <div className="mx-auto max-w-[1280px] px-6 pb-20 pt-16 lg:px-10 lg:pb-28 lg:pt-24">
        {/* 브레드크럼 */}
        <nav
          aria-label="현재 위치"
          className="flex items-center gap-3 border-b border-[var(--color-line)] pb-6 animate-fade-in"
        >
          <Link
            href="/"
            className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-terracotta)]"
          >
            Home
          </Link>
          <span className="h-px w-6 bg-[var(--color-line)]" />
          <span className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-muted)]">
            About
          </span>
          <span className="h-px w-6 bg-[var(--color-line)]" />
          <span className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
            Greeting
          </span>
        </nav>

        {/* 섹션 타이틀 */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <p
              className="font-[var(--font-display)] text-[12px] uppercase tracking-[0.3em] text-[var(--color-terracotta)] animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              ─ About the Corporation
            </p>
            <h1
              className="mt-6 font-[var(--font-serif)] text-[44px] font-medium leading-[1.05] tracking-[-0.02em] text-[var(--color-ink)] animate-fade-up sm:text-[60px] lg:text-[80px]"
              style={{ animationDelay: "0.2s" }}
            >
              <span className="block">법인소개,</span>
              <span className="block">
                <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                  인사말
                </em>
              </span>
            </h1>
          </div>

          <aside
            className="self-end border-l border-[var(--color-line)] pl-8 animate-fade-up lg:col-span-4"
            style={{ animationDelay: "0.4s" }}
          >
            <p className="font-[var(--font-serif)] text-[15px] leading-[1.85] text-[var(--color-ink-soft)]">
              <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                경주
              </em>{" "}
              사단법인 외국인과 동행은 한국에서 살아가는 외국인근로자의 곁에서 인권과 복지를 함께
              지켜갑니다.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
 *  법인소개 하위 메뉴 네비게이션 (탭 스타일)
 * ──────────────────────────────────────────────────────── */
const ABOUT_SUB_PAGES = [
  { label: "인사말", href: "/about", english: "Greeting", current: true },
  { label: "연혁", href: "/about/history", english: "History" },
  { label: "시설현황", href: "/about/facilities", english: "Facilities" },
  { label: "찾아오시는 길", href: "/about/location", english: "Location" },
];

function SubNavigation() {
  return (
    <section className="sticky top-20 z-30 border-y border-[var(--color-line)] bg-[var(--color-cream)]/85 backdrop-blur-md">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <nav aria-label="법인소개 하위 메뉴" className="-mx-6 overflow-x-auto px-6 lg:mx-0 lg:px-0">
          <ul className="flex min-w-max items-stretch gap-1 py-1 lg:min-w-0 lg:gap-2">
            {ABOUT_SUB_PAGES.map((subPage) => (
              <li key={subPage.href} className="flex">
                <Link
                  href={subPage.href}
                  aria-current={subPage.current ? "page" : undefined}
                  className={`group relative flex items-center gap-3 px-5 py-4 text-[14px] font-medium tracking-tight transition-colors duration-300 ${
                    subPage.current
                      ? "text-[var(--color-terracotta)]"
                      : "text-[var(--color-ink-soft)] hover:text-[var(--color-terracotta)]"
                  }`}
                >
                  <span className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                    0{ABOUT_SUB_PAGES.indexOf(subPage) + 1}
                  </span>
                  <span>{subPage.label}</span>
                  {subPage.current && (
                    <span
                      aria-hidden
                      className="absolute inset-x-4 bottom-0 h-px bg-[var(--color-terracotta)]"
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
 *  인사말 본문 - 큰 인용구 + 서명 형태의 매거진 레이아웃
 * ──────────────────────────────────────────────────────── */
function GreetingSection() {
  return (
    <section className="relative bg-[var(--color-ivory)] py-24 lg:py-36">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          {/* 좌측 라벨 */}
          <div className="md:col-span-3">
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              ─ Greeting
            </p>
            <p className="mt-3 font-[var(--font-serif)] text-lg font-semibold text-[var(--color-ink)]">
              이사장 인사말
            </p>
            <div className="mt-6 hidden md:block">
              <p className="font-[var(--font-serif)] text-[14px] leading-[1.85] text-[var(--color-ink-soft)]">
                안정된 생활의 틀을 마련하고 삶의 질을 향상시킬 수 있도록 동행합니다.
              </p>
            </div>
          </div>

          {/* 인사말 본문 */}
          <div className="md:col-span-9">
            <p className="font-[var(--font-display)] text-[12px] uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Gyeongju · {SITE_INFO.englishName}
            </p>

            <h2 className="mt-4 font-[var(--font-serif)] text-3xl font-medium leading-tight tracking-[-0.02em] text-[var(--color-ink)] md:text-4xl lg:text-[44px]">
              경주{" "}
              <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                사단법인 외국인과 동행
              </em>
              을 찾아주신
              <br className="hidden md:block" /> 여러분께 감사드립니다.
            </h2>

            {/* 본문 인용구 */}
            <blockquote className="relative mt-12 border-l-2 border-[var(--color-terracotta)] pl-6 lg:pl-8">
              <span
                aria-hidden
                className="absolute -left-2 -top-6 font-[var(--font-display)] text-7xl leading-none text-[var(--color-terracotta)]/40 lg:-left-3 lg:-top-8 lg:text-8xl"
              >
                &ldquo;
              </span>
              <p className="font-[var(--font-serif)] text-[19px] leading-[1.9] text-[var(--color-ink)] md:text-[21px] md:leading-[1.85]">
                저희 법인은 한국에서 열심히 근무하는 외국인근로자의{" "}
                <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                  인권보호
                </em>
                와{" "}
                <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                  복지증진
                </em>
                을 도모하여 외국인근로자가 한국에서 안정된 생활의 틀을 마련하고 삶의 질을
                향상시키고자 상담, 교육 등 다양한 프로그램을 운영하고 있습니다.
              </p>
              <p className="mt-6 font-[var(--font-serif)] text-[19px] leading-[1.9] text-[var(--color-ink)] md:text-[21px] md:leading-[1.85]">
                저희 센터를 통해 많은 외국인근로자가 한국 생활에 잘 적응하고{" "}
                <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                  건강히 가족의 품
                </em>
                으로 귀국할 수 있게 지원하도록 하겠습니다.
              </p>
            </blockquote>

            {/* 추가 본문 - 비전 */}
            <p className="mt-12 max-w-2xl text-[15px] leading-[1.9] text-[var(--color-ink-soft)] md:text-base">
              내·외국인이 공생하며 더불어 살아가는 살기 좋은 지역사회를 만드는 일은 결코 한 사람의
              힘만으로 이루어지지 않습니다. 지역사회와 시민, 그리고 외국인근로자가 서로를 이해하고
              존중할 때 비로소 가능한 일입니다. 저희는 그 가교 역할을 묵묵히 이어가겠습니다.
            </p>
            <p className="mt-6 max-w-2xl text-[15px] leading-[1.9] text-[var(--color-ink-soft)] md:text-base">
              앞으로도 외국인근로자 한 분 한 분의 목소리에 귀 기울이며, 따뜻한 마음으로 동행하는
              법인이 되도록 최선을 다하겠습니다. 여러분의 따뜻한 관심과 응원을 부탁드립니다.
            </p>

            {/* 서명 */}
            <div className="mt-16 flex flex-col gap-4 border-t border-[var(--color-line)] pt-10 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-muted)]">
                  Signature
                </p>
                <p className="mt-3 font-[var(--font-serif)] text-xl font-semibold tracking-tight text-[var(--color-ink)] md:text-2xl">
                  사단법인 외국인과 동행 이사장
                </p>
                <p className="mt-1 font-[var(--font-display)] text-sm italic text-[var(--color-ink-soft)]">
                  {SITE_INFO.englishName} · Chairperson
                </p>
              </div>

              {/* 서명 스타일 데코 */}
              <div className="flex items-end gap-4">
                <div className="h-px w-24 bg-[var(--color-ink)]" />
                <span className="font-[var(--font-display)] text-2xl italic text-[var(--color-terracotta)]">
                  Walking together.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
 *  핵심 가치 - 3가지 약속
 * ──────────────────────────────────────────────────────── */
const CORE_VALUES = [
  {
    number: "01",
    title: "인권보호",
    english: "Human Rights",
    description:
      "외국인근로자가 한국에서 마주하는 차별과 부당함에 맞서, 그분들의 권리를 지키기 위한 상담과 지원을 아끼지 않습니다.",
  },
  {
    number: "02",
    title: "복지증진",
    english: "Welfare",
    description:
      "안정된 일상의 기반이 될 수 있도록 의료, 교육, 생활 등 다방면의 복지 프로그램을 운영하며 곁에서 함께 합니다.",
  },
  {
    number: "03",
    title: "공생사회",
    english: "Coexistence",
    description:
      "내·외국인이 서로를 이해하고 존중하는 지역사회를 만들고자, 봉사단과 문화체험 등 만남의 자리를 꾸준히 마련합니다.",
  },
];

function CoreValuesSection() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid grid-cols-1 items-end gap-6 border-b border-[var(--color-line)] pb-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              ─ Our Values
            </p>
            <h2 className="mt-4 font-[var(--font-serif)] text-3xl font-medium leading-tight tracking-[-0.02em] text-[var(--color-ink)] md:text-5xl">
              세 가지{" "}
              <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                약속
              </em>
            </h2>
          </div>
          <div className="md:col-span-5">
            <p className="text-sm leading-relaxed text-[var(--color-ink-soft)] md:text-base">
              저희가 지향하는 가치는 멀리 있지 않습니다. 함께 살아가는 이웃으로서, 평범한 일상을
              지켜드리는 일에서 시작합니다.
            </p>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-px bg-[var(--color-line)] md:grid-cols-3">
          {CORE_VALUES.map((value) => (
            <article
              key={value.number}
              className="group relative flex flex-col bg-[var(--color-cream)] p-8 transition-colors duration-500 hover:bg-[var(--color-ivory)] lg:p-10"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-[var(--font-display)] text-[11px] font-semibold uppercase tracking-[0.25em] text-[var(--color-terracotta)]">
                  {value.english}
                </span>
                <span className="font-[var(--font-display)] text-5xl font-light text-[var(--color-line)] transition-colors duration-500 group-hover:text-[var(--color-terracotta)]">
                  {value.number}
                </span>
              </div>
              <h3 className="mt-10 font-[var(--font-serif)] text-2xl font-semibold tracking-tight text-[var(--color-ink)] md:text-3xl">
                {value.title}
              </h3>
              <p className="mt-4 text-[14px] leading-relaxed text-[var(--color-ink-soft)]">
                {value.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
 *  다음 단계 안내 - 다른 법인소개 페이지로 가는 카드
 * ──────────────────────────────────────────────────────── */
const NEXT_PAGES = [
  {
    label: "연혁",
    english: "History",
    href: "/about/history",
    description: "법인이 걸어온 길과 주요 발자취를 한눈에 확인하실 수 있습니다.",
  },
  {
    label: "시설현황",
    english: "Facilities",
    href: "/about/facilities",
    description: "교육장과 상담실 등 법인 시설의 현황을 안내해 드립니다.",
  },
  {
    label: "찾아오시는 길",
    english: "Location",
    href: "/about/location",
    description: "교육장 주소와 함께 가시는 방법을 자세히 소개합니다.",
  },
];

function NextStepsSection() {
  return (
    <section className="relative bg-[var(--color-cream-dark)] py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="flex flex-col gap-6 border-b border-[var(--color-line)] pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              ─ Continue Reading
            </p>
            <h2 className="mt-4 font-[var(--font-serif)] text-3xl font-medium leading-tight tracking-[-0.02em] text-[var(--color-ink)] md:text-5xl">
              더 자세히{" "}
              <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                알아보기
              </em>
            </h2>
          </div>
          <Link
            href="/programs/counseling"
            className="link-underline inline-flex w-fit items-center gap-2 text-sm font-semibold tracking-tight text-[var(--color-ink)]"
          >
            법인사업 바로가기 →
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
          {NEXT_PAGES.map((nextPage, index) => (
            <Link
              key={nextPage.href}
              href={nextPage.href}
              className="group relative flex flex-col border border-[var(--color-line)] bg-[var(--color-cream)] p-8 transition-all duration-500 hover:border-[var(--color-ink)] hover:shadow-[0_24px_40px_-20px_rgba(26,35,50,0.2)] lg:p-10"
            >
              <span className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.25em] text-[var(--color-terracotta)]">
                0{index + 2} · {nextPage.english}
              </span>
              <h3 className="mt-8 font-[var(--font-serif)] text-2xl font-semibold tracking-tight text-[var(--color-ink)] md:text-3xl">
                {nextPage.label}
              </h3>
              <p className="mt-4 flex-1 text-[14px] leading-relaxed text-[var(--color-ink-soft)]">
                {nextPage.description}
              </p>
              <span className="mt-10 flex items-center justify-between border-t border-[var(--color-line)] pt-6">
                <span className="text-[13px] font-medium tracking-tight text-[var(--color-ink)]">
                  자세히 보기
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-line)] text-[var(--color-ink)] transition-all duration-500 group-hover:border-[var(--color-terracotta)] group-hover:bg-[var(--color-terracotta)] group-hover:text-[var(--color-ivory)]">
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
