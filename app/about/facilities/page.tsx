import type { Metadata } from "next";
import Link from "next/link";
import { SITE_INFO } from "../../lib/site-config";

// 법인소개 - 시설현황 페이지
// - 원본 fcokj.org/intro3 의 6개 공간 + 시설배치도 구성을 매거진 그리드로 재구성
export const metadata: Metadata = {
  title: "시설현황 · 법인소개",
  description:
    "사단법인 외국인과 동행의 교육장 공간을 안내합니다. 사무실·상담실, 제1·2강의실, 휴게공간 등 외국인근로자를 위한 시설을 소개합니다.",
};

/* ─────────────────────────────────────────────────────────
 *  시설 데이터 (원본: fcokj.org/intro3)
 * ──────────────────────────────────────────────────────── */
type Facility = {
  code: string;
  name: string;
  english: string;
  category: string;
  description: string;
  features: string[];
  // 카드 그라디언트 - 사진 대체용 시각 톤 (홈페이지 ActivitiesSection 패턴과 동일)
  accent: string;
  // 카드 비율 (그리드 비대칭 강조용)
  span: "regular" | "wide" | "tall";
};

const FACILITIES: Facility[] = [
  {
    code: "01",
    name: "법인 외부 전경",
    english: "Exterior",
    category: "Building",
    description:
      "경주시 외동읍 입실로 1길에 자리한 법인 건물 2층 전체에 교육장과 상담 공간이 마련되어 있습니다.",
    features: ["접근성 좋은 외동읍 중심지", "건물 2층 전 층 사용", "주차 공간 확보"],
    accent: "from-[var(--color-terracotta)]/35 via-[var(--color-terracotta-soft)]/20 to-[var(--color-cream)]",
    span: "wide",
  },
  {
    code: "02",
    name: "사무실 / 상담실",
    english: "Office & Counseling",
    category: "Work · 1:1",
    description:
      "법인 운영 업무가 이루어지는 사무 공간이자, 외국인근로자가 편안하게 고충을 나눌 수 있는 1:1 상담실입니다.",
    features: ["1:1 비밀 상담 가능", "다국어 자료 비치", "문서 발급 데스크"],
    accent: "from-[var(--color-sage)]/40 via-[var(--color-cream)] to-[var(--color-cream-dark)]",
    span: "regular",
  },
  {
    code: "03",
    name: "제 1 강의실",
    english: "Classroom No. 1",
    category: "Education",
    description:
      "한국어 교실, 사회통합프로그램 등이 진행되는 메인 강의실입니다. 다양한 단계의 학습이 동시에 이루어지는 공간입니다.",
    features: ["다인원 수업 가능", "프로젝터·화이트보드 구비", "학습 교재 비치"],
    accent: "from-[var(--color-ink)]/25 via-[var(--color-sage)]/20 to-[var(--color-ivory)]",
    span: "tall",
  },
  {
    code: "04",
    name: "제 2 강의실",
    english: "Classroom No. 2",
    category: "Education",
    description:
      "소그룹 수업과 워크숍, 직무 능력 향상 교육이 운영되는 보조 강의실입니다. 집중 학습에 최적화되어 있습니다.",
    features: ["소그룹 집중 학습", "유연한 좌석 배치", "조용한 학습 환경"],
    accent: "from-[var(--color-terracotta-soft)]/30 via-[var(--color-cream)] to-[var(--color-sage)]/15",
    span: "regular",
  },
  {
    code: "05",
    name: "휴게 공간 A",
    english: "Lounge A",
    category: "Rest",
    description:
      "수업과 상담 사이, 잠시 숨을 고를 수 있는 따뜻한 분위기의 휴게 공간입니다. 차 한 잔과 함께 쉬어가는 자리입니다.",
    features: ["편안한 좌석", "음료 자유 이용", "서로의 이야기 나누기"],
    accent: "from-[var(--color-cream-dark)] via-[var(--color-cream)] to-[var(--color-terracotta-soft)]/15",
    span: "regular",
  },
  {
    code: "06",
    name: "휴게 공간 B",
    english: "Lounge B",
    category: "Rest",
    description:
      "외국인봉사단, 문화체험 등 모임이 이루어지는 또 하나의 따뜻한 공간입니다. 자유로운 만남과 교류의 장입니다.",
    features: ["커뮤니티 모임 공간", "자율적 사용 가능", "행사·이벤트 활용"],
    accent: "from-[var(--color-ivory)] via-[var(--color-sage)]/25 to-[var(--color-cream-dark)]",
    span: "regular",
  },
];

