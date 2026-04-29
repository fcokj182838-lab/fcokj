import type { Metadata } from "next";
import Link from "next/link";
import { SITE_INFO } from "../../lib/site-config";

export const metadata: Metadata = {
  title: "문화체험 · 법인사업",
  description:
    "사단법인 외국인과 동행 문화체험 프로그램 안내입니다. 한국 전통의상, 전통혼례, 김장체험, 템플스테이 등 다양한 문화체험을 운영합니다.",
};

type CultureProgram = {
  code: string;
  title: string;
  english: string;
  category: string;
  accent: string;
};

const CULTURE_PROGRAMS: CultureProgram[] = [
  { code: "01", title: "한국 전통의상 체험", english: "Hanbok Experience", category: "전통문화", accent: "from-[var(--color-terracotta)]/30 via-[var(--color-terracotta-soft)]/15 to-[var(--color-cream)]" },
  { code: "02", title: "한국 전통혼례 관람", english: "Traditional Wedding", category: "전통문화", accent: "from-[var(--color-sage)]/35 via-[var(--color-cream)] to-[var(--color-cream-dark)]" },
  { code: "03", title: "한국 전통음식 만들기 체험", english: "Korean Food Class", category: "전통문화", accent: "from-[var(--color-ink)]/20 via-[var(--color-sage)]/15 to-[var(--color-ivory)]" },
  { code: "04", title: "한국 전통춤 체험", english: "Traditional Dance", category: "전통문화", accent: "from-[var(--color-terracotta-soft)]/30 via-[var(--color-cream)] to-[var(--color-sage)]/15" },
  { code: "05", title: "김장 체험", english: "Kimchi Making", category: "생활문화", accent: "from-[var(--color-cream-dark)] via-[var(--color-cream)] to-[var(--color-terracotta-soft)]/15" },
  { code: "06", title: "경주 엑스포 관람", english: "Gyeongju Expo", category: "지역문화", accent: "from-[var(--color-terracotta)]/25 via-[var(--color-cream)] to-[var(--color-ivory)]" },
  { code: "07", title: "불국사 템플스테이", english: "Temple Stay", category: "전통문화", accent: "from-[var(--color-sage)]/25 via-[var(--color-cream)] to-[var(--color-cream-dark)]" },
  { code: "08", title: "한국 산(남산, 보경사 등) 등반", english: "Mountain Hiking", category: "자연체험", accent: "from-[var(--color-ink)]/15 via-[var(--color-cream)] to-[var(--color-sage)]/15" },
  { code: "09", title: "한국수력원자력발전소 견학", english: "Power Plant Tour", category: "산업견학", accent: "from-[var(--color-terracotta-soft)]/20 via-[var(--color-cream)] to-[var(--color-cream-dark)]" },
  { code: "10", title: "양동마을 관람", english: "Yangdong Village", category: "역사문화", accent: "from-[var(--color-terracotta)]/22 via-[var(--color-cream)] to-[var(--color-ivory)]" },
  { code: "11", title: "울산 고래박물관 견학", english: "Whale Museum", category: "박물관", accent: "from-[var(--color-sage)]/20 via-[var(--color-cream)] to-[var(--color-cream-dark)]" },
  { code: "12", title: "경주박물관 견학", english: "Gyeongju Museum", category: "박물관", accent: "from-[var(--color-ink)]/12 via-[var(--color-cream)] to-[var(--color-sage)]/12" },
  { code: "13", title: "신라문화제 관람", english: "Silla Festival", category: "축제", accent: "from-[var(--color-terracotta-soft)]/25 via-[var(--color-cream)] to-[var(--color-cream-dark)]" },
  { code: "14", title: "부산 해양박물관 관람", english: "Maritime Museum", category: "박물관", accent: "from-[var(--color-sage)]/18 via-[var(--color-cream)] to-[var(--color-ivory)]" },
];

const PROGRAM_SUB_PAGES = [
  { label: "상담사업", href: "/programs/counseling", english: "Counseling" },
  { label: "교육사업", href: "/programs/education", english: "Education" },
  { label: "외국인봉사단", href: "/programs/volunteers", english: "Volunteers" },
  { label: "문화체험", href: "/programs/culture", english: "Culture", current: true },
  { label: "기타사업", href: "/programs/others", english: "Others" },
];

