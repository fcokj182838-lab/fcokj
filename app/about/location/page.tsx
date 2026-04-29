import type { Metadata } from "next";
import Link from "next/link";
import { SITE_INFO } from "../../lib/site-config";

// 법인소개 - 찾아오시는 길 페이지
// - 원본 fcokj.org/intro4 의 사무실/교육장 두 주소 + 지도 + 오시는 길 안내를 매거진 스타일로 재구성
export const metadata: Metadata = {
  title: "찾아오시는 길 · 법인소개",
  description:
    "사단법인 외국인과 동행의 사무실과 교육장 위치, 그리고 오시는 길을 안내합니다. 경상북도 경주시 외동읍에 자리하고 있습니다.",
};

/* ─────────────────────────────────────────────────────────
 *  주소 데이터
 *  - 좌표는 외동읍 입실리/활성리 인근 추정값 (실제 좌표 확보 시 교체)
 * ──────────────────────────────────────────────────────── */
type LocationInfo = {
  code: string;
  label: string;
  english: string;
  address: string;
  detail: string;
  latitude: number;
  longitude: number;
  description: string;
  accent: string;
};

const LOCATIONS: LocationInfo[] = [
  {
    code: "01",
    label: "교육장",
    english: "Education Center",
    address: "경상북도 경주시 외동읍 입실로1길 13-29",
    detail: "건물 2층",
    latitude: 35.7651,
    longitude: 129.3221,
    description:
      "한국어 교실, 사회통합프로그램, 문화체험 등 모든 교육 활동이 이루어지는 메인 교육장입니다.",
    accent:
      "from-[var(--color-terracotta)]/30 via-[var(--color-terracotta-soft)]/15 to-[var(--color-cream)]",
  },
  {
    code: "02",
    label: "사무실",
    english: "Main Office",
    address: "경상북도 경주시 외동읍 활성길 91",
    detail: "법인 행정 업무",
    latitude: 35.762,
    longitude: 129.325,
    description:
      "법인 행정 업무가 이루어지는 본 사무실입니다. 후원, 기부, 공식 문의는 이곳으로 연락주세요.",
    accent:
      "from-[var(--color-sage)]/35 via-[var(--color-cream)] to-[var(--color-cream-dark)]",
  },
];

// 메인(교육장) 위치 - 지도 중심 및 마커 좌표
const MAIN_LOCATION = LOCATIONS[0];

const ABOUT_SUB_PAGES = [
  { label: "인사말", href: "/about", english: "Greeting" },
  { label: "연혁", href: "/about/history", english: "History" },
  { label: "시설현황", href: "/about/facilities", english: "Facilities" },
  { label: "찾아오시는 길", href: "/about/location", english: "Location", current: true },
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
    label: "시설현황",
    english: "Facilities",
    href: "/about/facilities",
    description: "교육장과 상담실 등 법인의 공간을 안내합니다.",
  },
];

