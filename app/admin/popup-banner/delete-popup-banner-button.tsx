"use client";

import { useFormStatus } from "react-dom";
import { deleteSitePopupBannerFromAdmin } from "../popup-banner-actions";

function DeleteSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded border border-red-200 bg-red-50 px-2 py-1 text-xs font-medium text-red-800 disabled:opacity-60"
    >
      {pending ? "삭제 중…" : "삭제"}
    </button>
  );
}

/** 목록에서 팝업 배너 한 건 삭제 (확인 후 서버 액션) */
export function DeletePopupBannerButton({ bannerId }: { bannerId: number }) {
  return (
    <form
      action={deleteSitePopupBannerFromAdmin}
      className="inline"
      onSubmit={(event) => {
        if (!confirm("이 팝업 배너를 삭제할까요?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={String(bannerId)} />
      <DeleteSubmitButton />
    </form>
  );
}
