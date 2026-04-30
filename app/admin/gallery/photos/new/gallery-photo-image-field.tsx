"use client";

import { useEffect, useId, useRef, useState } from "react";

/** 서버 `photo-actions` 의 MAX_GALLERY_IMAGES_PER_SUBMIT 과 동일하게 유지 */
const MAX_GALLERY_IMAGES = 30;

const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

type GalleryPhotoImageFieldProps = {
  name?: string;
  accept?: string;
  required?: boolean;
};

function isAllowedImageFile(file: File): boolean {
  if (ALLOWED_IMAGE_MIME.has(file.type)) return true;
  if (file.type !== "" && file.type.startsWith("image/")) return false;
  return /\.(jpe?g|png|webp|avif|gif)$/i.test(file.name ?? "");
}

/** 기존 목록 뒤에 붙이되 최대 장수로 자름 */
function appendImageFiles(
  existing: File[],
  incoming: File[],
): { merged: File[]; hint: string | null } {
  const images = incoming.filter((f) => isAllowedImageFile(f));
  if (images.length === 0) {
    return { merged: existing, hint: null };
  }
  let merged = [...existing, ...images];
  let hint: string | null = null;
  if (merged.length > MAX_GALLERY_IMAGES) {
    hint = `최대 ${MAX_GALLERY_IMAGES}장까지입니다. 초과분은 제외되었습니다.`;
    merged = merged.slice(0, MAX_GALLERY_IMAGES);
  }
  return { merged, hint };
}

/**
 * 갤러리 등록용 다중 이미지: 파일 선택 + 「+」드롭 존으로 추가 + 미리보기
 * - 폼 제출용으로 숨김 input.files 를 DataTransfer 로 selectedFiles 와 동기화
 */
export function GalleryPhotoImageField({
  name = "images",
  accept = "image/jpeg,image/png,image/webp,image/avif,image/gif",
  required = true,
}: GalleryPhotoImageFieldProps) {
  const descriptionId = useId();
  const fileInputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedFilesRef = useRef<File[]>([]);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectionHint, setSelectionHint] = useState<string | null>(null);
  const [isOverAddZone, setIsOverAddZone] = useState(false);

  selectedFilesRef.current = selectedFiles;

  /** 선택 파일 ↔ 숨김 input (서버 액션 FormData) */
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const dataTransfer = new DataTransfer();
    for (const file of selectedFiles) {
      dataTransfer.items.add(file);
    }
    input.files = dataTransfer.files;
  }, [selectedFiles]);

  /** 미리보기 blob URL (교체 시 이전 URL revoke) */
  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => {
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
    };
  }, [selectedFiles]);

  /** 파일 선택창: 항상 새 선택으로 목록 교체 */
  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const list = event.target.files;
    if (!list?.length) {
      setSelectedFiles([]);
      setSelectionHint(null);
      event.target.value = "";
      return;
    }
    let images = Array.from(list).filter((f) => isAllowedImageFile(f));
    let hint: string | null = null;
    if (images.length > MAX_GALLERY_IMAGES) {
      hint = `한 번에 최대 ${MAX_GALLERY_IMAGES}장까지 등록됩니다. 나머지는 제외되었습니다.`;
      images = images.slice(0, MAX_GALLERY_IMAGES);
    }
    setSelectionHint(hint);
    setSelectedFiles(images);
    event.target.value = "";
  }

  /** 「+」존에 드롭: 기존 목록에 이어 붙임 */
  function handleAddZoneDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsOverAddZone(false);
    const dropped = Array.from(event.dataTransfer.files);
    const { merged, hint } = appendImageFiles(selectedFilesRef.current, dropped);
    if (dropped.length > 0 && merged.length === selectedFilesRef.current.length && hint === null) {
      setSelectionHint("이미지 파일만 추가할 수 있습니다. (jpg/png/webp/avif/gif)");
      return;
    }
    setSelectionHint(hint);
    setSelectedFiles(merged);
  }

  function handleAddZoneDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  function handleAddZoneDragEnter(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsOverAddZone(true);
  }

  function handleAddZoneDragLeave(event: React.DragEvent<HTMLDivElement>) {
    const related = event.relatedTarget as Node | null;
    if (related && event.currentTarget.contains(related)) return;
    setIsOverAddZone(false);
  }

  function openFilePicker() {
    inputRef.current?.click();
  }

  return (
    <div className="grid gap-2">
      <input
        ref={inputRef}
        id={fileInputId}
        type="file"
        name={name}
        accept={accept}
        required={required && selectedFiles.length === 0}
        multiple
        className="sr-only"
        aria-describedby={previewUrls.length > 0 ? descriptionId : undefined}
        onChange={handleInputChange}
      />

      <p className="text-xs text-[var(--color-muted)]">
        아래 <span className="font-medium text-[var(--color-ink-soft)]">+</span> 영역에 이미지를
        끌어다 놓거나 클릭해 추가할 수 있습니다. (최대 {MAX_GALLERY_IMAGES}장)
      </p>

      {selectionHint && (
        <p className="text-xs text-amber-800" role="status">
          {selectionHint}
        </p>
      )}

      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {previewUrls.map((src, index) => (
          <li
            key={`${src}-${index}`}
            className="relative aspect-[4/3] overflow-hidden border border-[var(--color-line)] bg-[var(--color-ivory)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- blob URL */}
            <img
              src={src}
              alt={`선택 이미지 ${index + 1}번 미리보기`}
              className="h-full w-full object-cover"
            />
          </li>
        ))}

        {/* 드롭 + 클릭으로 이미지 추가 */}
        <li className="aspect-[4/3] min-h-[88px]">
          <div
            role="button"
            tabIndex={0}
            onClick={openFilePicker}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openFilePicker();
              }
            }}
            onDrop={handleAddZoneDrop}
            onDragOver={handleAddZoneDragOver}
            onDragEnter={handleAddZoneDragEnter}
            onDragLeave={handleAddZoneDragLeave}
            className={`flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 border-2 border-dashed px-2 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-terracotta)] focus-visible:ring-offset-2 ${
              isOverAddZone
                ? "border-[var(--color-terracotta)] bg-[var(--color-cream)] text-[var(--color-terracotta)]"
                : "border-[var(--color-line)] bg-[var(--color-ivory)] text-[var(--color-muted)] hover:border-[var(--color-terracotta)]/60 hover:text-[var(--color-ink-soft)]"
            }`}
            aria-label="이미지를 여기에 놓아 추가하거나 클릭하여 파일 선택"
          >
            <span className="text-3xl font-light leading-none text-[var(--color-terracotta)]">+</span>
            <span className="text-[11px] leading-tight">끌어다 놓기 또는 클릭</span>
          </div>
        </li>
      </ul>

      {previewUrls.length > 0 && (
        <p id={descriptionId} className="text-xs text-[var(--color-muted)]">
          선택 {previewUrls.length}장 · 제출 시 서버에 업로드됩니다.
        </p>
      )}
    </div>
  );
}