const ABOUT_SUB_PAGES = [
  { label: "인사말", href: "/about", english: "Greeting" },
  { label: "연혁", href: "/about/history", english: "History" },
  { label: "시설현황", href: "/about/facilities", english: "Facilities", current: true },
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
    label: "연혁",
    english: "History",
    href: "/about/history",
    description: "법인이 걸어온 길과 주요 발자취를 한눈에 확인하실 수 있습니다.",
  },
  {
    label: "찾아오시는 길",
    english: "Location",
    href: "/about/location",
    description: "외동읍 입실리 교육장으로 오시는 길을 자세히 소개합니다.",
  },
];

export default function AboutFacilitiesPage() {
  return (
    <>
      <PageHero />
      <SubNavigation />
      <FacilitiesIntroSection />
      <FacilitiesGallerySection />
      <FloorPlanSection />
      <NextStepsSection />
    </>
  );
}

/* ─────────────────────────────────────────────────────────
 *  페이지 히어로
 * ──────────────────────────────────────────────────────── */
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
          <Link
            href="/about"
            className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-muted)] transition-colors hover:text-[var(--color-terracotta)]"
          >
            About
          </Link>
          <span className="h-px w-6 bg-[var(--color-line)]" />
          <span className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
            Facilities
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
                  시설현황
                </em>
              </span>
            </h1>
          </div>

          <aside
            className="self-end border-l border-[var(--color-line)] pl-8 animate-fade-up lg:col-span-4"
            style={{ animationDelay: "0.4s" }}
          >
            <p className="font-[var(--font-serif)] text-[15px] leading-[1.85] text-[var(--color-ink-soft)]">
              경주{" "}
              <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                외동읍 교육장
              </em>
              은 상담·교육·휴식이 한 곳에서 이루어지는 따뜻한 동행의 거점입니다.
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
 *  시설 인트로 - 큰 인용구 + 통계
 * ──────────────────────────────────────────────────────── */
