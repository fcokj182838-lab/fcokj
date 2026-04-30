"use client";

import { useCallback, useMemo, useRef, useState } from "react";

// 사용자가 글쓰기 화면에서 본 그대로 폼 제출되도록
// DataTransfer 로 file input 의 FileList 를 동기화한다.
// (브라우저 file input 은 multiple + 여러 번 선택을 자동 누적해주지 않음)

type AttachmentsInputProps = {
  /** 서버 액션에서 formData.getAll(name) 으로 받는 키 */
  name: string;
  /** 게시글당 첨부 가능한 최대 개수 */
  maxFiles: number;
  /** 파일당 최대 바이트 (UI 안내·검증용) */
  maxBytes: number;
};

/** 바이트를 사람이 읽기 좋은 단위로 */
function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentsInput({ name, maxFiles, maxBytes }: AttachmentsInputProps) {
  // 실제 폼 제출에 사용될 hidden file input
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  // 화면에 보여줄 파일 메타 (FileList 는 stable identity 가 없어 별도 state 보관)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [warning, setWarning] = useState<string | null>(null);

  /** 파일 input 의 실제 FileList 를 selectedFiles 와 동기화 */
  const syncToInput = useCallback((nextFiles: File[]) => {
    if (!fileInputRef.current) return;
    const dataTransfer = new DataTransfer();
    for (const file of nextFiles) {
      dataTransfer.items.add(file);
    }
    fileInputRef.current.files = dataTransfer.files;
  }, []);

  /** 파일 추가 (중복 제거 + 개수/용량 검증) */
  const handleAddFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming || incoming.length === 0) return;

      const incomingArray = Array.from(incoming);

      // 개별 용량 초과 차단
      const oversize = incomingArray.find((file) => file.size > maxBytes);
      if (oversize) {
        setWarning(
          `"${oversize.name}" 파일이 최대 용량(${formatFileSize(maxBytes)})을 초과합니다.`,
        );
        return;
      }

      // (이름 + 크기) 기준으로 중복 차단 (동일 파일 다시 선택 시)
      const existingKeys = new Set(selectedFiles.map((file) => `${file.name}::${file.size}`));
      const deduped = incomingArray.filter(
        (file) => !existingKeys.has(`${file.name}::${file.size}`),
      );

      const merged = [...selectedFiles, ...deduped];

      if (merged.length > maxFiles) {
        setWarning(`첨부파일은 최대 ${maxFiles}개까지 등록할 수 있습니다.`);
        return;
      }

      setWarning(null);
      setSelectedFiles(merged);
      syncToInput(merged);
    },
    [maxBytes, maxFiles, selectedFiles, syncToInput],
  );

  /** 특정 파일 제거 */
  const handleRemoveAt = useCallback(
    (index: number) => {
      const next = selectedFiles.filter((_, i) => i !== index);
      setSelectedFiles(next);
      syncToInput(next);
      setWarning(null);
    },
    [selectedFiles, syncToInput],
  );

  /** 전체 비우기 */
  const handleClearAll = useCallback(() => {
    setSelectedFiles([]);
    syncToInput([]);
    setWarning(null);
  }, [syncToInput]);

  const totalSize = useMemo(
    () => selectedFiles.reduce((sum, file) => sum + file.size, 0),
    [selectedFiles],
  );

  return (
    <div className="grid gap-2">
      <input
        ref={fileInputRef}
        type="file"
        name={name}
        multiple
        // onChange 의 e.target.files 는 새로 선택한 파일만 담겨있으므로
        // 누적·중복 제거 로직을 거친 뒤 다시 input.files 로 동기화한다.
        onChange={(event) => {
          const incoming = event.target.files;
          // 즉시 input.files 를 비워두고 add 로직에서 누적분을 다시 채움
          if (event.target.value) event.target.value = "";
          handleAddFiles(incoming);
        }}
        className="border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:border-[var(--color-terracotta)] file:mr-3 file:rounded-none file:border file:border-[var(--color-line)] file:bg-[var(--color-ivory)] file:px-3 file:py-1 file:text-xs file:text-[var(--color-ink-soft)]"
      />

      {warning && (
        <p className="text-xs text-red-700">{warning}</p>
      )}

      {selectedFiles.length > 0 && (
        <div className="grid gap-2 border border-[var(--color-line)] bg-white p-3">
          <div className="flex items-center justify-between text-xs text-[var(--color-muted)]">
            <span>
              선택된 파일 {selectedFiles.length}개 · 합계 {formatFileSize(totalSize)}
            </span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[var(--color-terracotta)] underline"
            >
              모두 비우기
            </button>
          </div>
          <ul className="grid gap-1.5">
            {selectedFiles.map((file, index) => (
              <li
                key={`${file.name}-${file.size}-${index}`}
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
                  onClick={() => handleRemoveAt(index)}
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
