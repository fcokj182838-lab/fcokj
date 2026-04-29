import type { Metadata } from "next";
import Link from "next/link";
import { SITE_INFO } from "../../lib/site-config";

export const metadata: Metadata = {
  title: "외국인봉사단 · 법인사업",
  description:
    "사단법인 외국인과 동행 외국인봉사단 안내입니다. 9개국 60명으로 구성된 봉사단이 매월 지역사회 봉사활동을 진행합니다.",
};

type VolunteerActivity = {
  code: string;
  title: string;
  english: string;
  description: string;
  accent: string;
};

const VOLUNTEER_ACTIVITIES: VolunteerActivity[] = [
  {
    code: "01",
    title: "지역미화활동",
    english: "Community Cleanup",
    description: "마을과 공공장소 환경정화 활동으로 깨끗한 지역사회를 만들어갑니다.",
    accent: "from-[var(--color-terracotta)]/30 via-[var(--color-terracotta-soft)]/15 to-[var(--color-cream)]",
  },
  {
    code: "02",
    title: "독거노인돕기 모금",
    english: "Fundraising",
    description: "지역의 취약계층 어르신을 위한 모금과 나눔 활동을 실천합니다.",
    accent: "from-[var(--color-sage)]/35 via-[var(--color-cream)] to-[var(--color-cream-dark)]",
  },
  {
    code: "03",
    title: "교통정리봉사",
    english: "Traffic Assistance",
    description: "안전한 통행 환경을 위해 행사 및 지역 현장에서 교통정리 봉사를 진행합니다.",
    accent: "from-[var(--color-ink)]/20 via-[var(--color-sage)]/15 to-[var(--color-ivory)]",
  },
  {
    code: "04",
    title: "법인 행사 자원봉사",
    english: "Event Volunteers",
    description: "법인 주관 행사 운영을 돕고 원활한 진행을 지원합니다.",
    accent: "from-[var(--color-terracotta-soft)]/30 via-[var(--color-cream)] to-[var(--color-sage)]/15",
  },
  {
    code: "05",
    title: "국가별 공동체 행사 지원",
    english: "Community Events",
    description: "국가별 공동체 행사를 지원해 내·외국인이 함께 어울리는 장을 만듭니다.",
    accent: "from-[var(--color-cream-dark)] via-[var(--color-cream)] to-[var(--color-terracotta-soft)]/15",
  },
  {
    code: "06",
    title: "범죄 예방",
    english: "Crime Prevention",
    description: "예방 중심의 캠페인과 안내 활동으로 안전한 지역문화를 조성합니다.",
    accent: "from-[var(--color-terracotta)]/25 via-[var(--color-cream)] to-[var(--color-ivory)]",
  },
];

const NATIONS = [
  "중국",
  "베트남",
  "캄보디아",
  "방글라데시",
  "스리랑카",
  "파키스탄",
  "인도네시아",
  "네팔",
  "태국",
];

const PROGRAM_SUB_PAGES = [
  { label: "상담사업", href: "/programs/counseling", english: "Counseling" },
  { label: "교육사업", href: "/programs/education", english: "Education" },
  { label: "외국인봉사단", href: "/programs/volunteers", english: "Volunteers", current: true },
  { label: "문화체험", href: "/programs/culture", english: "Culture" },
  { label: "기타사업", href: "/programs/others", english: "Others" },
];

export default function VolunteersPage() {
  return (
    <>
      <PageHero />
      <SubNavigation />
      <IntroSection />
      <ActivitiesSection />
      <MembershipSection />
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
            Volunteers
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
                  외국인봉사단
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
        <blockquote className="font-[var(--font-serif)] text-[24px] leading-[1.6] tracking-[-0.01em] text-[var(--color-ink)] sm:text-[30px] md:text-[36px] md:leading-[1.5]">
          <span className="font-[var(--font-display)] text-5xl text-[var(--color-terracotta)]">“</span>{" "}
          내·외국인이 공생하고 더불어 함께 살아가는 살기 좋은 지역을 만들기 위해 외국인봉사단을
          운영하고 있습니다.
        </blockquote>

        <p className="mt-8 max-w-3xl text-[15px] leading-[1.9] text-[var(--color-ink-soft)]">
          외국인에게는 지역사회를 함께 만들어간다는 공동체 의식을, 내국인에게는 봉사활동을 통해 외국인에
          대한 긍정적 인식을 확산하는 효과를 만들어가고 있습니다.
        </p>

        <div className="mt-10 grid grid-cols-3 gap-4 md:gap-6">
          <Stat number="09" label="참여 국가" code="NATIONS" />
          <Stat number="60" label="봉사단 구성원" code="MEMBERS" />
          <Stat number="월 1회" label="정기 봉사활동" code="SCHEDULE" />
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

function ActivitiesSection() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid grid-cols-1 items-end gap-6 border-b border-[var(--color-line)] pb-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              ─ Volunteer Activities
            </p>
            <h2 className="mt-4 font-[var(--font-serif)] text-3xl font-medium leading-tight tracking-[-0.02em] text-[var(--color-ink)] md:text-5xl lg:text-6xl">
              여섯 가지
              <br />
              <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                봉사활동
              </em>
            </h2>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {VOLUNTEER_ACTIVITIES.map((activity) => (
            <article
              key={activity.code}
              className="group relative overflow-hidden border border-[var(--color-line)] bg-[var(--color-cream)] p-8 transition-all duration-500 hover:border-[var(--color-ink)] hover:shadow-[0_24px_40px_-20px_rgba(26,35,50,0.2)] lg:p-10"
            >
              <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${activity.accent} opacity-55`} />
              <div className="flex items-baseline justify-between">
                <span className="font-[var(--font-display)] text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
                  {activity.english}
                </span>
                <span className="font-[var(--font-display)] text-5xl font-light text-[var(--color-line)]">
                  {activity.code}
                </span>
              </div>
              <h3 className="mt-8 font-[var(--font-serif)] text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
                {activity.title}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-ink-soft)] md:text-[15px]">
                {activity.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function MembershipSection() {
  return (
    <section className="bg-[var(--color-cream-dark)] py-20">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              ─ Membership
            </p>
            <h3 className="mt-4 font-[var(--font-serif)] text-3xl text-[var(--color-ink)]">봉사단 구성</h3>
          </div>
          <div className="md:col-span-8">
            <p className="text-[15px] leading-[1.85] text-[var(--color-ink-soft)]">
              사단법인 외국인과 동행 봉사단은 9개국에서 온 외국인근로자 및 다문화가정 구성원 총 60명으로
              운영됩니다.
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {NATIONS.map((nation) => (
                <li
                  key={nation}
                  className="inline-flex items-center border border-[var(--color-line)] bg-[var(--color-cream)] px-3 py-1.5 text-[13px] text-[var(--color-ink-soft)]"
                >
                  {nation}
                </li>
              ))}
            </ul>
          </div>
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
          봉사단 문의는 <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta-soft)]">언제든</em>{" "}
          가능합니다.
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
