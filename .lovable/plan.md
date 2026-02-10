
# Fix Gallery Section and Image Display Issues

## Problem

The Gallery Section (`GallerySection.tsx`) is hardcoded with placeholder data and never fetches images from the database. You uploaded images through the admin panel, and they're stored correctly in the database with proper storage URLs, but the public-facing gallery ignores them entirely.

## What Will Be Fixed

1. **Gallery Section not loading database images** -- The gallery will fetch real images and categories from the database instead of showing placeholders
2. **Apps admin panel missing image upload** -- Currently you can only paste a URL for app images; adding a file upload button so you can upload screenshots directly

## Changes

### 1. `src/components/sections/GallerySection.tsx` (Major Rewrite)

- Remove all hardcoded placeholder data
- Add `useEffect` to fetch from `gallery_images` and `gallery_categories` tables
- Filter by `is_active = true` and order by `display_order`
- Build category filter dynamically from database categories
- Display actual uploaded images in the masonry grid and lightbox
- Add loading and empty states

### 2. `src/components/admin/AppsPanel.tsx` (Enhancement)

- Add a file upload button next to the Image URL input (same pattern used in GalleryPanel)
- Upload images to the existing storage bucket or a new one
- This way you can upload app screenshots directly instead of only pasting URLs

## Technical Notes

- Gallery images are already stored in the `gallery` storage bucket with public URLs (e.g., `https://wzxveogdratuuxqixovz.supabase.co/storage/v1/object/public/gallery/...`)
- The `gallery` bucket is already public, so no signed URLs are needed
- RLS policies already allow public SELECT on `gallery_images` where `is_active = true`
- No database migrations required
