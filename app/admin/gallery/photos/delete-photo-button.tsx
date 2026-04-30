"use client";

import { useFormStatus } from "react-dom";
import { deleteGalleryPhotoFromAdmin } from "../../photo-actions";

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

/** 관리자 사진 목록에서 삭제 확인 후 서버 액션 실행 */
export function DeleteGalleryPhotoButton({ photoId }: { photoId: number }) {
  return (
    <form
      action={deleteGalleryPhotoFromAdmin}
      className="inline"
      onSubmit={(event) => {
        if (!confirm("이 사진을 삭제할까요? Storage 파일도 함께 삭제됩니다.")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={String(photoId)} />
      <DeleteSubmitButton />
    </form>
  );
}
