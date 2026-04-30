-- 활동사진 vs 언론 보도 구분 (공개 페이지 /gallery/photos · /gallery/press)
alter table public.gallery_photos
  add column if not exists gallery_kind text not null default 'activity';

alter table public.gallery_photos
  drop constraint if exists gallery_photos_gallery_kind_check;

alter table public.gallery_photos
  add constraint gallery_photos_gallery_kind_check
  check (gallery_kind in ('activity', 'press'));

comment on column public.gallery_photos.gallery_kind is 'activity=/gallery/photos, press=/gallery/press';

create index if not exists gallery_photos_kind_published_sort_idx
  on public.gallery_photos (gallery_kind, is_published, sort_order desc, created_at desc);
