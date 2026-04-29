import type { Metadata } from "next";
import Link from "next/link";
import { SITE_INFO } from "../../lib/site-config";

export const metadata: Metadata = {
  title: "교육사업 · 법인사업",
  description:
    "사단법인 외국인과 동행의 교육사업 안내입니다. 한국어교육, 사회통합프로그램, 안전교육, 직업능력향상 등 다양한 교육을 운영합니다.",
};

type EducationProgram = {
  code: string;
  title: string;
  english: string;
  schedule: string;
  details: string[];
  accent: string;
};

const EDUCATION_PROGRAMS: EducationProgram[] = [
  {
    code: "01",
    title: "한국어교육",
    english: "Korean Language",
    schedule: "매주 토요일, 일요일",
    details: ["한국어 기초·초급·중급", "TOPIK I·II 대비"],
    accent: "from-[var(--color-terracotta)]/30 via-[var(--color-terracotta-soft)]/15 to-[var(--color-cream)]",
  },
  {
    code: "02",
    title: "조기적응교육",
    english: "Early Adaptation",
    schedule: "월 1~2회",
    details: ["중국동포 대상", "E-9 외국인근로자 대상"],
    accent: "from-[var(--color-sage)]/35 via-[var(--color-cream)] to-[var(--color-cream-dark)]",
  },
  {
    code: "03",
    title: "사회통합프로그램",
    english: "Social Integration",
    schedule: "2월, 5월, 9월 개강",
    details: ["2단계", "3단계", "4단계"],
    accent: "from-[var(--color-ink)]/20 via-[var(--color-sage)]/15 to-[var(--color-ivory)]",
  },
  {
    code: "04",
    title: "귀국의식함양교육",
    english: "Return Preparation",
    schedule: "월 1~2회",
    details: ["귀국 전 생활·정착 준비", "귀국 절차 관련 안내"],
    accent: "from-[var(--color-terracotta-soft)]/30 via-[var(--color-cream)] to-[var(--color-sage)]/15",
  },
  {
    code: "05",
    title: "안전 교육",
    english: "Safety",
    schedule: "연 1회",
    details: ["소방 교육", "심폐소생술 등"],
    accent: "from-[var(--color-cream-dark)] via-[var(--color-cream)] to-[var(--color-terracotta-soft)]/15",
  },
  {
    code: "06",
    title: "기초생활교육",
    english: "Basic Life Skills",
    schedule: "월 1~2회",
    details: ["한국 생활 필수 정보", "생활 밀착형 안내"],
    accent: "from-[var(--color-terracotta)]/25 via-[var(--color-cream)] to-[var(--color-ivory)]",
  },
  {
    code: "07",
    title: "외국인 운전면허교실",
    english: "Driving License",
    schedule: "월 1회",
    details: ["면허 취득 절차 안내", "필기·실기 준비 지원"],
    accent: "from-[var(--color-sage)]/25 via-[var(--color-cream)] to-[var(--color-cream-dark)]",
  },
  {
    code: "08",
    title: "외국인 직업능력향상 교육",
    english: "Job Skills",
    schedule: "월 2회",
    details: ["직무 역량 강화", "현장 적응력 향상"],
    accent: "from-[var(--color-ink)]/15 via-[var(--color-cream)] to-[var(--color-sage)]/15",
  },
  {
    code: "09",
    title: "컴퓨터 활용교육",
    english: "Computer Skills",
    schedule: "연 2회",
    details: ["문서 작성 기초", "온라인 정보 활용"],
    accent: "from-[var(--color-terracotta-soft)]/20 via-[var(--color-cream)] to-[var(--color-cream-dark)]",
  },
];

const PROGRAM_SUB_PAGES = [
  { label: "상담사업", href: "/programs/counseling", english: "Counseling" },
  { label: "교육사업", href: "/programs/education", english: "Education", current: true },
  { label: "외국인봉사단", href: "/programs/volunteers", english: "Volunteers" },
  { label: "문화체험", href: "/programs/culture", english: "Culture" },
  { label: "기타사업", href: "/programs/others", english: "Others" },
];

