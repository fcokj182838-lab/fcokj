import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "./components/site-header";
import { SiteFooter } from "./components/site-footer";
import { SitePopupBanner } from "./components/site-popup-banner";
import { getSitePopupBannersPublic } from "./lib/site-popup-banner";
import { SITE_INFO } from "./lib/site-config";

export const metadata: Metadata = {
  title: {
    default: `${SITE_INFO.name} | 외국인근로자의 인권보호와 복지증진`,
    template: `%s | ${SITE_INFO.name}`,
  },
  description:
    "사단법인 외국인과 동행은 한국에서 근무하는 외국인근로자의 인권보호와 복지증진을 도모하여 안정된 생활과 삶의 질 향상을 지원합니다. 상담, 교육, 외국인봉사단, 문화체험 등 다양한 프로그램을 운영합니다.",
  keywords: [
    "외국인과 동행",
    "외국인근로자",
    "경주",
    "인권보호",
    "한국어 교육",
    "다문화 상담",
    "외국인봉사단",
  ],
  openGraph: {
    title: SITE_INFO.name,
    description: "외국인근로자의 인권보호와 복지증진을 위한 동행",
    locale: "ko_KR",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const popupBanners = await getSitePopupBannersPublic();

  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        {/* 폰트 사전 연결 - 로딩 성능 최적화 */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Pretendard - 본문용 산세리프 */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css"
        />
        {/* Noto Serif KR + Cormorant Garamond - 제목/디스플레이용 세리프 */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap"
        />
      </head>
      <body className="flex min-h-full flex-col bg-[var(--color-cream)] text-[var(--color-ink)]">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <SitePopupBanner banners={popupBanners} />
      </body>
    </html>
  );
}
