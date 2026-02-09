
# Add Social Links to Footer

## Overview

Enhance the footer with social media links (GitHub, LinkedIn, Twitter) that are dynamically loaded from the database, matching the contact section. The links will have smooth hover animations for a polished feel.

---

## What You'll Get

- Social media icons (GitHub, LinkedIn, Twitter) displayed in the footer
- Smooth hover effects with scale and color transitions
- Links pulled dynamically from your profile settings in the database
- Graceful handling when links aren't configured (only shows configured links)
- Consistent styling that matches the rest of the portfolio

---

## Visual Layout

```text
+------------------------------------------------------------------+
|  © 2026 NaSy Hub. All rights reserved.    [GH] [LI] [TW]   Made with ♥ using Lovable  |
+------------------------------------------------------------------+
```

On mobile, the layout will stack vertically with social links centered.

---

## Technical Details

### File Changes

**`src/components/layout/Footer.tsx`**
- Add state to store social links from the `profiles` table
- Fetch social URLs on component mount (same pattern as ContactSection)
- Render social icons with:
  - Lucide icons (Github, Linkedin, Twitter)
  - Hover effects: scale up + primary color transition
  - Links open in new tab with proper `rel` attributes
- Only display links that are configured (filter out null/empty URLs)

### Dependencies
- Uses existing Lucide React icons (already installed)
- Uses existing Supabase client integration
- No new packages required

---

## Summary

| Change | Description |
|--------|-------------|
| Footer.tsx | Add social links with hover effects, fetched from database |

This is a quick enhancement that adds professional polish to the footer while staying consistent with the existing codebase patterns.
