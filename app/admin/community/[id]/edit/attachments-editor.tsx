"use client";

import type { CommunityAttachmentRecord } from "../../../../lib/community-attachments";
import { useCallback, useMemo, useState } from "react";
import { AttachmentsInput } from "../../new/attachments-input";

type CommunityPostAttachmentsEditorProps = {
  /** 스토리지 path 가 있는 기존 첨부 (숨은 필드로 유지 여부 전달) */
  initialStorable: CommunityAttachmentRecord[];
  /** path 없는 구형식 첨부 개수 — 자동 유지 안내용 */
  legacyAttachmentCount: number;
  maxFiles: number;
  maxBytes: number;
};

/** 바이트를 읽기 좋은 문자열로 (attachments-input 과 동일 규칙) */
function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * 수정 폼: 기존 첨부 유지/제거( hidden ) + 새 파일( AttachmentsInput )
 * 서버에서 keep_attachment_paths 가 DB에 있던 path 의 부분집합인지 다시 검증한다.
 */
export function CommunityPostAttachmentsEditor({
  initialStorable,
  legacyAttachmentCount,
  maxFiles,
  maxBytes,
}: CommunityPostAttachmentsEditorProps) {
  const [keptExisting, setKeptExisting] = useState<CommunityAttachmentRecord[]>(() => [
    ...initialStorable,
  ]);

  const maxNewSlots = Math.max(0, maxFiles - keptExisting.length - legacyAttachmentCount);

  const handleRemoveExisting = useCallback((pathToRemove: string) => {
    setKeptExisting((prev) => prev.filter((item) => item.path !== pathToRemove));
  }, []);

  const hintText = useMemo(() => {
    if (legacyAttachmentCount <= 0) return null;
    return `구형식 첨부 ${legacyAttachmentCount}건은 자동으로 유지됩니다.`;
  }, [legacyAttachmentCount]);

  return (
    <div className="grid gap-2">
      {hintText && <p className="text-xs text-[var(--color-muted)]">{hintText}</p>}

      {keptExisting.map((item) => (
        <div key={item.path}>
          <input type="hidden" name="keep_attachment_paths" value={item.path} />
        </div>
      ))}

      {keptExisting.length > 0 && (
        <div className="grid gap-2 border border-[var(--color-line)] bg-white p-3">
          <p className="text-xs text-[var(--color-muted)]">유지할 기존 첨부</p>
          <ul className="grid gap-1.5">
            {keptExisting.map((file) => (
              <li
                key={file.path}
                className="flex items-center justify-between gap-3 border border-[var(--color-line)] bg-[var(--color-ivory)] px-3 py-2 text-sm"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <PaperclipIcon />
                  <span className="truncate text-[var(--color-ink)]">{file.name}</span>
                  <span className="shrink-0 text-xs text-[var(--color-muted)]">
                    {formatFileSize(file.size)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveExisting(file.path)}
                  className="shrink-0 text-xs text-[var(--color-terracotta)] underline"
                  aria-label={`${file.name} 제거`}
                >
                  제거
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {maxNewSlots > 0 ? (
        <AttachmentsInput name="attachments" maxFiles={maxNewSlots} maxBytes={maxBytes} />
      ) : (
        <p className="text-xs text-[var(--color-muted)]">
          새 파일을 추가하려면 기존 첨부를 일부 제거하세요. (게시글당 최대 {maxFiles}개)
        </p>
      )}

      <p className="text-xs text-[var(--color-muted)]">
        실행파일(.exe/.bat/.js 등)은 보안상 업로드할 수 없습니다.
      </p>
    </div>
  );
}

function PaperclipIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.41 17.41a2 2 0 0 1-2.83-2.83l8.49-8.49" />
    </svg>
  );
}
