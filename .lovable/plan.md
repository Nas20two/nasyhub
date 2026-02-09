
# Add Forgot Password for Admin

## Overview

Add a "Forgot Password" feature to the authentication page that allows admins to reset their password via email. This uses the built-in authentication password reset flow which is simple and secure.

---

## What You'll Get

- "Forgot Password?" link on the login form
- Modal/view to enter email address
- Password reset email sent via the authentication system
- Reset password page where users set a new password
- Smooth UX with loading states and success/error feedback

---

## User Flow

```text
1. User clicks "Forgot Password?" on login form
     ↓
2. User enters their email address
     ↓
3. System sends password reset link via email
     ↓
4. User clicks link in email → redirected to /auth/reset-password
     ↓
5. User enters new password → redirected to /admin
```

---

## Technical Details

### File Changes

| File | Change |
|------|--------|
| `src/pages/AuthPage.tsx` | Add forgot password view with email input and reset trigger |
| `src/pages/ResetPasswordPage.tsx` | **New file** - Page to set new password after clicking email link |
| `src/App.tsx` | Add route for `/auth/reset-password` |

### AuthPage.tsx Changes

- Add `forgotPassword` state to toggle between login and forgot password views
- Add "Forgot Password?" link below the password field
- Create forgot password form with:
  - Email input field
  - Submit button that calls `supabase.auth.resetPasswordForEmail()`
  - Redirect URL set to `/auth/reset-password`
  - Success message: "Check your email for reset link"
  - "Back to login" link

### ResetPasswordPage.tsx (New)

- Listen for `PASSWORD_RECOVERY` event from `onAuthStateChange`
- Show new password form (with confirmation field)
- Call `supabase.auth.updateUser({ password })` to set new password
- Redirect to `/admin` on success
- Handle errors gracefully

### App.tsx Changes

- Add new route: `/auth/reset-password` → `ResetPasswordPage`

---

## Security Considerations

- Uses the built-in authentication password reset (secure, rate-limited)
- No custom edge function needed
- Password reset tokens expire automatically
- New password validation with minimum 6 characters

---

## Summary

This is a straightforward implementation using the built-in authentication features. No database changes or new edge functions are required since password reset is handled natively by the authentication system.