export default function CulturePage() {
  return (
    <>
      <PageHero />
      <SubNavigation />
      <IntroSection />
      <ProgramsSection />
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
        <nav aria-label="현재 위치" className="flex items-center gap-3 border-b border-[var(--color-line)] pb-6 animate-fade-in">
          <Link href="/" className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-terracotta)]">Home</Link>
          <span className="h-px w-6 bg-[var(--color-line)]" />
          <span className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-muted)]">Programs</span>
          <span className="h-px w-6 bg-[var(--color-line)]" />
          <span className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">Culture</span>
        </nav>
        <div className="mt-12 grid grid-cols-1 gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <p className="font-[var(--font-display)] text-[12px] uppercase tracking-[0.3em] text-[var(--color-terracotta)] animate-fade-up">─ About the Business</p>
            <h1 className="mt-6 font-[var(--font-serif)] text-[44px] font-medium leading-[1.05] tracking-[-0.02em] text-[var(--color-ink)] animate-fade-up sm:text-[60px] lg:text-[80px]">
              <span className="block">법인사업,</span>
              <span className="block"><em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">문화체험</em></span>
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
                    subPage.current ? "text-[var(--color-terracotta)]" : "text-[var(--color-ink-soft)] hover:text-[var(--color-terracotta)]"
                  }`}
                >
                  <span className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.25em] text-[var(--color-muted)]">0{index + 1}</span>
                  <span>{subPage.label}</span>
                  {subPage.current && <span aria-hidden className="absolute inset-x-4 bottom-0 h-px bg-[var(--color-terracotta)]" />}
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
        <blockquote className="font-[var(--font-serif)] text-[24px] leading-[1.6] tracking-[-0.01em] text-[var(--color-ink)] sm:text-[30px] md:text-[36px] md:leading-[1.5]">
          <span className="font-[var(--font-display)] text-5xl text-[var(--color-terracotta)]">“</span>{" "}
          외국인에게 한국문화에 대한 이해를 높이고자 다양한 문화체험을 실시하고 있습니다.
        </blockquote>
        <div className="mt-10 grid grid-cols-3 gap-4 md:gap-6">
          <Stat number="14" label="문화체험 프로그램" code="PROGRAMS" />
          <Stat number="전통·역사·자연" label="체험 영역" code="CATEGORY" />
          <Stat number="연중 운영" label="정기 활동" code="SCHEDULE" />
        </div>
      </div>
    </section>
  );
}

function Stat({ number, label, code }: { number: string; label: string; code: string }) {
  return (
    <div className="border-t border-[var(--color-ink)] pt-3">
      <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.25em] text-[var(--color-muted)]">{code}</p>
      <p className="mt-2 font-[var(--font-display)] text-3xl font-medium text-[var(--color-ink)] md:text-4xl">{number}</p>
      <p className="mt-1 text-[12px] tracking-tight text-[var(--color-ink-soft)]">{label}</p>
    </div>
  );
}

function ProgramsSection() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid grid-cols-1 items-end gap-6 border-b border-[var(--color-line)] pb-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">─ Culture Programs</p>
            <h2 className="mt-4 font-[var(--font-serif)] text-3xl font-medium leading-tight tracking-[-0.02em] text-[var(--color-ink)] md:text-5xl lg:text-6xl">
              열네 가지
              <br />
              <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">문화체험</em>
            </h2>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {CULTURE_PROGRAMS.map((program) => (
            <article key={program.code} className="group relative overflow-hidden border border-[var(--color-line)] bg-[var(--color-cream)] p-8 transition-all duration-500 hover:border-[var(--color-ink)] hover:shadow-[0_24px_40px_-20px_rgba(26,35,50,0.2)] lg:p-10">
              <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${program.accent} opacity-55`} />
              <div className="flex items-baseline justify-between">
                <span className="font-[var(--font-display)] text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--color-terracotta)]">{program.english}</span>
                <span className="font-[var(--font-display)] text-5xl font-light text-[var(--color-line)]">{program.code}</span>
              </div>
              <h3 className="mt-8 font-[var(--font-serif)] text-3xl font-semibold tracking-tight text-[var(--color-ink)]">{program.title}</h3>
              <p className="mt-2 text-[13px] font-medium text-[var(--color-terracotta)]">{program.category}</p>
            </article>
          ))}
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
          문화체험 문의는 <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta-soft)]">언제든</em> 가능합니다.
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
