-- 팝업 배너 게시 기간(한국 날짜 기준으로 앱에서 비교). 비우면 기간 제한 없음.
alter table public.site_popup_banner
  add column if not exists publish_start_date date,
  add column if not exists publish_end_date date;

comment on column public.site_popup_banner.publish_start_date is '게시 시작일(포함). null 이면 시작 제한 없음';
comment on column public.site_popup_banner.publish_end_date is '게시 종료일(포함). null 이면 종료 제한 없음';
