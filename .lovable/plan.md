

# Three Changes: Profile Pic Size, Beat Download Protection, Gallery Watermark

## 1. Reduce Profile Picture Size by Half

**File:** `src/components/sections/AboutSection.tsx`

The profile image container currently uses `max-w-md` (max-width: 28rem / 448px). Change it to `max-w-[14rem]` (224px) to make it half the size. Also reduce the fallback icon size proportionally.

- Line 53: Change `max-w-md` to `max-w-[14rem]`
- Line 62: Change `w-32 h-32` to `w-16 h-16` on the fallback User icon

## 2. Restrict Downloading Original Beats

**File:** `src/components/sections/MusicSection.tsx`

Currently, `new Audio(track.audio_url)` is used for playback, and the raw audio URL is accessible in the page source. While it's impossible to fully prevent downloads from a determined user (the browser must receive the data to play it), we can add practical deterrents:

- Wrap the tracks section with an `onContextMenu` handler to disable right-click (prevents casual "Save As")
- Add a visible note like "Streaming only -- downloads not available" to set expectations
- Do NOT render the raw `audio_url` in any visible DOM element or download link

These are reasonable client-side protections. For stronger protection, a streaming-only backend (signed, expiring URLs) would be needed in the future.

## 3. Add "NaSy" Watermark Overlay to Gallery Images

**File:** `src/components/sections/GallerySection.tsx`

Add a semi-transparent "NaSy" text overlay on every gallery image using CSS positioning. This doesn't modify the original uploaded files but visually brands every image displayed on the site.

### Grid images (lines 143-158):
- Add a persistent semi-transparent text overlay positioned diagonally or centered on each image with the text "NaSy"
- Use CSS `pointer-events-none` so it doesn't interfere with click-to-lightbox behavior
- Style: white text, ~30% opacity, large font, rotated slightly for a watermark effect

### Lightbox images (lines 194-199):
- Add the same watermark overlay on the full-size lightbox view to prevent screenshotting clean images

### Also disable right-click on gallery images:
- Add `onContextMenu={(e) => e.preventDefault()}` to prevent "Save Image As"

## Technical Details

- No database changes needed
- No new dependencies
- All changes are CSS/JSX only in three component files
- The watermark is a visual CSS overlay, not burned into the image file itself

