-- =====================================================================
-- merge-duplicate-categories.sql — phase-2 SEO data cleanup (owner-run)
-- =====================================================================
-- Problem: two Category rows share the display name "Business":
--   A) slug = 'business'                          (canonical, 5 published posts)
--   B) slug = 'کسب-و-کار' (URL-encoded in links)  (duplicate, 0 published posts)
-- Result: the blog filter bar rendered the chip twice, and the empty
-- duplicate generated a second, content-less filter URL.
--
-- The app-level fix (published-only category filter, commit in seo/phase-2)
-- already HIDES the duplicate. This script finishes the job at the data
-- layer: move any posts/tags still attached to B onto A, then delete B.
--
-- Where to run: Supabase SQL Editor (or any Postgres client with the prod
-- connection string). Idempotent — safe to run twice.
-- Verify first:  SELECT id, slug, name_en FROM "Category" WHERE name_en = 'Business';
-- =====================================================================

-- 0) Pin the two rows (adjust ids if your SELECT above differs).
WITH dup AS (
  SELECT id FROM "Category" WHERE slug = 'کسب-و-کار'
), keep AS (
  SELECT id FROM "Category" WHERE slug = 'business'
)
SELECT (SELECT id FROM dup) AS duplicate_id, (SELECT id FROM keep) AS canonical_id;

-- 1) Move post links from the duplicate onto the canonical category.
--    Prisma implicit m:n join table for Category↔Post is "CategoryToPost".
--    ON CONFLICT guards against a post already linked to both rows.
UPDATE "_CategoryToPost" cp
SET    "A" = (SELECT id FROM "Category" WHERE slug = 'business')
WHERE  cp."A" = (SELECT id FROM "Category" WHERE slug = 'کسب-و-کار')
ON CONFLICT DO NOTHING;

-- 2) If the duplicate still owns links that conflicted (post already in
--    canonical), drop those leftover links so the row can be deleted.
DELETE FROM "_CategoryToPost"
WHERE  "A" = (SELECT id FROM "Category" WHERE slug = 'کسب-و-کار');

-- 3) Delete the empty duplicate.
DELETE FROM "Category"
WHERE  slug = 'کسب-و-کار'
  AND NOT EXISTS (
    SELECT 1 FROM "_CategoryToPost" cp
    WHERE cp."A" = "Category".id
  );

-- 4) Sanity check — must return exactly ONE Business row, with ≥1 post.
SELECT c.slug, c."nameEn", COUNT(cp."B") AS published_links
FROM "Category" c
LEFT JOIN "_CategoryToPost" cp ON cp."A" = c.id
WHERE c."nameEn" = 'Business'
GROUP BY c.id, c.slug, c."nameEn";
