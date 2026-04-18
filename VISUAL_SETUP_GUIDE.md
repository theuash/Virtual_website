# Visual Setup Guide - Google OAuth

## The Problem

```
┌─────────────────────────────────────────────────────────┐
│ User clicks "Login with Google"                         │
│                                                         │
│ ❌ Nothing happens                                      │
│ ❌ No popup appears                                     │
│ ❌ Error in console                                     │
└─────────────────────────────────────────────────────────┘
```

## The Root Cause

```
┌──────────────────────────────────────────────────────────┐
│ Google OAuth App Configuration                           │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Authorized JavaScript Origins:                          │
│ ❌ Missing: https://virtual-core.netlify.app            │
│                                                          │
│ Authorized Redirect URIs:                               │
│ ❌ Missing: https://virtual-230s.onrender.com           │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## The Solution

### Step 1: Open Google Cloud Console

```
https://console.cloud.google.com/
         ↓
    [Your Project]
         ↓
    APIs & Services
         ↓
    Credentials
         ↓
    [Your OAuth Client ID]
```

### Step 2: Add Authorized JavaScript Origins

```
┌──────────────────────────────────────────────────────────┐
│ Authorized JavaScript origins                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ [+ Add URI]                                              │
│                                                          │
│ ✓ http://localhost:5173                                 │
│ ✓ http://localhost:3000                                 │
│ ✓ https://virtual-core.netlify.app                      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Step 3: Add Authorized Redirect URIs

```
┌──────────────────────────────────────────────────────────┐
│ Authorized redirect URIs                                 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ [+ Add URI]                                              │
│                                                          │
│ ✓ http://localhost:5001                                 │
│ ✓ http://localhost:5001/api/auth/google/callback        │
│ ✓ https://virtual-230s.onrender.com                     │
│ ✓ https://virtual-230s.onrender.com/api/auth/google/... │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Step 4: Save

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                    [SAVE BUTTON]                         │
│                                                          │
│              ✓ Changes saved successfully                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Step 5: Wait 5-10 Minutes

```
⏳ ⏳ ⏳ ⏳ ⏳ ⏳ ⏳ ⏳ ⏳ ⏳
Google propagates changes
```

### Step 6: Test

```
https://virtual-core.netlify.app/login
         ↓
    [Login with Google]
         ↓
    Google Popup Appears ✅
         ↓
    User Authenticates
         ↓
    Redirects to Dashboard ✅
```

---

## Configuration Checklist

### Frontend (.env)
```
✓ VITE_GOOGLE_CLIENT_ID=554046531423-vim40jl5crv8vha0hcbscq3ednkj7748.apps.googleusercontent.com
```

### Backend (.env)
```
✓ GOOGLE_CLIENT_ID=554046531423-vim40jl5crv8vha0hcbscq3ednkj7748.apps.googleusercontent.com
✓ GOOGLE_CLIENT_SECRET=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
```

### Netlify Environment
```
✓ VITE_GOOGLE_CLIENT_ID=554046531423-vim40jl5crv8vha0hcbscq3ednkj7748.apps.googleusercontent.com
```

### Render Environment
```
✓ GOOGLE_CLIENT_ID=554046531423-vim40jl5crv8vha0hcbscq3ednkj7748.apps.googleusercontent.com
✓ GOOGLE_CLIENT_SECRET=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
```

### Google Cloud Console
```
✓ Authorized JavaScript Origins (3 added)
✓ Authorized Redirect URIs (4 added)
```

---

## How Google Auth Works

```
┌─────────────────────────────────────────────────────────┐
│ User Flow                                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 1. User clicks "Login with Google"                      │
│    ↓                                                    │
│ 2. Google popup opens                                   │
│    ↓                                                    │
│ 3. User authenticates with Google                       │
│    ↓                                                    │
│ 4. Google returns access token to frontend              │
│    ↓                                                    │
│ 5. Frontend sends token to backend                      │
│    ↓                                                    │
│ 6. Backend verifies token with Google                   │
│    ↓                                                    │
│ 7. Backend creates/updates user in database             │
│    ↓                                                    │
│ 8. Backend returns JWT token to frontend                │
│    ↓                                                    │
│ 9. Frontend stores JWT and redirects to dashboard       │
│    ↓                                                    │
│ 10. User logged in ✅                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Troubleshooting Flow

```
Google Login Not Working?
         ↓
    ┌─────────────────────────────────────┐
    │ Check browser console (F12)         │
    │ Look for error message              │
    └─────────────────────────────────────┘
         ↓
    ┌─────────────────────────────────────┐
    │ Error: "Origin mismatch"            │
    │ → Add origin to Google Console      │
    └─────────────────────────────────────┘
         ↓
    ┌─────────────────────────────────────┐
    │ Error: "Redirect URI mismatch"      │
    │ → Add URI to Google Console         │
    └─────────────────────────────────────┘
         ↓
    ┌─────────────────────────────────────┐
    │ Error: "Invalid Client ID"          │
    │ → Verify Client ID matches          │
    └─────────────────────────────────────┘
         ↓
    ┌─────────────────────────────────────┐
    │ No error, but still doesn't work    │
    │ → Clear cache (Ctrl+Shift+R)        │
    │ → Wait 10 minutes                   │
    │ → Try incognito window              │
    └─────────────────────────────────────┘
```

---

## WhatsApp QR Code Issue

```
┌─────────────────────────────────────────────────────────┐
│ WhatsApp QR Code Not Showing in Render Logs             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Why: Render doesn't support interactive terminal       │
│                                                         │
│ Solution 1: Use Supabase OTP (Recommended)              │
│ ✓ Already configured                                   │
│ ✓ Users get OTP via email                              │
│ ✓ Works on production                                  │
│                                                         │
│ Solution 2: Set Up Locally                              │
│ 1. Run: cd backend && npm run dev                       │
│ 2. See QR code in terminal                              │
│ 3. Scan with WhatsApp                                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Timeline

```
Now          +5 min       +10 min      +15 min
 │            │            │            │
 ├─ Add URIs  ├─ Wait      ├─ Test      ├─ Done ✅
 │            │            │            │
 └────────────┴────────────┴────────────┘
```

---

## Quick Reference

| Component | Status | Action |
|-----------|--------|--------|
| Frontend Config | ✅ Done | None |
| Backend Config | ✅ Done | None |
| Netlify Env | ✅ Done | None |
| Render Env | ✅ Done | None |
| Google Console | ⏳ **TODO** | Add origins/URIs |
| Testing | ⏳ **TODO** | Test after 5-10 min |

---

## Success Indicators

### ✅ Google Auth Working
- Google popup appears when clicking login
- User can authenticate
- Redirects to dashboard
- No console errors

### ✅ WhatsApp Setup (Optional)
- QR code visible in local terminal
- Can scan with WhatsApp
- Session saved

### ✅ Email OTP Working
- User gets OTP via email
- Can enter OTP and login
- Works on production

