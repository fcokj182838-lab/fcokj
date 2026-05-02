-- 다중 팝업 배너: 기존 site_popup_banner 단일 행을 site_popup_banners 로 이전 후 구 테이블 제거

create table if not exists public.site_popup_banners (
  id bigint generated always as identity primary key,
  is_enabled boolean not null default false,
  title text not null default '',
  body text not null default '',
  image_url text not null default '',
  link_url text not null default '',
  publish_start_date date,
  publish_end_date date,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.site_popup_banners is '방문자용 팝업 배너(여러 건, sort_order·id 오름차순으로 순차 표시)';

create index if not exists site_popup_banners_sort_id_idx
  on public.site_popup_banners (sort_order asc, id asc);

drop trigger if exists site_popup_banners_set_updated_at on public.site_popup_banners;
create trigger site_popup_banners_set_updated_at
  before update on public.site_popup_banners
  for each row
  execute function public.set_updated_at();

alter table public.site_popup_banners enable row level security;

drop policy if exists "site_popup_banners_select_public" on public.site_popup_banners;
create policy "site_popup_banners_select_public"
  on public.site_popup_banners
  for select
  using (true);

drop policy if exists "site_popup_banners_insert_admin" on public.site_popup_banners;
create policy "site_popup_banners_insert_admin"
  on public.site_popup_banners
  for insert
  with check (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

drop policy if exists "site_popup_banners_update_admin" on public.site_popup_banners;
create policy "site_popup_banners_update_admin"
  on public.site_popup_banners
  for update
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

drop policy if exists "site_popup_banners_delete_admin" on public.site_popup_banners;
create policy "site_popup_banners_delete_admin"
  on public.site_popup_banners
  for delete
  using (
    exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

insert into public.site_popup_banners (
  is_enabled,
  title,
  body,
  image_url,
  link_url,
  publish_start_date,
  publish_end_date,
  sort_order
)
select
  s.is_enabled,
  s.title,
  s.body,
  s.image_url,
  s.link_url,
  s.publish_start_date,
  s.publish_end_date,
  0
from public.site_popup_banner s;

drop table if exists public.site_popup_banner cascade;
