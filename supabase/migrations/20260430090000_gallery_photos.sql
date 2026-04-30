-- 갤러리 사진 (공개 페이지 + 관리자 CRUD)
-- 관리자가 올리는 활동 사진을 카드 형태로 보여주기 위한 테이블
create table if not exists public.gallery_photos (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  image_url text not null,
  image_path text not null,
  taken_at date,
  sort_order int not null default 0,
  is_published boolean not null default true,
  author_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gallery_photos_title_len check (char_length(title) <= 200),
  constraint gallery_photos_desc_len check (description is null or char_length(description) <= 2000)
);

comment on table public.gallery_photos is '활동사진 갤러리. is_published=false 는 관리자만 조회';
comment on column public.gallery_photos.image_path is 'Supabase Storage 내 파일 경로. 삭제 시 사용';

create index if not exists gallery_photos_published_created_idx
  on public.gallery_photos (is_published, sort_order desc, created_at desc);

alter table public.gallery_photos enable row level security;

-- 앱은 service_role 클라이언트로 접근해 RLS 우회 (community_posts 와 동일 정책)

create or replace function public.set_gallery_photos_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists gallery_photos_set_updated_at on public.gallery_photos;

create trigger gallery_photos_set_updated_at
  before update on public.gallery_photos
  for each row
  execute function public.set_gallery_photos_updated_at();

-- Storage 버킷 생성 (public read 허용)
-- 이미 존재하면 무시
insert into storage.buckets (id, name, public)
values ('gallery-photos', 'gallery-photos', true)
on conflict (id) do nothing;
