-- 커뮤니티 게시글 조회수 원자적 증가 RPC 함수
-- 클라이언트(서버 컴포넌트)에서 select → update 를 따로 하면 race condition 으로
-- 동시 접속 시 누락이 발생할 수 있어, 단일 update + returning 으로 묶는다.
create or replace function public.increment_community_post_view(p_post_id bigint)
returns integer
language sql
security definer
set search_path = public
as $$
  update public.community_posts
     set view_count = view_count + 1
   where id = p_post_id
     and is_published = true
  returning view_count;
$$;

comment on function public.increment_community_post_view(bigint) is
  '공개 커뮤니티 게시글 조회 시 view_count 를 1 증가시키고 새로운 값을 반환';

-- service_role / authenticated / anon 모두 호출 가능 (앱은 service_role 만 사용)
grant execute on function public.increment_community_post_view(bigint) to anon, authenticated, service_role;
