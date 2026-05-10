"use client";

import { useFormStatus } from "react-dom";

type FormSubmitButtonProps = {
  /** 폼이 대기 중일 때 표시할 문구 */
  label: string;
  /** 서버 액션 전송 중(스피너와 함께) */
  pendingLabel: string;
  className?: string;
  /** 전송 외 사유로 비활성 (환경 미구성 등) */
  disabled?: boolean;
};

/** 서버 액션 제출 중일 때 돌아가는 링 스피너 (버튼 텍스트 색에 맞춤) */
function InlineSpinner() {
  return (
    <svg
      className="size-4 shrink-0 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * 같은 <form> 안에 두고 useFormStatus 로 전송 중 UI를 표시한다.
 * (부모가 Server Component 여도 됨 — 이 파일만 클라이언트)
 */
export function FormSubmitButton({
  label,
  pendingLabel,
  className,
  disabled: disabledProp,
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();
  const disabled = Boolean(disabledProp) || pending;

  return (
    <button
      type="submit"
      disabled={disabled}
      aria-busy={pending}
      className={`inline-flex min-w-[5.5rem] items-center justify-center gap-2 disabled:cursor-wait disabled:opacity-90 ${className ?? ""}`}
    >
      {pending ? <InlineSpinner /> : null}
      <span>{pending ? pendingLabel : label}</span>
    </button>
  );
}