function FacilitiesIntroSection() {
  // 카테고리 중복 제거하여 유형 갯수 산출
  const uniqueCategoryCount = new Set(FACILITIES.map((f) => f.category)).size;

  return (
    <section className="relative bg-[var(--color-ivory)] py-24 lg:py-32">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-3">
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              ─ Our Spaces
            </p>
            <p className="mt-3 font-[var(--font-serif)] text-lg font-semibold text-[var(--color-ink)]">
              교육장 안내
            </p>
          </div>

          <div className="md:col-span-9">
            <blockquote className="font-[var(--font-serif)] text-[26px] leading-[1.5] tracking-[-0.01em] text-[var(--color-ink)] sm:text-[32px] md:text-[40px] md:leading-[1.45]">
              <span className="font-[var(--font-display)] text-5xl text-[var(--color-terracotta)]">
                “
              </span>{" "}
              상담실에서 오가는 진심,{" "}
              <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                강의실
              </em>
              에서 익혀가는 한국어, 휴게공간에서 나누는 따뜻한 차 한 잔. 이 모든 순간이 모여{" "}
              <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                동행의 공간
              </em>
              이 됩니다.
            </blockquote>

            <div className="mt-12 grid grid-cols-3 gap-4 md:gap-6">
              <Stat number={String(FACILITIES.length).padStart(2, "0")} label="개의 공간" code="ROOMS" />
              <Stat number={String(uniqueCategoryCount).padStart(2, "0")} label="용도 유형" code="CATEGORIES" />
              <Stat number="2F" label="건물 2층 전체" code="FLOOR" />
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
  number: string;
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
 *  시설 갤러리 - 비대칭 그리드 카드
 * ──────────────────────────────────────────────────────── */
function FacilitiesGallerySection() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid grid-cols-1 items-end gap-6 border-b border-[var(--color-line)] pb-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              ─ Gallery
            </p>
            <h2 className="mt-4 font-[var(--font-serif)] text-3xl font-medium leading-tight tracking-[-0.02em] text-[var(--color-ink)] md:text-5xl lg:text-6xl">
              여섯 개의
              <br />
              <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                동행의 공간
              </em>
            </h2>
          </div>
          <div className="md:col-span-5">
            <p className="text-sm leading-relaxed text-[var(--color-ink-soft)] md:text-base">
              외부 전경부터 강의실, 휴게 공간까지. 한 분 한 분이 편안하게 머무를 수 있도록 마련된
              공간들을 소개합니다.
            </p>
          </div>
        </div>

        {/* 6개 시설 - 비대칭 매거진 그리드 */}
        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-6 md:gap-8 lg:gap-10">
          {FACILITIES.map((facility, index) => (
            <FacilityCard key={facility.code} facility={facility} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FacilityCard({ facility, index }: { facility: Facility; index: number }) {
  // 비대칭 그리드 배치 - wide는 6칼럼, regular/tall은 3칼럼 차지
  const colSpanClass =
    facility.span === "wide" ? "md:col-span-6" : "md:col-span-3";

  // 첫 번째(외부 전경)는 더 큰 비율로
  const aspectClass =
    facility.span === "wide"
      ? "aspect-[16/9] md:aspect-[21/9]"
      : facility.span === "tall"
        ? "aspect-[3/4]"
        : "aspect-[4/3]";

  return (
    <article className={`group flex flex-col ${colSpanClass}`}>
      {/* 이미지 영역 - 그라디언트 플레이스홀더 */}
      <div
        className={`relative ${aspectClass} overflow-hidden bg-gradient-to-br ${facility.accent} transition-transform duration-700 group-hover:-translate-y-1`}
      >
        {/* 코드 워터마크 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-[var(--font-display)] text-[140px] font-light leading-none text-[var(--color-ivory)] opacity-35 lg:text-[180px]">
            {facility.code}
          </span>
        </div>

        {/* 좌상단 카테고리 배지 */}
        <div className="absolute left-4 top-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-ivory)]/95 px-3 py-1 font-[var(--font-display)] text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--color-ink)]">
            <span className="block h-1.5 w-1.5 rounded-full bg-[var(--color-terracotta)]" />
            {facility.category}
          </span>
        </div>

        {/* 우하단 영문 라벨 */}
        <div className="absolute bottom-4 right-4 font-[var(--font-display)] text-[11px] uppercase tracking-[0.25em] text-[var(--color-ivory)]">
          No.{facility.code} · {facility.english}
        </div>

        {/* 좌하단 인덱스 */}
        <div className="absolute bottom-4 left-4 font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-ivory)]/80">
          0{index + 1} / 0{FACILITIES.length}
        </div>
      </div>

      {/* 텍스트 영역 */}
      <div className="mt-6">
        <h3 className="font-[var(--font-serif)] text-2xl font-semibold tracking-tight text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-terracotta)] md:text-[26px]">
          {facility.name}
        </h3>
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[var(--color-ink-soft)] md:text-[15px]">
          {facility.description}
        </p>

        {/* 특징 리스트 */}
        <ul className="mt-5 flex flex-wrap gap-2">
          {facility.features.map((feature) => (
            <li
              key={feature}
              className="inline-flex items-center gap-1.5 border border-[var(--color-line)] bg-[var(--color-cream)] px-3 py-1 text-[12px] text-[var(--color-ink-soft)]"
            >
              <span className="block h-1 w-1 rounded-full bg-[var(--color-terracotta)]" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────
 *  시설배치도 - SVG 기반 시각화 평면도
 * ──────────────────────────────────────────────────────── */
function FloorPlanSection() {
  return (
    <section className="relative bg-[var(--color-cream-dark)] py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid grid-cols-1 items-end gap-6 border-b border-[var(--color-line)] pb-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              ─ Floor Plan
            </p>
            <h2 className="mt-4 font-[var(--font-serif)] text-3xl font-medium leading-tight tracking-[-0.02em] text-[var(--color-ink)] md:text-5xl">
              시설{" "}
              <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                배치도
              </em>
            </h2>
          </div>
          <div className="md:col-span-5">
            <p className="text-sm leading-relaxed text-[var(--color-ink-soft)] md:text-base">
              건물 2층 전체에 자리한 교육장 공간의 배치를 한눈에 살펴보실 수 있습니다.
            </p>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-12 lg:gap-14">
          {/* 평면도 - SVG 그리드 시각화 */}
          <div className="md:col-span-8">
            <FloorPlanDiagram />
          </div>

          {/* 범례 */}
          <aside className="md:col-span-4">
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-muted)]">
              ─ Legend · 범례
            </p>
            <ul className="mt-6 space-y-4">
              {FLOOR_PLAN_ROOMS.map((room) => (
                <li key={room.code} className="flex items-start gap-4 border-b border-[var(--color-line)] pb-4">
                  <span
                    aria-hidden
                    className="mt-1 block h-4 w-4 flex-shrink-0 border border-[var(--color-ink)]/15"
                    style={{ background: room.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="font-[var(--font-serif)] text-[15px] font-semibold tracking-tight text-[var(--color-ink)]">
                        {room.label}
                      </p>
                      <span className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                        {room.code}
                      </span>
                    </div>
                    <p className="mt-1 text-[12px] leading-relaxed text-[var(--color-ink-soft)]">
                      {room.note}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-[var(--color-ink)] pt-6">
              <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.3em] text-[var(--color-muted)]">
                Address
              </p>
              <p className="mt-2 font-[var(--font-serif)] text-base font-medium text-[var(--color-ink)]">
                {SITE_INFO.address}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

// 시설배치도 - 방 영역 데이터 (SVG viewBox 0 0 800 480 기준)
type FloorPlanRoom = {
  code: string;
  label: string;
  note: string;
  color: string;
  textColor: string;
  // SVG 좌표 (x, y, width, height)
  x: number;
  y: number;
  width: number;
  height: number;
};

const FLOOR_PLAN_ROOMS: FloorPlanRoom[] = [
  {
    code: "01",
    label: "사무실 / 상담실",
    note: "운영 업무 + 1:1 비밀 상담",
    color: "rgba(196, 102, 59, 0.18)",
    textColor: "var(--color-ink)",
    x: 20,
    y: 20,
    width: 280,
    height: 200,
  },
  {
    code: "02",
    label: "제 1 강의실",
    note: "메인 강의실 · 다인원 수업",
    color: "rgba(107, 142, 127, 0.22)",
    textColor: "var(--color-ink)",
    x: 320,
    y: 20,
    width: 320,
    height: 220,
  },
  {
    code: "03",
    label: "휴게 공간 A",
    note: "휴식 · 차 한 잔의 여유",
    color: "rgba(217, 119, 87, 0.18)",
    textColor: "var(--color-ink)",
    x: 660,
    y: 20,
    width: 120,
    height: 220,
  },
  {
    code: "04",
    label: "제 2 강의실",
    note: "소그룹 · 워크숍 공간",
    color: "rgba(26, 35, 50, 0.12)",
    textColor: "var(--color-ink)",
    x: 20,
    y: 240,
    width: 280,
    height: 220,
  },
  {
    code: "05",
    label: "휴게 공간 B",
    note: "커뮤니티 모임 · 이벤트",
    color: "rgba(217, 119, 87, 0.18)",
    textColor: "var(--color-ink)",
    x: 320,
    y: 260,
    width: 200,
    height: 200,
  },
  {
    code: "06",
    label: "복도 / 로비",
    note: "출입구 및 이동 동선",
    color: "rgba(224, 214, 196, 0.5)",
    textColor: "var(--color-ink-soft)",
    x: 540,
    y: 260,
    width: 240,
    height: 200,
  },
];

function FloorPlanDiagram() {
  return (
    <div className="relative overflow-hidden border border-[var(--color-line)] bg-[var(--color-ivory)] p-4 shadow-[0_24px_40px_-24px_rgba(26,35,50,0.18)] md:p-6">
      {/* 평면도 헤더 */}
      <div className="mb-4 flex items-center justify-between border-b border-[var(--color-line)] pb-3">
        <span className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-muted)]">
          2F · 교육장 평면도
        </span>
        <span className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
          N ↑
        </span>
      </div>

      <svg
        viewBox="0 0 800 480"
        xmlns="http://www.w3.org/2000/svg"
        className="block h-auto w-full"
        role="img"
        aria-label="법인 2층 시설 배치도"
      >
        {/* 배경 그리드 - 미세한 격자 무늬 */}
        <defs>
          <pattern id="floorGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="rgba(26, 35, 50, 0.04)"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="800" height="480" fill="url(#floorGrid)" />

        {/* 외벽 - 두꺼운 테두리 */}
        <rect
          x="14"
          y="14"
          width="772"
          height="452"
          fill="none"
          stroke="var(--color-ink)"
          strokeWidth="3"
        />

        {/* 각 방 영역 */}
        {FLOOR_PLAN_ROOMS.map((room) => (
          <g key={room.code}>
            <rect
              x={room.x}
              y={room.y}
              width={room.width}
              height={room.height}
              fill={room.color}
              stroke="var(--color-ink)"
              strokeWidth="1.5"
            />
            {/* 코드 (좌상단) */}
            <text
              x={room.x + 14}
              y={room.y + 28}
              fontFamily="Cormorant Garamond, Georgia, serif"
              fontSize="14"
              fontStyle="italic"
              fill="var(--color-terracotta)"
              letterSpacing="2"
            >
              {room.code}
            </text>
            {/* 방 이름 (중앙) */}
            <text
              x={room.x + room.width / 2}
              y={room.y + room.height / 2 + 4}
              textAnchor="middle"
              fontFamily="Noto Serif KR, serif"
              fontSize={room.width > 250 ? "18" : "15"}
              fontWeight="600"
              fill={room.textColor}
            >
              {room.label}
            </text>
            {/* 방 노트 (이름 아래) */}
            <text
              x={room.x + room.width / 2}
              y={room.y + room.height / 2 + 26}
              textAnchor="middle"
              fontFamily="Pretendard Variable, sans-serif"
              fontSize="11"
              fill="var(--color-ink-soft)"
              opacity="0.7"
            >
              {room.note}
            </text>
          </g>
        ))}

        {/* 출입구 표시 - 복도 우측 하단 */}
        <g>
          <rect x="780" y="350" width="6" height="40" fill="var(--color-terracotta)" />
          <text
            x="745"
            y="345"
            textAnchor="end"
            fontFamily="Cormorant Garamond, Georgia, serif"
            fontSize="11"
            fontStyle="italic"
            fill="var(--color-terracotta)"
            letterSpacing="2"
          >
            ENTRANCE
          </text>
        </g>
      </svg>

      {/* 평면도 하단 안내 */}
      <p className="mt-4 border-t border-[var(--color-line)] pt-3 text-[11px] leading-relaxed text-[var(--color-muted)]">
        ※ 본 배치도는 실제 시설의 위치 관계를 시각화한 안내도이며, 실제 치수와 다를 수 있습니다.
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
 *  다음 단계 안내
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
