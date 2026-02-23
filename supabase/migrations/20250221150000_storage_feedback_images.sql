-- =============================================================================
-- Storage bucket for feedback image uploads (image_urls in feedbacks table).
-- If this migration fails on remote (storage schema permissions), create the
-- bucket in Dashboard: Storage → New bucket → id: feedback-images, Public: on,
-- file size limit 5MB, allowed types: image/jpeg, image/png, image/gif, image/webp.
-- Then run the two CREATE POLICY blocks below in SQL Editor.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'feedback-images',
  'feedback-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Authenticated users can upload feedback images" on storage.objects;
create policy "Authenticated users can upload feedback images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'feedback-images');

drop policy if exists "Public read feedback images" on storage.objects;
create policy "Public read feedback images"
  on storage.objects for select to public
  using (bucket_id = 'feedback-images');
