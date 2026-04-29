-- Auth 사용자별 프로필 및 관리자 역할 저장 (앱의 requireAdminUser / 대시보드와 연동)
-- Supabase Dashboard → SQL Editor에서 실행하거나, CLI로 `supabase db push` 로 적용

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user'
    constraint profiles_role_check check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is '로그인 사용자 1명당 1행. role=admin 인 경우만 /admin 대시보드 접근';

create index if not exists profiles_role_idx on public.profiles (role);

-- 회원가입 시 자동으로 profiles 행 생성 (기본 역할: user)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- RLS: service_role 키는 RLS를 우회하므로 서버(admin 클라이언트) 조회는 그대로 동작
alter table public.profiles enable row level security;

-- 본인 프로필만 조회 (클라이언트/anon 용도)
create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

-- 수정/삽입은 service_role(서버) 또는 SQL Editor에서만 수행 — 클라이언트가 role을 admin으로 바꾸는 것 방지

-- updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- 테이블 생성 전에 이미 가입한 사용자가 있다면 한 번 실행 (주석 해제):
-- insert into public.profiles (id, role)
-- select id, 'user' from auth.users
-- on conflict (id) do nothing;

-- 관리자 지정 예시 (Supabase SQL Editor에서 auth.users 의 id(uuid)로 교체 후 실행):
-- update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-000000000000';
