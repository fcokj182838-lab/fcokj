// 사이트 전체에서 공유하는 메뉴 구조 정의
// - 원본 fcokj.org 사이트의 IA를 그대로 반영
export type MenuItem = {
  label: string;
  href: string;
  description?: string;
};

export type MenuSection = {
  title: string;
  englishTitle: string;
  href: string;
  items: MenuItem[];
};

export const SITE_MENU: MenuSection[] = [
  {
    title: "법인소개",
    englishTitle: "About",
    href: "/about",
    items: [
      { label: "인사말", href: "/about", description: "이사장이 전하는 인사말" },
      { label: "연혁", href: "/about/history", description: "걸어온 발자취" },
      { label: "시설현황", href: "/about/facilities", description: "교육장 및 시설 안내" },
      { label: "찾아오시는 길", href: "/about/location", description: "오시는 길 안내" },
    ],
  },
  {
    title: "법인사업",
    englishTitle: "Programs",
    href: "/programs",
    items: [
      { label: "상담사업", href: "/programs/counseling", description: "고충·애로사항 상담" },
      { label: "교육사업", href: "/programs/education", description: "한국어 및 능력향상 교육" },
      { label: "외국인봉사단", href: "/programs/volunteers", description: "지역사회 공생 봉사단" },
      { label: "문화체험", href: "/programs/culture", description: "한국문화 이해 프로그램" },
      { label: "기타사업", href: "/programs/others", description: "그 외 다양한 활동" },
    ],
  },
  {
    title: "활동사진",
    englishTitle: "Gallery",
    href: "/gallery",
    items: [
      { label: "사진", href: "/gallery/photos", description: "활동 사진 모음" },
      { label: "언론에 비친 법인", href: "/gallery/press", description: "언론 보도 자료" },
    ],
  },
  {
    title: "후원안내",
    englishTitle: "Support",
    href: "/support",
    items: [{ label: "후원안내", href: "/support", description: "함께하는 따뜻한 동행" }],
  },
];

export const SITE_INFO = {
  name: "사단법인 외국인과 동행",
  englishName: "Foreigners Companion of Korea",
  shortName: "외국인과 동행",
  address: "경북 경주시 외동읍 입실로1길 13-29 2층",
  phone: "054-705-1828",
  fax: "054-705-2838",
  email: "fcokj@daum.net",
  cafe: "http://cafe.daum.net/fcokj",
  copyright:
    "© 2026 GYEONGJU SUPPORT CENTER FOR FOREIGN WORKERS. ALL RIGHTS RESERVED.",
};
