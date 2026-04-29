"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "../../lib/supabase/browser";

export function AdminLoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const initialMessage = useMemo(() => {
    const error = searchParams.get("error");
    const logout = searchParams.get("logout");
    if (logout) return "로그아웃되었습니다.";
    if (error === "forbidden") return "관리자 권한이 없습니다. 관리자에게 role=admin 설정을 요청하세요.";
    if (error === "config") return "Supabase 환경변수가 설정되지 않았습니다.";
    if (error === "auth") return "로그인이 필요합니다.";
    return null;
  }, [searchParams]);

  async function handleSubmit() {
    setIsLoading(true);
    setMessage(null);

    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase 환경변수가 설정되지 않았습니다.");
      setIsLoading(false);
      return;
    }

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setMessage(error.message);
          return;
        }
        setMessage("회원가입이 완료되었습니다. (이메일 인증이 켜져있다면 인증 후 로그인하세요.)");
        setMode("login");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
        return;
      }

      router.push("/admin?login=1");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="relative bg-[var(--color-ivory)] py-20 lg:py-28">
      <div className="mx-auto max-w-[560px] space-y-6 px-6 lg:px-10">
        <p className="font-[var(--font-display)] text-[11px] uppercase tracking-[0.3em] text-[var(--color-terracotta)]">
          ─ Admin Access
        </p>
        <h1 className="font-[var(--font-serif)] text-4xl font-medium tracking-[-0.02em] text-[var(--color-ink)] md:text-5xl">
          관리자 로그인
        </h1>

        {(initialMessage || message) && (
          <p className="border-l-2 border-[var(--color-terracotta)] bg-[var(--color-cream)] px-4 py-3 text-sm text-[var(--color-ink-soft)]">
            {message ?? initialMessage}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`px-4 py-2 text-sm font-semibold ${
              mode === "login"
                ? "bg-[var(--color-terracotta)] text-[var(--color-ivory)]"
                : "border border-[var(--color-line)] bg-[var(--color-cream)] text-[var(--color-ink)]"
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`px-4 py-2 text-sm font-semibold ${
              mode === "signup"
                ? "bg-[var(--color-terracotta)] text-[var(--color-ivory)]"
                : "border border-[var(--color-line)] bg-[var(--color-cream)] text-[var(--color-ink)]"
            }`}
          >
            회원가입
          </button>
        </div>

        <div className="grid gap-3 border border-[var(--color-line)] bg-[var(--color-cream)] p-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-terracotta)]"
            autoComplete="email"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-terracotta)]"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
          />

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-fit bg-[var(--color-terracotta)] px-4 py-2 text-sm font-semibold text-[var(--color-ivory)] disabled:opacity-60"
          >
            {isLoading ? "처리 중..." : mode === "signup" ? "회원가입" : "로그인"}
          </button>

          <p className="text-xs text-[var(--color-muted)]">
            관리자 대시보드는 <strong>role=admin</strong> 사용자만 접근 가능합니다.
          </p>
        </div>
      </div>
    </section>
  );
}

