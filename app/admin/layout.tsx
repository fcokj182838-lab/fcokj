import { Suspense, type ReactNode } from "react";
import { AdminShell } from "./admin-shell";

/**
 * /admin 하위 공통 레이아웃
 * - 로그인 제외 페이지에 왼쪽 관리자 메뉴(AdminShell) 적용
 * - useSearchParams 사용으로 Suspense 필요
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-[40vh] w-full bg-[var(--color-ivory)]" aria-hidden />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
