

# Replace Spotify with SoundCloud in Music Section

## Overview
Remove the Spotify tab and replace it with a SoundCloud tab in both the public music section and the admin panel. This involves creating a new database table and updating two components.

## Changes

### 1. Database Migration
Create a new `soundcloud_playlists` table with the same structure pattern as `spotify_playlists`, but with SoundCloud-specific fields:
- `id`, `title`, `description`, `soundcloud_url`, `embed_url`, `use_embed`, `is_active`, `display_order`, `created_at`
- RLS policies: public SELECT for active items, authenticated INSERT/UPDATE/DELETE for admin

### 2. Public Music Section (src/components/sections/MusicSection.tsx)
- Replace the `SpotifyPlaylist` interface with `SoundCloudPlaylist` (swap `spotify_url` for `soundcloud_url`)
- Change the data fetch from `spotify_playlists` to `soundcloud_playlists`
- Rename the tab from "Spotify" to "SoundCloud"
- Update the tab content to render SoundCloud embeds/links instead of Spotify ones
- SoundCloud embed iframes use URLs like `https://w.soundcloud.com/player/?url=...`

### 3. Admin Music Panel (src/components/admin/MusicPanel.tsx)
- Replace all Spotify-related state, interfaces, and CRUD functions with SoundCloud equivalents
- Update the admin tab label from "Spotify Playlists" to "SoundCloud"
- Update the add/edit dialog fields: replace "Spotify URL" with "SoundCloud URL" and placeholder text
- Update all toast messages and button labels accordingly

## What stays the same
- "My Tracks" tab (original beats) -- unchanged
- "YouTube" tab -- unchanged
- The existing `spotify_playlists` table remains in the database (no destructive migration)

## Technical Details
- The `spotify_playlists` table is left in place (not dropped) to avoid data loss
- New `soundcloud_playlists` table follows the same RLS pattern
- SoundCloud embed format: `https://w.soundcloud.com/player/?url=https://soundcloud.com/...&auto_play=false`
- Helper function to auto-generate embed URL from a regular SoundCloud URL

## Suggestions for future additions
- **Blog/Writing section**: Share thoughts, tutorials, or behind-the-scenes content
- **Testimonials/Reviews**: Display feedback from clients or collaborators
- **Skills/Tech Stack visualization**: Interactive display of your technical abilities
- **Dark/Light mode toggle**: Let visitors choose their preferred theme
- **Analytics dashboard** in admin: Track page views and visitor engagement

