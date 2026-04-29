import Link from "next/link";
import { SITE_INFO } from "./lib/site-config";

// 메인 홈페이지
// - Hero / 미션 / 4대 사업 / 액티비티 / 후원 CTA / 연락처 섹션 구성
export default function Home() {
  return (
    <>
      <HeroSection />
      <MissionSection />
      <ProgramsSection />
      <ActivitiesSection />
      <DonationCTASection />
      <ContactSection />
    </>
  );
}

/* ─────────────────────────────────────────────────────────
 *  Hero - 매거진 스타일 인트로
 * ──────────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* 배경 그래픽 */}
      <div className="paper-texture absolute inset-0 -z-10" />
      <div className="absolute -right-40 -top-20 -z-10 h-[600px] w-[600px] rounded-full bg-[var(--color-terracotta)]/8 blur-3xl" />
      <div className="absolute -left-32 top-40 -z-10 h-[500px] w-[500px] rounded-full bg-[var(--color-sage)]/10 blur-3xl" />

      <div className="mx-auto max-w-[1280px] px-6 pb-32 pt-20 lg:px-10 lg:pb-40 lg:pt-28">
        {/* 상단 메타 정보 */}
        <div
          className="flex flex-col gap-4 border-b border-[var(--color-line)] pb-6 md:flex-row md:items-end md:justify-between animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex items-center gap-4">
            <span className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-muted)]">
              Est. Gyeongju · Korea
            </span>
            <span className="h-px w-12 bg-[var(--color-line)]" />
            <span className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              No. 01 / 2026
            </span>
          </div>
          <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-muted)]">
            Foreigners · Companion · Korea
          </p>
        </div>

        {/* 메인 타이틀 */}
        <div className="mt-12 grid grid-cols-1 gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <h1
              className="font-[var(--font-serif)] text-[44px] font-medium leading-[1.05] tracking-[-0.02em] text-[var(--color-ink)] animate-fade-up sm:text-[64px] md:text-[80px] lg:text-[96px]"
              style={{ animationDelay: "0.2s" }}
            >
              <span className="block">함께 걷는</span>
              <span className="block">
                <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                  따뜻한
                </em>{" "}
                동행
              </span>
            </h1>

            <p
              className="mt-10 max-w-xl text-[15px] leading-[1.85] text-[var(--color-ink-soft)] animate-fade-up md:text-base"
              style={{ animationDelay: "0.4s" }}
            >
              한국에서 열심히 살아가는 외국인근로자의{" "}
              <strong className="font-semibold text-[var(--color-ink)]">
                인권보호와 복지증진
              </strong>
              을 도모합니다. 상담, 교육, 봉사, 문화체험 등 다양한 프로그램을 통해 외국인이 한국에서
              안정된 삶을 누릴 수 있도록 곁에서 동행합니다.
            </p>

            <div
              className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center animate-fade-up"
              style={{ animationDelay: "0.55s" }}
            >
              <Link
                href="/about"
                className="btn-primary group relative inline-flex items-center gap-2 overflow-hidden bg-[var(--color-ink)] px-7 py-3.5 text-sm font-semibold tracking-tight text-[var(--color-cream)]"
              >
                <span className="relative z-10">법인 소개 보기</span>
                <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </Link>
              <Link
                href="/programs/counseling"
                className="link-underline inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-[var(--color-ink)]"
              >
                상담 신청하기 <span aria-hidden>↗</span>
              </Link>
            </div>
          </div>

          {/* 우측 사이드 정보 카드 */}
          <aside
            className="space-y-8 self-end border-l border-[var(--color-line)] pl-8 animate-fade-up lg:col-span-4"
            style={{ animationDelay: "0.7s" }}
          >
            <p className="font-[var(--font-serif)] text-[15px] leading-[1.8] text-[var(--color-ink-soft)]">
              저희 법인은 한국에 거주하는 외국인이 겪을 수 있는 다양한 고충과 애로사항을 함께
              풀어가고, 더 나은 내일을 준비할 수 있도록{" "}
              <em className="font-medium text-[var(--color-terracotta)] not-italic">
                지원자가 아닌 동반자
              </em>
              로서 동행하고 있습니다.
            </p>

            <div className="grid grid-cols-3 gap-4">
              <Stat number="04" label="핵심 사업" />
              <Stat number="365" label="상시 상담" />
              <Stat number="∞" label="동행의 가치" />
            </div>
          </aside>
        </div>

        {/* 하단 데코 라벨 */}
        <div className="mt-20 flex items-center justify-between border-t border-[var(--color-line)] pt-6">
          <span className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-muted)]">
            Scroll to explore
          </span>
          <div className="h-12 w-px animate-pulse bg-gradient-to-b from-[var(--color-line)] to-transparent" />
        </div>
      </div>
    </section>
  );
}

