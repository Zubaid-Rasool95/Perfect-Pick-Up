-- =============================================================================
-- Perfect Pick Up — image storage
--
-- One public bucket for restaurant hero images, logos and dish photos.
--
-- Public read: these images are shown to anonymous visitors browsing the
-- directory, so there is no session to authorise against.
--
-- Writes are NOT governed by storage policies. The browser uploads with a
-- short-lived signed URL that /api/uploads issues only after checking the
-- caller is a vendor or an admin, so authorisation lives beside the app's
-- other role checks instead of being split across two systems.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  5242880,  -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do update
  set public             = excluded.public,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Folders in use:
--   vendors/  restaurant hero images
--   logos/    restaurant logos
--   menu/     dish photos
--
-- Filenames are random UUIDs, which avoids collisions and stops a replaced
-- image being served from a stale CDN cache under its old URL.
