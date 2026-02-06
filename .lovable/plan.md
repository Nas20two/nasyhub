

# NaSy Hub Enhancement Plan

This plan covers three main features: admin role grant, editable content from admin panel, and a gated resume request system. Given the scope, I'm structuring this as **Phase 1 (today)** and **Phase 2 (tomorrow)** to stay within your 5-credit budget.

---

## Phase 1: Admin Role + Editable Content (Today - ~3 credits)

### Step 1: Grant Admin Role
Run SQL to assign admin role to the first registered user:
```sql
INSERT INTO user_roles (user_id, role) 
SELECT id, 'admin' FROM auth.users LIMIT 1;
```

### Step 2: Make Frontend Sections Dynamic
Currently, Hero, About, Contact sections have hardcoded content. I'll update them to pull from the `profiles` table so you can edit everything from admin:

**Changes to sections:**
- `HeroSection.tsx` - Fetch tagline/subtitle from profiles table
- `AboutSection.tsx` - Fetch bio, avatar, skills from profiles table  
- `ContactSection.tsx` - Fetch email, location, social links from profiles table
- `ResumeSection.tsx` - Fetch experience/education from a new table

**Database additions:**
- Add `hero_tagline`, `hero_subtitle` columns to `profiles` table
- Create `resume_entries` table (for experience/education items)

### Step 3: Extend Admin Profile Panel
Add fields for:
- Hero tagline & subtitle
- Skills list (editable)
- Resume entries management (add/edit/delete experience & education)

---

## Phase 2: Gated Resume System + YouTube Support (Tomorrow - ~2 credits)

### Step 1: Create Resume Requests Table
```sql
CREATE TABLE resume_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_email TEXT NOT NULL,
    requester_name TEXT NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'pending', -- pending, approved, rejected
    download_token UUID DEFAULT gen_random_uuid(),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Step 2: Update Resume Section UI
- Replace direct download button with "Request Resume" button
- Show request form modal (name, email, brief note)
- Confirmation message after submission

### Step 3: Admin Resume Requests Panel
- Add "Resume Requests" tab to admin dashboard
- Show pending requests with requester details
- Approve/Reject buttons with one-click actions

### Step 4: Email Notifications via Edge Function
Create `send-resume-notification` edge function:
- When request submitted: Email you with requester details
- When approved: Email requester with unique download link
- Uses Resend for email delivery (will need RESEND_API_KEY)

### Step 5: Secure Download Page
- Create `/resume/download/:token` route
- Validates token against approved requests
- Serves resume file only for valid, approved tokens

### Step 6: YouTube Music/Playlists Support
Add YouTube playlist embedding alongside existing Spotify support:

**Database:**
```sql
CREATE TABLE youtube_playlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    youtube_url TEXT NOT NULL,
    embed_url TEXT,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Admin Panel:**
- Add YouTube tab/section in MusicPanel
- CRUD operations for YouTube playlists (title, URL, description)
- Auto-generate embed URL from YouTube playlist/video URL

**Frontend:**
- Display YouTube embeds in MusicSection alongside Spotify
- Support both playlist and video embeds

---

## Summary

| Phase | Features | Estimated Credits |
|-------|----------|-------------------|
| Phase 1 | Admin role, dynamic content, editable sections | ~3 credits |
| Phase 2 | Gated resume with email workflow | ~2 credits |

---

## What You'll Be Able To Do After Phase 1

- Log in as admin and edit your profile content
- Changes to bio, tagline, skills, social links appear immediately on homepage
- Manage experience/education entries for resume section
- Full CRUD on apps, prototypes, gallery, music (already working)

## What Phase 2 Adds

- Visitors request your resume instead of downloading directly
- You receive email notifications for each request
- One-click approve/reject from admin panel
- Approved visitors get unique download link via email

---

Ready to start Phase 1 today?

