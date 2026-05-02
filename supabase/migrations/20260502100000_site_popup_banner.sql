-- 사이트 전역 팝업 배너(단일 행 id=1). 방문자 페이지에서 표시, 관리자가 내용 설정.
create table if not exists public.site_popup_banner (
  id smallint primary key check (id = 1),
  is_enabled boolean not null default false,
  title text not null default '',
  body text not null default '',
  image_url text not null default '',
  link_url text not null default '',
  updated_at timestamptz not null default now()
);

comment on table public.site_popup_banner is '홈 등 방문자용 팝업 배너 설정(항상 id=1 한 행)';

insert into public.site_popup_banner (id)
values (1)
on conflict (id) do nothing;

drop trigger if exists site_popup_banner_set_updated_at on public.site_popup_banner;
create trigger site_popup_banner_set_updated_at
  before update on public.site_popup_banner
  for each row
  execute function public.set_updated_at();

alter table public.site_popup_banner enable row level security;

drop policy if exists "site_popup_banner_select_public" on public.site_popup_banner;
create policy "site_popup_banner_select_public"
  on public.site_popup_banner
  for select
  using (true);

drop policy if exists "site_popup_banner_update_admin" on public.site_popup_banner;
create policy "site_popup_banner_update_admin"
  on public.site_popup_banner
  for update
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  )
  with check (id = 1);
