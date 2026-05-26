import type { NextConfig } from "next";

/** 개발 전용 — IP로 접속 시 Next가 /_next/* POST 를 잘라 403(비 Flight)을 주면 "unexpected response" 가 남 (LAN은 기본 패턴 + env 병합) */
const isNextDev = process.env.NODE_ENV === "development";
const extraDevOriginsFromEnv = isNextDev && process.env.NEXT_DEV_ALLOWED_ORIGINS?.trim().length
  ? process.env.NEXT_DEV_ALLOWED_ORIGINS.split(/[,\s]+/).map((h) => h.trim()).filter(Boolean)
  : [];
/**
 * Next dev CSRF(allowedDevOrigins) — `/_next/*` POST 등에 Origin 이 필요함.
 * - `localhost` / `127.0.0.1` / IPv6 `::1` 은 서로 다른 Origin 이라 모두 허용 목록에 두는 편이 안전함.
 *   (Next 내부에 localhost 계열이 일부 포함되어도, IP/IPv6 접속은 여기 패턴으로 커버)
 * - RFC1918 의 172.16.0.0/12(Docker·사내 VPN 등) 는 192.168/10 과 별개라 기본에 포함.
 */
const defaultPrivateLanDevPatterns = isNextDev
  ? (["192.168.*.*", "10.*.*.*", "172.*.*.*", "127.0.0.1", "::1"] as const)
  : [];
const mergedAllowedDevOrigins = isNextDev
  ? [...new Set([...defaultPrivateLanDevPatterns, ...extraDevOriginsFromEnv])]
  : [];

const nextConfig: NextConfig = {
  ...(mergedAllowedDevOrigins.length > 0 ? { allowedDevOrigins: mergedAllowedDevOrigins } : {}),
  // Server Actions 기본 본문 한도(~1MB)는 갤러리 멀티 이미지(최대 30장 × 8MB)와 맞지 않음.
  // 한도 초과 시 413 + 비-RSC 응답 → 브라우저 "unexpected response" 오류로 이어짐.
  experimental: {
    serverActions: {
      bodySizeLimit: "256mb",
    },
  },
};

export default nextConfig;