export default function AboutLocationPage() {
  return (
    <>
      <PageHero />
      <SubNavigation />
      <AddressSection />
      <MapSection />
      <DirectionsSection />
      <ContactCTASection />
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
            Location
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
                  찾아오시는 길
                </em>
              </span>
            </h1>
          </div>

          <aside
            className="self-end border-l border-[var(--color-line)] pl-8 animate-fade-up lg:col-span-4"
            style={{ animationDelay: "0.4s" }}
          >
            <p className="font-[var(--font-serif)] text-[15px] leading-[1.85] text-[var(--color-ink-soft)]">
              경상북도{" "}
              <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                경주시 외동읍
              </em>
              에 자리한 동행의 거점입니다. 사무실과 교육장이 가까이 위치하고 있습니다.
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
 *  두 개의 주소 - 양분 카드
 * ──────────────────────────────────────────────────────── */
function AddressSection() {
  return (
    <section className="relative bg-[var(--color-ivory)] py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid grid-cols-1 items-end gap-6 border-b border-[var(--color-line)] pb-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              ─ Two Locations
            </p>
            <h2 className="mt-4 font-[var(--font-serif)] text-3xl font-medium leading-tight tracking-[-0.02em] text-[var(--color-ink)] md:text-5xl lg:text-6xl">
              두 개의
              <br />
              <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                동행의 거점
              </em>
            </h2>
          </div>
          <div className="md:col-span-5">
            <p className="text-sm leading-relaxed text-[var(--color-ink-soft)] md:text-base">
              교육과 상담이 이루어지는 교육장과, 행정 업무를 담당하는 사무실이 가까운 거리에 함께
              자리하고 있습니다.
            </p>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-10">
          {LOCATIONS.map((location, index) => (
            <AddressCard key={location.code} location={location} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function AddressCard({ location, index }: { location: LocationInfo; index: number }) {
  // 외부 지도 서비스 링크 - 한국 사용자를 위해 카카오맵·네이버맵·구글맵 모두 제공
  const fullAddress = `${location.address}${location.detail ? " " + location.detail : ""}`;
  const encodedQuery = encodeURIComponent(location.address);
  const mapServices = [
    {
      name: "카카오맵",
      english: "Kakao",
      href: `https://map.kakao.com/?q=${encodedQuery}`,
    },
    {
      name: "네이버지도",
      english: "Naver",
      href: `https://map.naver.com/p/search/${encodedQuery}`,
    },
    {
      name: "구글맵",
      english: "Google",
      href: `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`,
    },
  ];

  return (
    <article className="group flex flex-col">
      {/* 카드 상단 - 비주얼 영역 */}
      <div
        className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${location.accent} transition-transform duration-700 group-hover:-translate-y-1`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-[var(--font-display)] text-[140px] font-light leading-none text-[var(--color-ivory)] opacity-35 lg:text-[180px]">
            {location.code}
          </span>
        </div>

        <div className="absolute left-4 top-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-ivory)]/95 px-3 py-1 font-[var(--font-display)] text-[10px] font-semibold uppercase tracking-[0.25em] text-[var(--color-ink)]">
            <span className="block h-1.5 w-1.5 rounded-full bg-[var(--color-terracotta)]" />
            {location.english}
          </span>
        </div>

        <div className="absolute bottom-4 right-4 font-[var(--font-display)] text-[11px] uppercase tracking-[0.25em] text-[var(--color-ivory)]">
          {index === 0 ? "Main" : "Office"} · No.{location.code}
        </div>
      </div>

      {/* 본문 */}
      <div className="mt-8 flex flex-1 flex-col">
        <h3 className="font-[var(--font-serif)] text-3xl font-semibold tracking-tight text-[var(--color-ink)] md:text-[34px]">
          [{location.label}]
        </h3>

        {/* 주소 */}
        <div className="mt-6 border-t border-[var(--color-ink)] pt-5">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.3em] text-[var(--color-muted)]">
            Address
          </p>
          <p className="mt-2 font-[var(--font-serif)] text-lg font-semibold leading-snug tracking-tight text-[var(--color-ink)] md:text-xl">
            {location.address}
          </p>
          {location.detail && (
            <p className="mt-1 text-[14px] text-[var(--color-ink-soft)]">{location.detail}</p>
          )}
        </div>

        <p className="mt-6 flex-1 text-[14px] leading-relaxed text-[var(--color-ink-soft)] md:text-[15px]">
          {location.description}
        </p>

        {/* 외부 지도 서비스 링크 */}
        <div className="mt-8 border-t border-[var(--color-line)] pt-6">
          <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.3em] text-[var(--color-muted)]">
            Open in Map
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {mapServices.map((service) => (
              <li key={service.name}>
                <a
                  href={service.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/btn inline-flex items-center gap-2 border border-[var(--color-line)] bg-[var(--color-cream)] px-4 py-2 text-[13px] font-medium tracking-tight text-[var(--color-ink)] transition-all duration-300 hover:border-[var(--color-terracotta)] hover:bg-[var(--color-terracotta)] hover:text-[var(--color-ivory)]"
                >
                  <span>{service.name}</span>
                  <span aria-hidden className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.25em] opacity-60 transition-opacity group-hover/btn:opacity-100">
                    {service.english}
                  </span>
                  <span aria-hidden>↗</span>
                </a>
              </li>
            ))}
          </ul>

          {/* 주소 복사용 텍스트 - 보조 안내 */}
          <p className="mt-4 text-[11px] tracking-tight text-[var(--color-muted)]">
            전체 주소: <span className="text-[var(--color-ink-soft)]">{fullAddress}</span>
          </p>
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────
 *  지도 임베드 - OpenStreetMap iframe (API 키 불필요)
 * ──────────────────────────────────────────────────────── */
function MapSection() {
  // OSM 임베드 bbox 계산 - 메인 위치 중심으로 약 ±0.008° 영역
  const lat = MAIN_LOCATION.latitude;
  const lng = MAIN_LOCATION.longitude;
  const offset = 0.008;
  const bbox = `${lng - offset},${lat - offset},${lng + offset},${lat + offset}`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  const osmFullUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;

  return (
    <section className="relative py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid grid-cols-1 items-end gap-6 border-b border-[var(--color-line)] pb-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              ─ Map
            </p>
            <h2 className="mt-4 font-[var(--font-serif)] text-3xl font-medium leading-tight tracking-[-0.02em] text-[var(--color-ink)] md:text-5xl">
              지도로{" "}
              <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                보기
              </em>
            </h2>
          </div>
          <div className="md:col-span-5">
            <p className="text-sm leading-relaxed text-[var(--color-ink-soft)] md:text-base">
              지도에는 {MAIN_LOCATION.label}이 표시되어 있습니다. 사무실은 인근 활성길에 위치하니,
              방문 전 서비스에 따라 정확한 길을 확인해 주세요.
            </p>
          </div>
        </div>

        <div className="mt-14 overflow-hidden border border-[var(--color-line)] bg-[var(--color-cream)] shadow-[0_24px_40px_-24px_rgba(26,35,50,0.18)]">
          {/* 지도 헤더 */}
          <div className="flex flex-col gap-3 border-b border-[var(--color-line)] bg-[var(--color-ivory)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-terracotta)] text-xs font-semibold text-[var(--color-ivory)]">
                {MAIN_LOCATION.code}
              </span>
              <div>
                <p className="font-[var(--font-display)] text-[10px] uppercase tracking-[0.3em] text-[var(--color-muted)]">
                  {MAIN_LOCATION.english}
                </p>
                <p className="font-[var(--font-serif)] text-sm font-semibold text-[var(--color-ink)]">
                  [{MAIN_LOCATION.label}] {MAIN_LOCATION.address}
                </p>
              </div>
            </div>
            <a
              href={osmFullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline inline-flex w-fit items-center gap-2 text-[13px] font-medium tracking-tight text-[var(--color-ink)]"
            >
              크게 보기 ↗
            </a>
          </div>

          {/* 지도 iframe - 외부 OSM 임베드 (라이선스 표시 자동 포함) */}
          <iframe
            title={`${MAIN_LOCATION.label} 위치 지도 - OpenStreetMap`}
            src={osmEmbedUrl}
            loading="lazy"
            className="block h-[420px] w-full border-0 lg:h-[520px]"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* 지도 사용 안내 */}
        <p className="mt-4 text-[11px] tracking-tight text-[var(--color-muted)]">
          ※ 지도는 OpenStreetMap을 통해 제공되며, 정확한 길 안내는 위 카드의 카카오맵·네이버지도
          링크를 이용해 주세요.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
 *  오시는 방법 - 자동차 / 대중교통 / 기차
 * ──────────────────────────────────────────────────────── */
type DirectionInfo = {
  code: string;
  mode: string;
  english: string;
  icon: string;
  steps: string[];
};

const DIRECTIONS: DirectionInfo[] = [
  {
    code: "01",
    mode: "자가용",
    english: "By Car",
    icon: "✦",
    steps: [
      "내비게이션에 “경주시 외동읍 입실로1길 13-29”를 입력하세요.",
      "경부고속도로 경주IC에서 약 25분, 울산방향에서 진입이 편리합니다.",
      "건물 주변에 주차 공간이 마련되어 있습니다.",
    ],
  },
  {
    code: "02",
    mode: "버스",
    english: "By Bus",
    icon: "✱",
    steps: [
      "경주시외버스터미널에서 외동읍 방면 시내버스 이용 가능합니다.",
      "“입실” 또는 “외동읍사무소” 정류장에서 하차하세요.",
      "정류장에서 도보 약 5~10분 거리입니다.",
    ],
  },
  {
    code: "03",
    mode: "기차 · KTX",
    english: "By Train",
    icon: "✧",
    steps: [
      "KTX 신경주역에서 택시 이용 시 약 30~40분 소요됩니다.",
      "경주역(중앙선)에서도 외동읍까지 시내버스·택시로 이동 가능합니다.",
      "방문 전 시간 여유를 두고 출발해 주세요.",
    ],
  },
];

function DirectionsSection() {
  return (
    <section className="relative bg-[var(--color-cream-dark)] py-24 lg:py-32">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid grid-cols-1 items-end gap-6 border-b border-[var(--color-line)] pb-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
              ─ Directions
            </p>
            <h2 className="mt-4 font-[var(--font-serif)] text-3xl font-medium leading-tight tracking-[-0.02em] text-[var(--color-ink)] md:text-5xl">
              오시는{" "}
              <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta)]">
                방법
              </em>
            </h2>
          </div>
          <div className="md:col-span-5">
            <p className="text-sm leading-relaxed text-[var(--color-ink-soft)] md:text-base">
              자가용, 시내버스, 기차 등 다양한 방법으로 방문하실 수 있습니다. 가장 편한 경로를
              선택해 주세요.
            </p>
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-px bg-[var(--color-line)] md:grid-cols-3">
          {DIRECTIONS.map((direction) => (
            <article
              key={direction.code}
              className="group relative flex flex-col bg-[var(--color-cream)] p-8 transition-colors duration-500 hover:bg-[var(--color-ivory)] lg:p-10"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-[var(--font-display)] text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
                  {direction.english}
                </span>
                <span
                  aria-hidden
                  className="font-[var(--font-display)] text-5xl font-light text-[var(--color-line)] transition-colors duration-500 group-hover:text-[var(--color-terracotta)]"
                >
                  {direction.icon}
                </span>
              </div>

              <h3 className="mt-8 font-[var(--font-serif)] text-2xl font-semibold tracking-tight text-[var(--color-ink)] md:text-3xl">
                {direction.mode}
              </h3>

              <ol className="mt-6 space-y-3 border-t border-[var(--color-line)] pt-6">
                {direction.steps.map((step, stepIndex) => (
                  <li key={stepIndex} className="flex gap-3 text-[14px] leading-relaxed text-[var(--color-ink-soft)]">
                    <span className="flex-shrink-0 font-[var(--font-display)] text-[12px] font-semibold tracking-tight text-[var(--color-terracotta)]">
                      0{stepIndex + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>

        <p className="mt-6 text-[12px] leading-relaxed text-[var(--color-muted)]">
          ※ 본 안내는 일반적인 방문 경로를 안내드린 것으로, 정확한 시간과 노선은 카카오맵·네이버지도
          등 길찾기 서비스를 통해 확인해 주세요.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
 *  연락처 CTA - 전화/팩스/이메일/카페
 * ──────────────────────────────────────────────────────── */
function ContactCTASection() {
  const phoneNumber = SITE_INFO.phone.replace(/-/g, "");
  const contactItems = [
    { code: "TEL", label: "전화", value: SITE_INFO.phone, href: `tel:${phoneNumber}` },
    { code: "FAX", label: "팩스", value: SITE_INFO.fax },
    { code: "MAIL", label: "이메일", value: SITE_INFO.email, href: `mailto:${SITE_INFO.email}` },
    {
      code: "CAFE",
      label: "센터 카페",
      value: SITE_INFO.cafe.replace(/^https?:\/\//, ""),
      href: SITE_INFO.cafe,
      external: true,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[var(--color-ink)] py-24 text-[var(--color-cream)] lg:py-32">
      {/* 배경 데코 */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -right-32 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-[var(--color-terracotta)]/40 blur-3xl" />
        <div className="absolute -left-20 -top-20 h-[400px] w-[400px] rounded-full bg-[var(--color-sage)]/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-[1280px] px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta-soft)]">
              ─ Contact
            </p>
            <h2 className="mt-4 font-[var(--font-serif)] text-3xl font-medium leading-[1.15] tracking-[-0.02em] md:text-5xl lg:text-6xl">
              방문 전,
              <br />
              <em className="font-[var(--font-display)] not-italic text-[var(--color-terracotta-soft)]">
                먼저 연락
              </em>
              주세요.
            </h2>
            <p className="mt-8 max-w-md text-[15px] leading-[1.85] text-[var(--color-cream)]/75">
              상담이나 교육 일정 등은 사전 문의 후 방문하시면 더욱 편안하게 이용하실 수 있습니다.
            </p>
          </div>

          <div className="md:col-span-7">
            <ul className="space-y-px bg-[var(--color-cream)]/15">
              {contactItems.map((item) => {
                const inner = (
                  <>
                    <span className="md:w-32">
                      <span className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta-soft)]">
                        {item.code}
                      </span>
                    </span>
                    <span className="flex-1">
                      <span className="block text-[12px] tracking-tight text-[var(--color-cream)]/60">
                        {item.label}
                      </span>
                      <span className="mt-1 block font-[var(--font-serif)] text-lg font-medium tracking-tight md:text-xl">
                        {item.value}
                      </span>
                    </span>
                    {item.href && (
                      <span
                        aria-hidden
                        className="self-center text-2xl text-[var(--color-cream)]/40 transition-all duration-300 group-hover/contact:translate-x-1 group-hover/contact:text-[var(--color-terracotta-soft)]"
                      >
                        →
                      </span>
                    )}
                  </>
                );

                return (
                  <li key={item.code} className="bg-[var(--color-ink)]">
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noopener noreferrer" : undefined}
                        className="group/contact flex items-center gap-6 px-2 py-6 transition-colors hover:bg-[var(--color-ink-soft)] md:gap-12 md:px-4"
                      >
                        {inner}
                      </a>
                    ) : (
                      <div className="flex items-center gap-6 px-2 py-6 md:gap-12 md:px-4">{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
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
