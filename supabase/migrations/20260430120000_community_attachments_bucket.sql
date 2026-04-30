-- 커뮤니티 게시글 첨부파일 전용 Storage 버킷
-- - 파일 메타데이터(이름/크기/경로 등)는 public.community_posts.attachments(jsonb) 컬럼에 보관
-- - 버킷은 public=true 로 두어 누구나 다운로드 가능 (관리자 업로드 → 일반 사용자 열람)
-- - 업로드/수정/삭제는 profiles.role = 'admin' 인 사용자만 허용
--
-- 참고: storage.buckets / storage.objects 테이블 자체는 supabase_admin 소유라
--       `comment on table storage.*` 같은 owner-only 명령은 호스팅 환경에서 실패함(SQLSTATE 42501).
--       대신 이 파일의 SQL 주석으로 의도를 남김.

insert into storage.buckets (id, name, public)
values ('community-attachments', 'community-attachments', true)
on conflict (id) do nothing;

-- 공개 읽기: bucket.public=true 만으로도 anon SELECT 가 가능하지만,
-- RLS 정책으로도 명시해 두어 추후 정책 변경 시 의도가 보이도록 함
drop policy if exists "community_attachments_public_read" on storage.objects;
create policy "community_attachments_public_read"
  on storage.objects
  for select
  using (bucket_id = 'community-attachments');

-- 관리자만 업로드 (INSERT)
drop policy if exists "community_attachments_admin_insert" on storage.objects;
create policy "community_attachments_admin_insert"
  on storage.objects
  for insert
  with check (
    bucket_id = 'community-attachments'
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- 관리자만 수정 (UPDATE)
drop policy if exists "community_attachments_admin_update" on storage.objects;
create policy "community_attachments_admin_update"
  on storage.objects
  for update
  using (
    bucket_id = 'community-attachments'
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  )
  with check (
    bucket_id = 'community-attachments'
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- 관리자만 삭제 (DELETE)
drop policy if exists "community_attachments_admin_delete" on storage.objects;
create policy "community_attachments_admin_delete"
  on storage.objects
  for delete
  using (
    bucket_id = 'community-attachments'
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );
