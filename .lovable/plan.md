
# Phase 2 Implementation Plan
## Gated Resume System + YouTube Music Integration

This plan covers two major features:
1. **Gated Resume Download System** - Replace direct downloads with a request-and-approval workflow with email notifications
2. **YouTube Music Playlists** - Add YouTube playlist support alongside existing Spotify playlists

---

## Part 1: YouTube Music Integration

### 1.1 Update MusicSection.tsx
Add YouTube playlists alongside Spotify playlists in the frontend:
- Fetch from `youtube_playlists` table
- Display YouTube embeds using the standard iframe embed format
- Add a third tab or integrate into the existing "Playlists" tab with platform indicators

### 1.2 Update MusicPanel.tsx (Admin)
Extend the admin panel to manage YouTube playlists:
- Add a "YouTube Playlists" tab alongside "My Tracks" and "Spotify Playlists"
- CRUD operations for YouTube playlists (title, URL, embed URL, description, active status)
- Auto-generate embed URL from YouTube playlist URL

---

## Part 2: Gated Resume System

### 2.1 Create Resume Request Modal
Replace the direct download button in ResumeSection.tsx with a request flow:
- Modal form collecting: name, email, optional notes
- Submit to `resume_requests` table
- Show success message after submission

### 2.2 Create Edge Function: send-resume-notification
Backend function using Resend to send emails:
- **Admin notification**: When a new request is submitted, email the admin
- **Approval email**: When admin approves, send requester an email with unique download link

### 2.3 Create Resume Requests Panel (Admin)
New admin section to manage resume requests:
- List all pending/approved/rejected requests
- Approve/reject actions with one click
- View requester details and notes
- Approval triggers the email edge function

### 2.4 Create Token-Validated Download Route
New page at `/resume/download/:token`:
- Validates the download token against `resume_requests` table
- If valid and approved, redirects to the actual resume file
- If invalid or pending, shows appropriate error message

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/send-resume-notification/index.ts` | Edge function for email notifications |
| `src/components/admin/ResumeRequestsPanel.tsx` | Admin panel for managing requests |
| `src/components/sections/ResumeRequestModal.tsx` | Modal for visitors to request resume |
| `src/pages/ResumeDownload.tsx` | Token-validated download page |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/sections/MusicSection.tsx` | Add YouTube playlist fetching and display |
| `src/components/admin/MusicPanel.tsx` | Add YouTube playlist CRUD tab |
| `src/components/sections/ResumeSection.tsx` | Replace download button with request modal trigger |
| `src/pages/AdminPage.tsx` | Add Resume Requests panel to sidebar |
| `src/App.tsx` | Add `/resume/download/:token` route |
| `supabase/config.toml` | Register the new edge function |

---

## Technical Details

### Edge Function: send-resume-notification

```text
Endpoint: POST /send-resume-notification
Actions:
  - "new_request": Sends admin notification email
  - "approved": Sends download link to requester

Required Secret: RESEND_API_KEY
```

### YouTube Embed URL Format
Converts `https://www.youtube.com/playlist?list=PLAYLIST_ID` to `https://www.youtube.com/embed/videoseries?list=PLAYLIST_ID`

### Resume Download Flow

```text
1. Visitor clicks "Request Resume" button
2. Modal opens - they enter name, email, notes
3. Request saved to database, edge function sends admin notification
4. Admin sees request in dashboard, clicks "Approve"
5. Edge function sends email to requester with unique link
6. Requester clicks link, token validated, resume downloads
```

---

## Implementation Order

1. Store the RESEND_API_KEY secret
2. Create the edge function for email notifications
3. Create the Resume Request Modal component
4. Update ResumeSection to use the modal
5. Create the ResumeRequestsPanel for admin
6. Update AdminPage to include the new panel
7. Create the token-validated download page
8. Add the download route to App.tsx
9. Update MusicSection for YouTube playlists
10. Update MusicPanel for YouTube CRUD