// Hero 섹션의 통계 박스
function Stat({ number, label }: { number: string; label: string }) {
  return (
    <div className="border-t border-[var(--color-ink)] pt-3">
      <p className="font-[var(--font-display)] text-3xl font-medium text-[var(--color-ink)]">
        {number}
      </p>
      <p className="mt-1 text-[11px] tracking-tight text-[var(--color-muted)]">{label}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 *  미션 섹션 - 큰 인용구 스타일
 * ──────────────────────────────────────────────────────── */
function MissionSection() {
  return (
    <section className="relative bg-[var(--color-ivory)] py-28 lg:py-40">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-3">
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              ─ Our Mission
            </p>
            <p className="mt-3 font-[var(--font-serif)] text-lg font-semibold text-[var(--color-ink)]">
              우리의 약속
            </p>
          </div>

          <div className="md:col-span-9">
            <blockquote className="font-[var(--font-serif)] text-[28px] leading-[1.5] tracking-[-0.01em] text-[var(--color-ink)] sm:text-[32px] md:text-[40px] md:leading-[1.45]">
              <span className="font-[var(--font-display)] text-5xl text-[var(--color-terracotta)]">
                “
              </span>{" "}
              내·외국인이{" "}
              <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                공생
              </em>
              하고 더불어 함께 살아가는 살기 좋은 지역사회를 만듭니다. 외국인근로자가 한국에서
              안정된 생활의 틀을 마련하고{" "}
              <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                삶의 질
              </em>
              을 향상시킬 수 있도록 곁에서 동행합니다.
            </blockquote>

            <div className="mt-12 flex items-center gap-4">
              <div className="h-px w-16 bg-[var(--color-ink)]" />
              <p className="font-[var(--font-display)] text-[12px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                {SITE_INFO.englishName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
 *  사업소개 - 4대 핵심 사업 카드
 * ──────────────────────────────────────────────────────── */
const programs = [
  {
    number: "01",
    title: "상담사업",
    english: "Counseling",
    description:
      "한국 거주 외국인이 겪을 수 있는 다양한 고충과 애로사항에 대해 적극적으로 상담을 지원합니다.",
    href: "/programs/counseling",
    accent: "bg-[var(--color-terracotta)]/10 text-[var(--color-terracotta)]",
  },
  {
    number: "02",
    title: "교육사업",
    english: "Education",
    description:
      "외국인의 한국어 능력 및 직무 능력 향상을 위해 다양한 교육 프로그램을 운영합니다.",
    href: "/programs/education",
    accent: "bg-[var(--color-sage)]/15 text-[var(--color-sage)]",
  },
  {
    number: "03",
    title: "외국인봉사단",
    english: "Volunteers",
    description:
      "지역사회에서 내·외국인이 더불어 살아가는 살기 좋은 지역을 형성하기 위한 봉사단을 운영합니다.",
    href: "/programs/volunteers",
    accent: "bg-[var(--color-ink)]/8 text-[var(--color-ink)]",
  },
  {
    number: "04",
    title: "문화체험",
    english: "Culture",
    description:
      "외국인에게 한국문화에 대한 이해를 높이고자 다양한 문화체험 활동을 실시합니다.",
    href: "/programs/culture",
    accent: "bg-[var(--color-terracotta-soft)]/15 text-[var(--color-terracotta)]",
  },
];

function ProgramsSection() {
  return (
    <section className="relative py-28 lg:py-36">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        {/* 섹션 헤더 */}
        <div className="grid grid-cols-1 items-end gap-6 border-b border-[var(--color-line)] pb-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              ─ Our Programs
            </p>
            <h2 className="mt-4 font-[var(--font-serif)] text-4xl font-medium leading-tight tracking-[-0.02em] text-[var(--color-ink)] md:text-5xl lg:text-6xl">
              네 가지 동행,
              <br />
              <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                하나의 마음
              </em>
            </h2>
          </div>
          <div className="md:col-span-5">
            <p className="text-sm leading-relaxed text-[var(--color-ink-soft)] md:text-base">
              상담, 교육, 봉사, 문화체험. 외국인이 한국에서 살아가는 모든 순간에 함께합니다.
              필요한 도움이 무엇이든, 가장 가까운 곳에서 손을 내밉니다.
            </p>
          </div>
        </div>

        {/* 사업 카드 그리드 - 비대칭 레이아웃 */}
        <div className="mt-16 grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2 lg:gap-x-10 lg:gap-y-16">
          {programs.map((program, index) => (
            <Link
              key={program.number}
              href={program.href}
              className={`group relative flex flex-col ${
                index % 2 === 1 ? "md:translate-y-12" : ""
              }`}
            >
              <div className="relative overflow-hidden border border-[var(--color-line)] bg-[var(--color-ivory)] p-8 transition-all duration-500 group-hover:border-[var(--color-ink)] group-hover:shadow-[0_24px_40px_-20px_rgba(26,35,50,0.25)] lg:p-10">
                {/* 카드 헤더 */}
                <div className="flex items-baseline justify-between">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 font-[var(--font-display)] text-[11px] font-semibold uppercase tracking-[0.2em] ${program.accent}`}
                  >
                    {program.english}
                  </span>
                  <span className="font-[var(--font-display)] text-5xl font-light text-[var(--color-line)] transition-colors duration-500 group-hover:text-[var(--color-terracotta)]">
                    {program.number}
                  </span>
                </div>

                {/* 카드 본문 */}
                <h3 className="mt-10 font-[var(--font-serif)] text-3xl font-semibold tracking-tight text-[var(--color-ink)]">
                  {program.title}
                </h3>
                <p className="mt-4 text-[14px] leading-relaxed text-[var(--color-ink-soft)]">
                  {program.description}
                </p>

                {/* 카드 풋터 */}
                <div className="mt-10 flex items-center justify-between border-t border-[var(--color-line)] pt-6">
                  <span className="text-[13px] font-medium tracking-tight text-[var(--color-ink)]">
                    자세히 보기
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-line)] text-[var(--color-ink)] transition-all duration-500 group-hover:border-[var(--color-terracotta)] group-hover:bg-[var(--color-terracotta)] group-hover:text-[var(--color-ivory)]">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
 *  액티비티 갤러리 미리보기
 * ──────────────────────────────────────────────────────── */
const activities = [
  {
    tag: "교육",
    title: "한국어 회화반 운영",
    date: "2026.04",
    description: "초급부터 중급까지 단계별 한국어 회화 교실이 매주 진행됩니다.",
    accent: "from-[var(--color-terracotta)]/30 to-[var(--color-terracotta-soft)]/15",
  },
  {
    tag: "문화체험",
    title: "전통문화 한복 체험",
    date: "2026.03",
    description: "외국인들이 한국 전통의상을 직접 입어보고 문화를 체험했습니다.",
    accent: "from-[var(--color-sage)]/35 to-[var(--color-cream)]",
  },
  {
    tag: "봉사단",
    title: "지역사회 환경정화 활동",
    date: "2026.02",
    description: "외국인봉사단이 지역사회와 함께 환경정화 활동에 참여했습니다.",
    accent: "from-[var(--color-ink)]/25 to-[var(--color-ink)]/5",
  },
];

function ActivitiesSection() {
  return (
    <section className="relative bg-[var(--color-cream-dark)] py-28 lg:py-36">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="flex flex-col gap-6 border-b border-[var(--color-line)] pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              ─ Activities
            </p>
            <h2 className="mt-4 font-[var(--font-serif)] text-4xl font-medium leading-tight tracking-[-0.02em] text-[var(--color-ink)] md:text-5xl">
              살아 숨 쉬는{" "}
              <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                현장
              </em>
            </h2>
          </div>
          <Link
            href="/gallery/photos"
            className="link-underline inline-flex w-fit items-center gap-2 text-sm font-semibold tracking-tight text-[var(--color-ink)]"
          >
            전체 활동사진 보기 →
          </Link>
        </div>

        {/* 활동 카드 - 가로 스크롤 가능한 갤러리 그리드 */}
        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3">
          {activities.map((activity, index) => (
            <article
              key={activity.title}
              className="group flex flex-col"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* 이미지 영역 - 그라디언트 플레이스홀더 */}
              <div
                className={`relative aspect-[4/5] overflow-hidden bg-gradient-to-br ${activity.accent} transition-transform duration-700 group-hover:-translate-y-2`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-[var(--font-display)] text-[120px] font-light text-[var(--color-ivory)] opacity-40">
                    0{index + 1}
                  </span>
                </div>
                <div className="absolute left-4 top-4 flex items-center gap-2">
                  <span className="rounded-full bg-[var(--color-ivory)]/95 px-3 py-1 text-[11px] font-medium tracking-tight text-[var(--color-ink)]">
                    {activity.tag}
                  </span>
                </div>
                <div className="absolute bottom-4 right-4 font-[var(--font-display)] text-[11px] uppercase tracking-[0.2em] text-[var(--color-ivory)]">
                  {activity.date}
                </div>
              </div>

              {/* 텍스트 영역 */}
              <div className="mt-6">
                <h3 className="font-[var(--font-serif)] text-xl font-semibold tracking-tight text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-terracotta)]">
                  {activity.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[var(--color-ink-soft)]">
                  {activity.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
 *  후원 CTA - 큰 임팩트 섹션
 * ──────────────────────────────────────────────────────── */
function DonationCTASection() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-ink)] py-28 text-[var(--color-cream)] lg:py-40">
      {/* 배경 데코 */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -right-40 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-[var(--color-terracotta)]/40 blur-3xl" />
        <div className="absolute -left-20 -top-20 h-[400px] w-[400px] rounded-full bg-[var(--color-sage)]/30 blur-3xl" />
      </div>

      {/* 배경 텍스트 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 left-0 right-0 select-none whitespace-nowrap text-center font-[var(--font-display)] text-[200px] font-light italic leading-none text-[var(--color-cream)]/5 md:text-[320px]"
      >
        together.
      </div>

      <div className="relative mx-auto max-w-[1100px] px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-7">
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta-soft)]">
              ─ Become a Companion
            </p>
            <h2 className="mt-6 font-[var(--font-serif)] text-4xl font-medium leading-[1.15] tracking-[-0.02em] md:text-6xl lg:text-7xl">
              여러분의{" "}
              <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta-soft)]">
                작은 힘
              </em>
              이
              <br />
              많은 이들에게
              <br />큰 힘이 됩니다.
            </h2>
            <p className="mt-8 max-w-lg text-[15px] leading-[1.8] text-[var(--color-cream)]/75">
              후원은 외국인근로자가 한국에서 안정적으로 정착하고, 자신의 삶을 가꾸어 갈 수 있는
              가장 직접적인 동행의 방법입니다. 작은 발걸음이 모여 더 나은 내일을 만듭니다.
            </p>
          </div>

          <div className="flex flex-col justify-end md:col-span-5">
            <div className="space-y-4">
              <Link
                href="/support"
                className="group flex items-center justify-between border-b border-[var(--color-cream)]/30 py-5 transition-colors hover:border-[var(--color-terracotta-soft)]"
              >
                <div>
                  <span className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.3em] text-[var(--color-terracotta-soft)]">
                    01
                  </span>
                  <p className="mt-1 font-[var(--font-serif)] text-2xl font-medium tracking-tight">
                    정기 후원
                  </p>
                </div>
                <span className="text-2xl transition-transform duration-300 group-hover:translate-x-2">
                  →
                </span>
              </Link>
              <Link
                href="/support"
                className="group flex items-center justify-between border-b border-[var(--color-cream)]/30 py-5 transition-colors hover:border-[var(--color-terracotta-soft)]"
              >
                <div>
                  <span className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.3em] text-[var(--color-terracotta-soft)]">
                    02
                  </span>
                  <p className="mt-1 font-[var(--font-serif)] text-2xl font-medium tracking-tight">
                    일시 후원
                  </p>
                </div>
                <span className="text-2xl transition-transform duration-300 group-hover:translate-x-2">
                  →
                </span>
              </Link>
              <Link
                href="/programs/volunteers"
                className="group flex items-center justify-between border-b border-[var(--color-cream)]/30 py-5 transition-colors hover:border-[var(--color-terracotta-soft)]"
              >
                <div>
                  <span className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.3em] text-[var(--color-terracotta-soft)]">
                    03
                  </span>
                  <p className="mt-1 font-[var(--font-serif)] text-2xl font-medium tracking-tight">
                    봉사 참여
                  </p>
                </div>
                <span className="text-2xl transition-transform duration-300 group-hover:translate-x-2">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
 *  연락처 섹션 - 푸터 위 인포 블록
 * ──────────────────────────────────────────────────────── */
function ContactSection() {
  const items = [
    { label: "교육장 주소", value: SITE_INFO.address, code: "ADDRESS" },
    { label: "전화 / 팩스", value: `${SITE_INFO.phone}\n${SITE_INFO.fax}`, code: "TEL/FAX" },
    {
      label: "이메일 / 카페",
      value: `${SITE_INFO.email}\n${SITE_INFO.cafe.replace("http://", "")}`,
      code: "MAIL/CAFE",
    },
  ];

  return (
    <section className="relative bg-[var(--color-cream)] py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              ─ Visit & Contact
            </p>
            <h2 className="mt-4 font-[var(--font-serif)] text-4xl font-medium leading-tight tracking-[-0.02em] text-[var(--color-ink)] md:text-5xl">
              가까이에서
              <br />
              <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                만나요
              </em>
            </h2>
            <Link
              href="/about/location"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-[var(--color-ink)] link-underline"
            >
              찾아오시는 길 →
            </Link>
          </div>

          <div className="md:col-span-8">
            <div className="space-y-px bg-[var(--color-line)]">
              {items.map((item) => (
                <div
                  key={item.code}
                  className="flex flex-col gap-2 bg-[var(--color-cream)] py-7 md:flex-row md:items-baseline md:gap-12"
                >
                  <div className="md:w-32">
                    <span className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                      {item.code}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-[12px] tracking-tight text-[var(--color-muted)]">
                      {item.label}
                    </p>
                    <p className="mt-1 whitespace-pre-line font-[var(--font-serif)] text-lg font-medium text-[var(--color-ink)] md:text-xl">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
