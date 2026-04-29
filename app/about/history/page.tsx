import type { Metadata } from "next";
import Link from "next/link";

// 법인소개 - 연혁 페이지
// - 원본 fcokj.org/intro2 의 연혁을 매거진 타임라인 스타일로 재구성
export const metadata: Metadata = {
  title: "연혁 · 법인소개",
  description:
    "사단법인 외국인과 동행은 2011년 경주외국인센터로 시작하여 외국인근로자의 인권보호와 복지증진을 위한 발자취를 이어오고 있습니다.",
};

/* ─────────────────────────────────────────────────────────
 *  연혁 데이터 (원본: fcokj.org/intro2)
 * ──────────────────────────────────────────────────────── */
type HistoryEvent = {
  month: string;
  title: string;
  description?: string;
  highlight?: boolean; // 주요 마일스톤 강조 여부
};

type HistoryYear = {
  year: string;
  caption: string;
  events: HistoryEvent[];
};

const HISTORY_TIMELINE: HistoryYear[] = [
  {
    year: "2020",
    caption: "새 이름으로의 도약",
    events: [
      {
        month: "11",
        title: "법인 상호 변경",
        description: "사단법인 외국인과 동행으로 새롭게 출발",
        highlight: true,
      },
    ],
  },
  {
    year: "2017",
    caption: "지원 영역의 확장",
    events: [
      {
        month: "07",
        title: "중국동포 조기적응프로그램 운영기관 선정",
        description: "법무부 울산출입국사무소",
      },
    ],
  },
  {
    year: "2016",
    caption: "공로의 인정",
    events: [
      {
        month: "05",
        title: "행정자치부장관 표창 수여",
        description: "지역사회 공헌에 대한 정부 표창",
        highlight: true,
      },
    ],
  },
  {
    year: "2015",
    caption: "정책 파트너로의 성장",
    events: [
      {
        month: "01",
        title: "이민자 조기적응프로그램 운영기관 선정",
        description: "법무부 울산출입국사무소",
      },
      {
        month: "12",
        title: "사회통합프로그램 일반운영기관 선정",
        description: "법무부 울산출입국사무소",
      },
    ],
  },
  {
    year: "2014",
    caption: "공식 단체 등록",
    events: [
      {
        month: "12",
        title: "경상북도 비영리민간단체 등록",
      },
    ],
  },
  {
    year: "2013",
    caption: "법인의 토대를 다진 한 해",
    events: [
      {
        month: "01",
        title: "경주외국인센터 이전",
        description: "경주시 외동읍 입실리로 새 보금자리 마련",
      },
      {
        month: "04",
        title: "경주경찰서 ‘외국인 도움센터’ 지정",
      },
      {
        month: "10",
        title: "고용노동부 사단법인 인가",
        description: "사단법인 경주외국인센터로 정식 출범",
        highlight: true,
      },
      {
        month: "12",
        title: "한국산업인력공단 ‘소지역 상담센터’ 선정",
      },
      {
        month: "12",
        title: "기획재정부 ‘지정기부금 단체’ 선정",
      },
    ],
  },
  {
    year: "2011",
    caption: "동행의 시작",
    events: [
      {
        month: "11",
        title: "경주외국인센터 개소",
        description: "경주시 노동동에서 첫 발걸음",
        highlight: true,
      },
    ],
  },
];

const ABOUT_SUB_PAGES = [
  { label: "인사말", href: "/about", english: "Greeting" },
  { label: "연혁", href: "/about/history", english: "History", current: true },
  { label: "시설현황", href: "/about/facilities", english: "Facilities" },
  { label: "찾아오시는 길", href: "/about/location", english: "Location" },
];

const NEXT_PAGES = [
  {
    label: "인사말",
    english: "Greeting",
    href: "/about",
    description: "이사장이 전하는 따뜻한 동행의 마음을 만나보세요.",
  },
  {
    label: "시설현황",
    english: "Facilities",
    href: "/about/facilities",
    description: "교육장과 상담실 등 법인의 공간을 안내합니다.",
  },
  {
    label: "찾아오시는 길",
    english: "Location",
    href: "/about/location",
    description: "외동읍 입실리 교육장으로 오시는 길을 자세히 소개합니다.",
  },
];

export default function AboutHistoryPage() {
  return (
    <>
      <PageHero />
      <SubNavigation />
      <TimelineIntroSection />
      <TimelineSection />
      <MilestonesSection />
      <NextStepsSection />
    </>
  );
}