export default function EducationPage() {
  return (
    <>
      <PageHero />
      <SubNavigation />
      <IntroSection />
      <ProgramsSection />
      <NoticeSection />
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
            Education
          </span>
        </nav>
        <div className="mt-12 grid grid-cols-1 gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <p className="font-[var(--font-display)] text-[12px] uppercase tracking-[0.3em] text-[var(--color-terracotta)] animate-fade-up">
              ─ About the Business
            </p>
            <h1 className="mt-6 font-[var(--font-serif)] text-[44px] font-medium leading-[1.05] tracking-[-0.02em] text-[var(--color-ink)] animate-fade-up sm:text-[60px] lg:text-[80px]">
              <span className="block">법인사업,</span>
              <span className="block">
                <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                  교육사업
                </em>
              </span>
            </h1>
          </div>
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
                    <span aria-hidden className="absolute inset-x-4 bottom-0 h-px bg-[var(--color-terracotta)]" />
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
        <blockquote className="font-[var(--font-serif)] text-[26px] leading-[1.5] tracking-[-0.01em] text-[var(--color-ink)] sm:text-[32px] md:text-[40px] md:leading-[1.45]">
          <span className="font-[var(--font-display)] text-5xl text-[var(--color-terracotta)]">“</span>{" "}
          사단법인 외국인과 동행은 한국에 거주하는 외국인들의 언어능력 향상과 능력 향상을 위해 다양한
          교육 프로그램을 실시하고 있습니다.
        </blockquote>
      </div>
    </section>
  );
}

function ProgramsSection() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {EDUCATION_PROGRAMS.map((program) => (
            <article
              key={program.code}
              className="group relative overflow-hidden border border-[var(--color-line)] bg-[var(--color-cream)] p-8 transition-all duration-500 hover:border-[var(--color-ink)] hover:shadow-[0_24px_40px_-20px_rgba(26,35,50,0.2)] lg:p-10"
            >
              <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${program.accent} opacity-55`} />
              <div className="flex items-baseline justify-between">
                <span className="font-[var(--font-display)] text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
                  {program.english}
                </span>
                <span className="font-[var(--font-display)] text-5xl font-light text-[var(--color-line)]">
                  {program.code}
                </span>
              </div>
              <h3 className="mt-8 font-[var(--font-serif)] text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
                {program.title}
              </h3>
              <p className="mt-2 text-[13px] font-medium text-[var(--color-terracotta)]">{program.schedule}</p>
              <ul className="mt-6 space-y-2 border-t border-[var(--color-line)] pt-5">
                {program.details.map((detail) => (
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

function NoticeSection() {
  return (
    <section className="bg-[var(--color-cream-dark)] py-16">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
        <div className="border-l-2 border-[var(--color-terracotta)] bg-[var(--color-cream)] p-6">
          <p className="text-[14px] leading-relaxed text-[var(--color-ink-soft)]">
            ※ 상기 교육 프로그램은 사업 추진 및 타 기관 협조에 따라 프로그램 일부가 조정 또는 변경이 될
            수 있습니다.
          </p>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-ink)] py-20 text-[var(--color-cream)]">
      <div className="relative mx-auto max-w-[1100px] px-6 lg:px-10">
        <h2 className="font-[var(--font-serif)] text-3xl md:text-5xl">
          교육 문의는 <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta-soft)]">언제든</em> 가능합니다.
        </h2>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <a href={`tel:${SITE_INFO.phone.replace(/-/g, "")}`} className="border border-[var(--color-cream)]/20 p-5">
            <p className="text-[11px] text-[var(--color-terracotta-soft)]">전화</p>
            <p className="mt-1">{SITE_INFO.phone}</p>
          </a>
          <a href={`mailto:${SITE_INFO.email}`} className="border border-[var(--color-cream)]/20 p-5">
            <p className="text-[11px] text-[var(--color-terracotta-soft)]">이메일</p>
            <p className="mt-1">{SITE_INFO.email}</p>
          </a>
          <div className="border border-[var(--color-cream)]/20 p-5">
            <p className="text-[11px] text-[var(--color-terracotta-soft)]">팩스</p>
            <p className="mt-1">{SITE_INFO.fax}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
