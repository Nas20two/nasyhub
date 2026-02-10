

# Fix Profile Picture Not Displaying

## Root Cause

Two issues identified:

1. **Stale data on public pages**: The public-facing components (About section, etc.) fetch profile data once on mount via `get_public_profile()`. After uploading and saving a new avatar in the admin panel, the public pages still show cached (null) data until manually refreshed.

2. **Potential stale closure bug in ProfilePanel**: The `handleAvatarUpload` function uses `setProfile({ ...profile, avatar_url: urlData.publicUrl })` where `profile` comes from the enclosing closure. If the user edits other fields before the upload completes, those edits could be lost. While not the primary cause here, it should be fixed for reliability.

## Verification

- Database query confirms `avatar_url` is correctly stored: `https://wzxveogdratuuxqixovz.supabase.co/storage/v1/object/public/avatars/avatar-1770764623843.jpeg`
- The `get_public_profile()` RPC function correctly returns this URL when called directly
- The `avatars` storage bucket is public, so the image URL is accessible
- Browser network logs show the RPC returned `null` at page load time (before the save)

## Changes

### 1. Fix stale closure in ProfilePanel avatar upload (src/components/admin/ProfilePanel.tsx)

Replace the state update in `handleAvatarUpload` to use the functional form of `setProfile`:

```tsx
// Before (stale closure risk):
setProfile({ ...profile, avatar_url: urlData.publicUrl });

// After (safe):
setProfile((prev) => ({ ...prev, avatar_url: urlData.publicUrl }));
```

Apply the same fix to `handleResumeUpload`:

```tsx
setProfile((prev) => ({ ...prev, resume_url: urlData.publicUrl }));
```

### 2. Auto-save avatar_url to database after upload (src/components/admin/ProfilePanel.tsx)

After a successful avatar upload, immediately persist the new URL to the database so the user doesn't need to remember to click "Save Changes":

```tsx
// After getting the public URL, update DB directly
if (profile.id) {
  await supabase.from("profiles").update({ avatar_url: urlData.publicUrl }).eq("id", profile.id);
}
```

This ensures the avatar URL is saved to the database immediately, not just in local component state.

## Technical Details

- No database migrations needed -- the schema and RPC function are correct
- No storage changes needed -- the `avatars` bucket is already public
- The fix is entirely in the frontend `ProfilePanel.tsx` component