/* ─────────────────────────────────────────────────────────
 *  페이지 히어로
 * ──────────────────────────────────────────────────────── */
function PageHero() {
  // 가장 오래된 연도와 가장 최근 연도 추출 (운영 햇수 계산용)
  const oldestYear = Number(HISTORY_TIMELINE[HISTORY_TIMELINE.length - 1].year);
  const totalYears = new Date().getFullYear() - oldestYear;

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
          <Link
            href="/about"
            className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-terracotta)]"
          >
            About
          </Link>
          <span className="h-px w-6 bg-[var(--color-line)]" />
          <span className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
            History
          </span>
        </nav>

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
                  연혁
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
                {oldestYear}년
              </em>
              부터 약 {totalYears}여 년의 시간 동안 외국인근로자 곁에서 묵묵히 동행해 온 발자취를
              담았습니다.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
 *  법인소개 하위 메뉴 네비게이션 (탭)
 * ──────────────────────────────────────────────────────── */
function SubNavigation() {
  return (
    <section className="sticky top-20 z-30 border-y border-[var(--color-line)] bg-[var(--color-cream)]/85 backdrop-blur-md">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <nav aria-label="법인소개 하위 메뉴" className="-mx-6 overflow-x-auto px-6 lg:mx-0 lg:px-0">
          <ul className="flex min-w-max items-stretch gap-1 py-1 lg:min-w-0 lg:gap-2">
            {ABOUT_SUB_PAGES.map((subPage, index) => (
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

/* ─────────────────────────────────────────────────────────
 *  타임라인 인트로 - 큰 숫자 + 인용구
 * ──────────────────────────────────────────────────────── */
function TimelineIntroSection() {
  const totalEventCount = HISTORY_TIMELINE.reduce(
    (sum, year) => sum + year.events.length,
    0,
  );
  const totalYearCount = HISTORY_TIMELINE.length;
  const oldestYear = HISTORY_TIMELINE[HISTORY_TIMELINE.length - 1].year;
  const latestYear = HISTORY_TIMELINE[0].year;

  return (
    <section className="relative bg-[var(--color-ivory)] py-24 lg:py-32">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          {/* 좌측 라벨 */}
          <div className="md:col-span-3">
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              ─ Our Journey
            </p>
            <p className="mt-3 font-[var(--font-serif)] text-lg font-semibold text-[var(--color-ink)]">
              걸어온 발자취
            </p>
          </div>

          {/* 인용구 */}
          <div className="md:col-span-9">
            <blockquote className="font-[var(--font-serif)] text-[26px] leading-[1.5] tracking-[-0.01em] text-[var(--color-ink)] sm:text-[32px] md:text-[40px] md:leading-[1.45]">
              <span className="font-[var(--font-display)] text-5xl text-[var(--color-terracotta)]">
                “
              </span>{" "}
              {oldestYear}년 경주의 작은 사무실에서 시작된 동행은,{" "}
              <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                {totalYearCount}개의 해
              </em>
              를 거치며 외국인근로자 곁에서 묵묵히 자리를 지켜왔습니다.
            </blockquote>

            {/* 통계 카드 3개 */}
            <div className="mt-12 grid grid-cols-3 gap-4 md:gap-6">
              <Stat number={oldestYear} label="시작한 해" code="EST." />
              <Stat
                number={String(totalEventCount).padStart(2, "0")}
                label="주요 발자취"
                code="MILESTONES"
              />
              <Stat number={latestYear} label="이어가는 동행" code="PRESENT" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({
  number,
  label,
  code,
}: {
  number: string | number;
  label: string;
  code: string;
}) {
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

/* ─────────────────────────────────────────────────────────
 *  메인 타임라인 - 매거진 스타일 연도별 발자취
 * ──────────────────────────────────────────────────────── */
function TimelineSection() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        {/* 섹션 헤더 */}
        <div className="grid grid-cols-1 items-end gap-6 border-b border-[var(--color-line)] pb-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              ─ Timeline
            </p>
            <h2 className="mt-4 font-[var(--font-serif)] text-3xl font-medium leading-tight tracking-[-0.02em] text-[var(--color-ink)] md:text-5xl lg:text-6xl">
              연도별
              <br />
              <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                발자취
              </em>
            </h2>
          </div>
          <div className="md:col-span-5">
            <p className="text-sm leading-relaxed text-[var(--color-ink-soft)] md:text-base">
              한 걸음 한 걸음이 모여 오늘의 동행이 되었습니다. 가장 최근의 발걸음부터 거슬러 올라가
              지난 시간을 되짚어 봅니다.
            </p>
          </div>
        </div>

        {/* 타임라인 본문 */}
        <ol className="mt-16 space-y-20 lg:space-y-28">
          {HISTORY_TIMELINE.map((yearGroup, yearIndex) => (
            <YearBlock
              key={yearGroup.year}
              yearGroup={yearGroup}
              isFirst={yearIndex === 0}
              isLast={yearIndex === HISTORY_TIMELINE.length - 1}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

function YearBlock({
  yearGroup,
  isFirst,
  isLast,
}: {
  yearGroup: HistoryYear;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <li className="relative grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
      {/* 좌측 - 연도 헤더 */}
      <div className="md:col-span-4 lg:col-span-3">
        <div className="md:sticky md:top-44">
          <span className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
            {isLast ? "Origin" : isFirst ? "Latest" : `Year · ${yearGroup.year}`}
          </span>
          <p className="mt-3 font-[var(--font-display)] text-[72px] font-light leading-none tracking-tight text-[var(--color-ink)] md:text-[88px] lg:text-[104px]">
            {yearGroup.year}
          </p>
          <p className="mt-4 font-[var(--font-serif)] text-base font-medium text-[var(--color-ink-soft)] md:text-lg">
            {yearGroup.caption}
          </p>
          <span
            aria-hidden
            className="mt-6 block h-px w-16 bg-[var(--color-terracotta)]"
          />
        </div>
      </div>

      {/* 우측 - 이벤트 목록 (수직선 + 카드) */}
      <div className="relative md:col-span-8 lg:col-span-9">
        {/* 수직 연결선 */}
        <span
          aria-hidden
          className="absolute left-[7px] top-2 bottom-2 w-px bg-[var(--color-line)]"
        />

        <ul className="space-y-8">
          {yearGroup.events.map((event, eventIndex) => (
            <EventCard
              key={`${yearGroup.year}-${event.month}-${eventIndex}`}
              event={event}
            />
          ))}
        </ul>
      </div>
    </li>
  );
}

function EventCard({ event }: { event: HistoryEvent }) {
  return (
    <li className="relative pl-8">
      {/* 타임라인 마커 */}
      <span
        aria-hidden
        className={`absolute left-0 top-2 flex h-[15px] w-[15px] items-center justify-center rounded-full ${
          event.highlight
            ? "bg-[var(--color-terracotta)] ring-4 ring-[var(--color-terracotta)]/15"
            : "bg-[var(--color-cream)] ring-1 ring-[var(--color-line)]"
        }`}
      >
        {event.highlight && (
          <span className="block h-[5px] w-[5px] rounded-full bg-[var(--color-cream)]" />
        )}
      </span>

      {/* 이벤트 본문 카드 */}
      <article
        className={`group relative overflow-hidden border bg-[var(--color-cream)] p-6 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_24px_40px_-24px_rgba(26,35,50,0.18)] lg:p-8 ${
          event.highlight
            ? "border-[var(--color-terracotta)]/30 bg-gradient-to-br from-[var(--color-cream)] to-[var(--color-terracotta-soft)]/8"
            : "border-[var(--color-line)] hover:border-[var(--color-ink)]"
        }`}
      >
        {/* 상단 메타 - 월 + 하이라이트 배지 */}
        <div className="flex items-center justify-between">
          <span className="font-[var(--font-display)] text-[12px] font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
            <em className="not-italic text-[var(--color-terracotta)]">{event.month}</em>월
          </span>
          {event.highlight && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-terracotta)]/12 px-3 py-1 font-[var(--font-display)] text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--color-terracotta)]">
              <span className="block h-1.5 w-1.5 rounded-full bg-[var(--color-terracotta)]" />
              Milestone
            </span>
          )}
        </div>

        {/* 타이틀 */}
        <h3 className="mt-5 font-[var(--font-serif)] text-xl font-semibold leading-snug tracking-tight text-[var(--color-ink)] md:text-2xl">
          {event.title}
        </h3>

        {/* 설명 (옵션) */}
        {event.description && (
          <p className="mt-3 text-[14px] leading-relaxed text-[var(--color-ink-soft)] md:text-[15px]">
            {event.description}
          </p>
        )}
      </article>
    </li>
  );
}

/* ─────────────────────────────────────────────────────────
 *  주요 마일스톤 4개 - 큰 카드로 강조
 * ──────────────────────────────────────────────────────── */
const MILESTONE_HIGHLIGHTS = [
  {
    code: "01",
    year: "2011",
    label: "동행의 시작",
    title: "경주외국인센터 개소",
    description: "경주시 노동동에서 첫 발걸음을 떼며 외국인근로자 지원 활동을 시작했습니다.",
  },
  {
    code: "02",
    year: "2013",
    label: "정식 법인 인가",
    title: "고용노동부 사단법인 인가",
    description: "사단법인 경주외국인센터로 정식 출범하며 활동의 토대를 다졌습니다.",
  },
  {
    code: "03",
    year: "2016",
    label: "공로의 인정",
    title: "행정자치부장관 표창",
    description: "지역사회 공헌과 외국인 지원 활동의 성과를 인정받아 정부 표창을 수여받았습니다.",
  },
  {
    code: "04",
    year: "2020",
    label: "새 이름의 출발",
    title: "법인 상호 변경",
    description: "사단법인 외국인과 동행으로 이름을 바꾸어 새로운 비전과 함께 나아갑니다.",
  },
];

function MilestonesSection() {
  return (
    <section className="relative bg-[var(--color-cream-dark)] py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid grid-cols-1 items-end gap-6 border-b border-[var(--color-line)] pb-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              ─ Key Milestones
            </p>
            <h2 className="mt-4 font-[var(--font-serif)] text-3xl font-medium leading-tight tracking-[-0.02em] text-[var(--color-ink)] md:text-5xl">
              네 개의{" "}
              <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                전환점
              </em>
            </h2>
          </div>
          <div className="md:col-span-5">
            <p className="text-sm leading-relaxed text-[var(--color-ink-soft)] md:text-base">
              긴 여정 속에서 법인의 정체성과 방향을 새롭게 빚어낸 결정적인 순간들입니다.
            </p>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {MILESTONE_HIGHLIGHTS.map((milestone) => (
            <article
              key={milestone.code}
              className="group relative flex flex-col overflow-hidden border border-[var(--color-line)] bg-[var(--color-cream)] p-8 transition-all duration-500 hover:border-[var(--color-ink)] hover:shadow-[0_24px_40px_-20px_rgba(26,35,50,0.2)] lg:p-10"
            >
              {/* 배경 데코 - 큰 연도 숫자 */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-4 -top-6 select-none font-[var(--font-display)] text-[140px] font-light leading-none text-[var(--color-line)]/40 transition-colors duration-500 group-hover:text-[var(--color-terracotta)]/15 lg:text-[180px]"
              >
                {milestone.year}
              </span>

              <div className="relative">
                <span className="font-[var(--font-display)] text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
                  {milestone.code} · {milestone.label}
                </span>

                <h3 className="mt-8 font-[var(--font-serif)] text-2xl font-semibold leading-snug tracking-tight text-[var(--color-ink)] md:text-3xl">
                  {milestone.title}
                </h3>

                <p className="mt-4 max-w-md text-[14px] leading-relaxed text-[var(--color-ink-soft)] md:text-[15px]">
                  {milestone.description}
                </p>

                <span className="mt-10 inline-flex items-center gap-2 border-t border-[var(--color-line)] pt-5 font-[var(--font-display)] text-[12px] uppercase tracking-[0.25em] text-[var(--color-ink)]">
                  <span className="font-medium">{milestone.year}</span>
                  <span className="h-px w-8 bg-[var(--color-line)]" />
                  <span className="text-[var(--color-muted)]">{milestone.label}</span>
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
 *  다음 단계 안내 - 다른 법인소개 페이지로의 카드
 * ──────────────────────────────────────────────────────── */
function NextStepsSection() {
  return (
    <section className="relative py-24 lg:py-32">
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
              className="group relative flex flex-col border border-[var(--color-line)] bg-[var(--color-ivory)] p-8 transition-all duration-500 hover:border-[var(--color-ink)] hover:shadow-[0_24px_40px_-20px_rgba(26,35,50,0.2)] lg:p-10"
            >
              <span className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.25em] text-[var(--color-terracotta)]">
                0{index + 1} · {nextPage.english}
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
