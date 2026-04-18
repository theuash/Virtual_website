# Google Auth Fix - Step by Step

## Current Status
- ✅ Frontend has `VITE_GOOGLE_CLIENT_ID` set
- ✅ Backend has `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` set
- ❌ Google Cloud Console missing authorized origins/URIs

## The Fix (Takes 5 minutes)

### Step 1: Open Google Cloud Console
Go to: https://console.cloud.google.com/

### Step 2: Select Your Project
- Click the project dropdown (top left)
- Select your project (should show your project name)

### Step 3: Go to OAuth Credentials
1. In the left sidebar, click **APIs & Services**
2. Click **Credentials**
3. You should see your OAuth 2.0 Client ID listed
4. Click on it to edit

### Step 4: Add Authorized JavaScript Origins
In the **Authorized JavaScript origins** section, add these 3 origins:

```
http://localhost:5173
http://localhost:3000
https://virtual-core.netlify.app
```

**How to add:**
- Click the **+ Add URI** button
- Paste each origin one by one
- Click outside the field to confirm

### Step 5: Add Authorized Redirect URIs
In the **Authorized redirect URIs** section, add these 4 URIs:

```
http://localhost:5001
http://localhost:5001/api/auth/google/callback
https://virtual-230s.onrender.com
https://virtual-230s.onrender.com/api/auth/google/callback
```

**How to add:**
- Click the **+ Add URI** button
- Paste each URI one by one
- Click outside the field to confirm

### Step 6: Save
- Click the **Save** button at the bottom
- You should see a success message

### Step 7: Wait for Propagation
- Google takes 5-10 minutes to apply changes
- **Don't test immediately**
- Wait at least 5 minutes

### Step 8: Test
After 5-10 minutes:
1. Go to https://virtual-core.netlify.app/login
2. Click "Login with Google"
3. Google popup should appear
4. Complete authentication
5. Should redirect to dashboard

---

## If It Still Doesn't Work

### Check 1: Verify Client ID Matches
```
Frontend (.env):
VITE_GOOGLE_CLIENT_ID=554046531423-vim40jl5crv8vha0hcbscq3ednkj7748.apps.googleusercontent.com

Backend (.env):
GOOGLE_CLIENT_ID=554046531423-vim40jl5crv8vha0hcbscq3ednkj7748.apps.googleusercontent.com

Google Cloud Console:
Should show the same Client ID
```

### Check 2: Browser Console Errors
1. Open https://virtual-core.netlify.app/login
2. Press F12 to open DevTools
3. Go to **Console** tab
4. Click "Login with Google"
5. Look for red error messages
6. Common errors:
   - "Invalid Client ID" → Client ID doesn't match
   - "Redirect URI mismatch" → Missing URI in Google Console
   - "Origin mismatch" → Missing origin in Google Console

### Check 3: Clear Browser Cache
1. Hard refresh: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
2. Or clear cache manually:
   - DevTools → Application → Clear site data
3. Try again

### Check 4: Try Incognito/Private Window
1. Open new incognito/private window
2. Go to https://virtual-core.netlify.app/login
3. Try Google login
4. This bypasses cached credentials

### Check 5: Verify Netlify Environment Variable
1. Go to https://app.netlify.com
2. Select your site (virtual-core)
3. Go to **Site settings** → **Build & deploy** → **Environment**
4. Verify `VITE_GOOGLE_CLIENT_ID` is set correctly
5. If missing or wrong, add it and trigger redeploy

### Check 6: Verify Render Environment Variables
1. Go to https://dashboard.render.com
2. Select your backend service
3. Go to **Environment** tab
4. Verify these are set:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
5. If missing, add them and Render will auto-redeploy

---

## Visual Guide

### Google Cloud Console - Authorized Origins
```
┌─────────────────────────────────────────┐
│ Authorized JavaScript origins           │
├─────────────────────────────────────────┤
│ ✓ http://localhost:5173                 │
│ ✓ http://localhost:3000                 │
│ ✓ https://virtual-core.netlify.app      │
└─────────────────────────────────────────┘
```

### Google Cloud Console - Authorized Redirect URIs
```
┌──────────────────────────────────────────────────────────┐
│ Authorized redirect URIs                                 │
├──────────────────────────────────────────────────────────┤
│ ✓ http://localhost:5001                                  │
│ ✓ http://localhost:5001/api/auth/google/callback         │
│ ✓ https://virtual-230s.onrender.com                      │
│ ✓ https://virtual-230s.onrender.com/api/auth/google/... │
└──────────────────────────────────────────────────────────┘
```

---

## Timeline

| Time | Action | Status |
|------|--------|--------|
| Now | Add origins/URIs to Google Console | ⏳ Do this |
| +5 min | Wait for propagation | ⏳ Wait |
| +10 min | Test on production | ✅ Test |
| +15 min | Should be working | ✅ Done |

---

## WhatsApp QR Code Issue

### Why It's Not Showing
- Render doesn't support interactive terminal output
- WhatsApp Web JS needs a terminal to display QR code
- Headless environments can't render QR codes

### Solution 1: Skip WhatsApp (Recommended)
Use Supabase OTP instead (already configured):
- Users get OTP via email
- No WhatsApp setup needed
- Already working

### Solution 2: Set Up Locally
1. Run backend locally:
   ```bash
   cd backend
   npm run dev
   ```
2. You'll see QR code in terminal
3. Scan with WhatsApp on your phone
4. Session saves to `.wwebjs_auth/`

---

## Summary

| Issue | Solution | Time |
|-------|----------|------|
| Google Auth not working | Add origins/URIs to Google Console | 5 min |
| WhatsApp QR not showing | Use Supabase OTP or run locally | N/A |

