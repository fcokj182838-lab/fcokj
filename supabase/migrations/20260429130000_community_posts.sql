-- 커뮤니티 게시글 (공개 페이지 + 관리자 CRUD)
create table if not exists public.community_posts (
  id bigint generated always as identity primary key,
  title text not null,
  content text not null,
  is_published boolean not null default true,
  author_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint community_posts_title_len check (char_length(title) <= 500)
);

comment on table public.community_posts is '커뮤니티 공지/소식. is_published=false 는 관리자만 조회';

create index if not exists community_posts_created_at_idx on public.community_posts (created_at desc);
create index if not exists community_posts_published_idx on public.community_posts (is_published);

alter table public.community_posts enable row level security;

-- 앱은 service_role 클라이언트로 접근해 RLS 우회 (anon 정책 없음)

create or replace function public.set_community_posts_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists community_posts_set_updated_at on public.community_posts;

create trigger community_posts_set_updated_at
  before update on public.community_posts
  for each row
  execute function public.set_community_posts_updated_at();
