-- 다른 DB에서 gallery_photos 행을 id 를 지정해 넣은 경우, identity 시퀀스가 최대 id 를 따라가지 않아
-- 신규 insert 시 duplicate key (23505) 가 나고 관리자 화면에서는 error=insert 로만 보입니다.
-- 배포 후 한 번 실행되면 이후 신규 활동사진 등록이 정상 동작합니다.
select setval(
  pg_get_serial_sequence('public.gallery_photos', 'id'),
  coalesce((select max(id) from public.gallery_photos), 0),
  true
);
