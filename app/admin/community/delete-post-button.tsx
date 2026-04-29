"use client";

import { useFormStatus } from "react-dom";
import { deleteCommunityPostFromAdmin } from "../actions";

function DeleteSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-800 disabled:opacity-60"
    >
      {pending ? "삭제 중…" : "삭제"}
    </button>
  );
}

/** 관리자 목록에서 삭제 확인 후 서버 액션 실행 */
export function DeleteCommunityPostButton({ postId }: { postId: number }) {
  return (
    <form
      action={deleteCommunityPostFromAdmin}
      className="inline"
      onSubmit={(event) => {
        if (!confirm("이 게시글을 삭제할까요? 되돌릴 수 없습니다.")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={String(postId)} />
      <DeleteSubmitButton />
    </form>
  );
}
