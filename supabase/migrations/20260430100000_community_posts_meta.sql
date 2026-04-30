-- 커뮤니티 게시글에 조회수/첨부파일 메타 컬럼 추가
-- view_count: 게시글이 조회된 횟수 (공개 목록·상세에서 노출)
-- attachments: 첨부파일 메타데이터(JSON 배열). 예) [{"name":"file.pdf","url":"...","size":12345}]
alter table public.community_posts
  add column if not exists view_count integer not null default 0,
  add column if not exists attachments jsonb not null default '[]'::jsonb;

comment on column public.community_posts.view_count is '게시글 조회수. 공개 페이지에서 증가';
comment on column public.community_posts.attachments is '첨부파일 메타데이터 JSON 배열';

-- 첨부파일은 JSON 배열이어야 함 (객체/문자열 차단)
alter table public.community_posts
  drop constraint if exists community_posts_attachments_is_array;

alter table public.community_posts
  add constraint community_posts_attachments_is_array
  check (jsonb_typeof(attachments) = 'array');
