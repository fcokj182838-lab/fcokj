import type { Metadata } from "next";
import Link from "next/link";
import { SITE_INFO } from "../../lib/site-config";

// 법인사업 - 상담사업 페이지
// - 원본 fcokj.org/business1 내용을 기반으로 매거진 스타일로 구성
export const metadata: Metadata = {
  title: "상담사업 · 법인사업",
  description:
    "사단법인 외국인과 동행의 상담사업 안내입니다. 노무, 법률, 비자, 교육, 일상생활 등 외국인근로자의 다양한 고충을 함께 해결합니다.",
};

type CounselingCategory = {
  code: string;
  title: string;
  english: string;
  description: string;
  details: string[];
  accent: string;
};

const COUNSELING_CATEGORIES: CounselingCategory[] = [
  {
    code: "01",
    title: "노무",
    english: "Labor",
    description: "근로 중 발생하는 임금, 산업재해, 퇴직 관련 문제를 상담합니다.",
    details: ["체불임금", "퇴직급여 계산", "산업재해 보상", "산업재해 관련 행정 업무"],
    accent: "from-[var(--color-terracotta)]/30 via-[var(--color-terracotta-soft)]/15 to-[var(--color-cream)]",
  },
  {
    code: "02",
    title: "법률",
    english: "Legal",
    description: "민사적 분쟁과 법적 절차가 필요한 상황을 안내하고 지원합니다.",
    details: ["사기", "폭행 등 민사적 문제", "법률 상담 연계"],
    accent: "from-[var(--color-sage)]/35 via-[var(--color-cream)] to-[var(--color-cream-dark)]",
  },
  {
    code: "03",
    title: "비자",
    english: "Visa",
    description: "출입국 신고 및 체류 자격 변경 과정을 함께 진행합니다.",
    details: ["고용허가제 관련 신고", "출입국 행정신고", "E-7-4 비자 변경 지원", "F-2-6 비자 변경 지원"],
    accent: "from-[var(--color-ink)]/20 via-[var(--color-sage)]/15 to-[var(--color-ivory)]",
  },
  {
    code: "04",
    title: "교육",
    english: "Education",
    description: "한국 생활에 필요한 언어와 제도 학습을 지원합니다.",
    details: ["한국어 교육", "한국어능력시험 안내", "사회통합프로그램 연계"],
    accent: "from-[var(--color-terracotta-soft)]/30 via-[var(--color-cream)] to-[var(--color-sage)]/15",
  },
  {
    code: "05",
    title: "일상생활 및 기타",
    english: "Life & Others",
    description: "생활 밀착형 문제를 실질적으로 해결할 수 있도록 돕습니다.",
    details: ["부동산 계약", "휴대폰 개통", "무료 진료 연계"],
    accent: "from-[var(--color-cream-dark)] via-[var(--color-cream)] to-[var(--color-terracotta-soft)]/15",
  },
];

const PROGRAM_SUB_PAGES = [
  { label: "상담사업", href: "/programs/counseling", english: "Counseling", current: true },
  { label: "교육사업", href: "/programs/education", english: "Education" },
  { label: "외국인봉사단", href: "/programs/volunteers", english: "Volunteers" },
  { label: "문화체험", href: "/programs/culture", english: "Culture" },
  { label: "기타사업", href: "/programs/others", english: "Others" },
];

export default function CounselingPage() {
  return (
    <>
      <PageHero />
      <SubNavigation />
      <IntroSection />
      <CounselingCategoriesSection />
      <ProcessSection />
      <ContactSection />
    </>
  );
}

function PageHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="paper-texture absolute inset-0 -z-10" />
      <div className="absolute -right-32 -top-24 -z-10 h-[500px] w-[500px] rounded-full bg-[var(--color-terracotta)]/8 blur-3xl" />
      <div className="absolute -left-24 top-32 -z-10 h-[400px] w-[400px] rounded-full bg-[var(--color-sage)]/10 blur-3xl" />

      <div className="mx-auto max-w-[1280px] px-6 pb-20 pt-16 lg:px-10 lg:pb-28 lg:pt-24">
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
            Programs
          </span>
          <span className="h-px w-6 bg-[var(--color-line)]" />
          <span className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
            Counseling
          </span>
        </nav>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <p
              className="font-[var(--font-display)] text-[12px] uppercase tracking-[0.3em] text-[var(--color-terracotta)] animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              ─ About the Business
            </p>
            <h1
              className="mt-6 font-[var(--font-serif)] text-[44px] font-medium leading-[1.05] tracking-[-0.02em] text-[var(--color-ink)] animate-fade-up sm:text-[60px] lg:text-[80px]"
              style={{ animationDelay: "0.2s" }}
            >
              <span className="block">법인사업,</span>
              <span className="block">
                <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                  상담사업
                </em>
              </span>
            </h1>
          </div>

          <aside
            className="self-end border-l border-[var(--color-line)] pl-8 animate-fade-up lg:col-span-4"
            style={{ animationDelay: "0.4s" }}
          >
            <p className="font-[var(--font-serif)] text-[15px] leading-[1.85] text-[var(--color-ink-soft)]">
              한국에 거주하는 외국인이 겪는 고충을 상담을 통해 해결하고,
              <em className="ml-1 font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                안정된 생활
              </em>
              을 돕습니다.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

