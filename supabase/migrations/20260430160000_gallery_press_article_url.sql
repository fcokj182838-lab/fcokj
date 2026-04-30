-- 언론 갤러리: 원문 기사 URL (공개 페이지에서 새 탭으로 열기)
-- 링크만 등록한 항목은 Storage 경로가 없을 수 있음 (썸네일은 외부 OG 이미지를 복사해 올리거나 플레이스홀더 URL 사용)
alter table public.gallery_photos
  add column if not exists article_url text;

comment on column public.gallery_photos.article_url is '언론 기사 원문 URL (공개 카드 클릭 시 새 탭)';

alter table public.gallery_photos
  alter column image_path drop not null;

comment on column public.gallery_photos.image_path is 'Supabase Storage 내 파일 경로. 링크 전용 언론 항목은 null 가능';