function SubNavigation() {
  return (
    <section className="sticky top-20 z-30 border-y border-[var(--color-line)] bg-[var(--color-cream)]/85 backdrop-blur-md">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <nav aria-label="법인사업 하위 메뉴" className="-mx-6 overflow-x-auto px-6 lg:mx-0 lg:px-0">
          <ul className="flex min-w-max items-stretch gap-1 py-1 lg:min-w-0 lg:gap-2">
            {PROGRAM_SUB_PAGES.map((subPage, index) => (
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
                    0{index + 1}
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

function IntroSection() {
  return (
    <section className="relative bg-[var(--color-ivory)] py-24 lg:py-32">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-3">
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              ─ Counseling
            </p>
            <p className="mt-3 font-[var(--font-serif)] text-lg font-semibold text-[var(--color-ink)]">
              상담이 필요한 순간
            </p>
          </div>

          <div className="md:col-span-9">
            <blockquote className="font-[var(--font-serif)] text-[26px] leading-[1.5] tracking-[-0.01em] text-[var(--color-ink)] sm:text-[32px] md:text-[40px] md:leading-[1.45]">
              <span className="font-[var(--font-display)] text-5xl text-[var(--color-terracotta)]">
                “
              </span>{" "}
              사단법인 외국인과 동행은 한국에 거주하는 외국인이 겪을 수 있는 다양한 고충과
              애로사항에 대한 상담을 적극 지원하고 있습니다.
            </blockquote>

            <div className="mt-10 grid grid-cols-3 gap-4 md:gap-6">
              <Stat number="05" label="상담 분야" code="CATEGORIES" />
              <Stat number="1:1" label="맞춤 상담" code="COUNSELING" />
              <Stat number="365" label="상시 지원" code="SUPPORT" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ number, label, code }: { number: string; label: string; code: string }) {
  return (
    <div className="border-t border-[var(--color-ink)] pt-3">
      <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
        {code}
      </p>
      <p className="mt-2 font-[var(--font-display)] text-3xl font-medium text-[var(--color-ink)] md:text-4xl">
        {number}
      </p>
      <p className="mt-1 text-[12px] tracking-tight text-[var(--color-ink-soft)]">{label}</p>
    </div>
  );
}

function CounselingCategoriesSection() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid grid-cols-1 items-end gap-6 border-b border-[var(--color-line)] pb-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              ─ Counseling Areas
            </p>
            <h2 className="mt-4 font-[var(--font-serif)] text-3xl font-medium leading-tight tracking-[-0.02em] text-[var(--color-ink)] md:text-5xl lg:text-6xl">
              다섯 가지
              <br />
              <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                상담 분야
              </em>
            </h2>
          </div>
          <div className="md:col-span-5">
            <p className="text-sm leading-relaxed text-[var(--color-ink-soft)] md:text-base">
              노무, 법률, 비자, 교육, 일상생활까지. 외국인근로자의 실제 생활 문제를 중심으로 상담하고
              필요한 기관 연계를 함께 진행합니다.
            </p>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {COUNSELING_CATEGORIES.map((category) => (
            <article
              key={category.code}
              className="group relative overflow-hidden border border-[var(--color-line)] bg-[var(--color-cream)] p-8 transition-all duration-500 hover:border-[var(--color-ink)] hover:shadow-[0_24px_40px_-20px_rgba(26,35,50,0.2)] lg:p-10"
            >
              <div
                className={`absolute inset-0 -z-10 bg-gradient-to-br ${category.accent} opacity-55 transition-opacity duration-500 group-hover:opacity-75`}
              />
              <div className="flex items-baseline justify-between">
                <span className="font-[var(--font-display)] text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
                  {category.english}
                </span>
                <span className="font-[var(--font-display)] text-5xl font-light text-[var(--color-line)] transition-colors duration-500 group-hover:text-[var(--color-terracotta)]">
                  {category.code}
                </span>
              </div>

              <h3 className="mt-8 font-[var(--font-serif)] text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
                {category.title}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-ink-soft)] md:text-[15px]">
                {category.description}
              </p>

              <ul className="mt-6 space-y-2 border-t border-[var(--color-line)] pt-5">
                {category.details.map((detail) => (
                  <li key={detail} className="flex items-start gap-2 text-[14px] text-[var(--color-ink-soft)]">
                    <span className="mt-2 block h-1.5 w-1.5 rounded-full bg-[var(--color-terracotta)]" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  const processSteps = [
    { code: "01", title: "문의 접수", description: "전화, 이메일 또는 방문으로 상담 요청을 접수합니다." },
    { code: "02", title: "상담 진행", description: "상담 분야에 맞춰 담당자가 1:1로 내용을 확인합니다." },
    { code: "03", title: "연계 및 지원", description: "필요 시 행정기관, 법률, 의료, 교육 프로그램으로 연계합니다." },
  ];

  return (
    <section className="relative bg-[var(--color-cream-dark)] py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid grid-cols-1 items-end gap-6 border-b border-[var(--color-line)] pb-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              ─ Process
            </p>
            <h2 className="mt-4 font-[var(--font-serif)] text-3xl font-medium leading-tight tracking-[-0.02em] text-[var(--color-ink)] md:text-5xl">
              상담
              <em className="ml-2 font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                진행 절차
              </em>
            </h2>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-px bg-[var(--color-line)] md:grid-cols-3">
          {processSteps.map((step) => (
            <article key={step.code} className="bg-[var(--color-cream)] p-8 lg:p-10">
              <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
                Step {step.code}
              </p>
              <h3 className="mt-5 font-[var(--font-serif)] text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
                {step.title}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-ink-soft)]">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-ink)] py-24 text-[var(--color-cream)] lg:py-32">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -right-32 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[var(--color-terracotta)]/40 blur-3xl" />
        <div className="absolute -left-20 -top-20 h-[400px] w-[400px] rounded-full bg-[var(--color-sage)]/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1100px] px-6 lg:px-10">
        <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta-soft)]">
          ─ Need Help Now?
        </p>
        <h2 className="mt-6 font-[var(--font-serif)] text-3xl font-medium leading-[1.2] tracking-[-0.02em] md:text-5xl lg:text-6xl">
          도움이 필요하시면
          <br />
          <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta-soft)]">
            지금 바로 연락
          </em>
          주세요.
        </h2>
        <p className="mt-8 max-w-xl text-[15px] leading-[1.85] text-[var(--color-cream)]/75">
          상담 내용은 신중하고 따뜻하게 다루겠습니다. 외국인근로자의 안정적인 생활을 위해 항상
          열려있습니다.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          <a href={`tel:${SITE_INFO.phone.replace(/-/g, "")}`} className="border border-[var(--color-cream)]/20 p-5 transition-colors hover:border-[var(--color-terracotta-soft)]">
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.3em] text-[var(--color-terracotta-soft)]">
              Phone
            </p>
            <p className="mt-2 font-[var(--font-serif)] text-xl">{SITE_INFO.phone}</p>
          </a>
          <a href={`mailto:${SITE_INFO.email}`} className="border border-[var(--color-cream)]/20 p-5 transition-colors hover:border-[var(--color-terracotta-soft)]">
            <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.3em] text-[var(--color-terracotta-soft)]">
              Email
            </p>
            <p className="mt-2 text-sm">{SITE_INFO.email}</p>
          </a>
          <p className="border border-[var(--color-cream)]/20 p-5">
            <span className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.3em] text-[var(--color-terracotta-soft)]">
              Fax
            </span>
            <span className="mt-2 block font-[var(--font-serif)] text-xl">{SITE_INFO.fax}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
