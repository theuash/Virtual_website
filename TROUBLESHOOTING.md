# Troubleshooting Guide

## Issue 1: Google Auth Not Working

### Symptoms
- Google login button doesn't respond
- Google popup doesn't appear
- Error in browser console
- Redirected back to login page

### Root Causes & Solutions

#### Cause 1: Missing Authorized Origins
**Error Message:** "Origin mismatch" or "Invalid Client ID"

**Fix:**
1. Go to https://console.cloud.google.com/
2. APIs & Services → Credentials
3. Click your OAuth Client ID
4. Add to **Authorized JavaScript origins**:
   - `https://virtual-core.netlify.app`
   - `http://localhost:5173`
   - `http://localhost:3000`
5. Save and wait 5-10 minutes

#### Cause 2: Missing Redirect URIs
**Error Message:** "Redirect URI mismatch"

**Fix:**
1. Go to https://console.cloud.google.com/
2. APIs & Services → Credentials
3. Click your OAuth Client ID
4. Add to **Authorized redirect URIs**:
   - `https://virtual-230s.onrender.com`
   - `https://virtual-230s.onrender.com/api/auth/google/callback`
   - `http://localhost:5001`
   - `http://localhost:5001/api/auth/google/callback`
5. Save and wait 5-10 minutes

#### Cause 3: Client ID Mismatch
**Error Message:** "Invalid Client ID" or silent failure

**Fix:**
Verify Client ID matches everywhere:

```bash
# Frontend .env
VITE_GOOGLE_CLIENT_ID=554046531423-vim40jl5crv8vha0hcbscq3ednkj7748.apps.googleusercontent.com

# Backend .env
GOOGLE_CLIENT_ID=554046531423-vim40jl5crv8vha0hcbscq3ednkj7748.apps.googleusercontent.com

# Google Cloud Console
Should show: 554046531423-vim40jl5crv8vha0hcbscq3ednkj7748.apps.googleusercontent.com
```

#### Cause 4: Environment Variables Not Set on Netlify
**Error Message:** "Invalid Client ID" on production only

**Fix:**
1. Go to https://app.netlify.com
2. Select your site (virtual-core)
3. Site settings → Build & deploy → Environment
4. Add/verify: `VITE_GOOGLE_CLIENT_ID=554046531423-vim40jl5crv8vha0hcbscq3ednkj7748.apps.googleusercontent.com`
5. Trigger redeploy

#### Cause 5: Environment Variables Not Set on Render
**Error Message:** Backend returns 400 error

**Fix:**
1. Go to https://dashboard.render.com
2. Select your backend service
3. Environment tab
4. Add/verify:
   - `GOOGLE_CLIENT_ID=554046531423-vim40jl5crv8vha0hcbscq3ednkj7748.apps.googleusercontent.com`
   - `GOOGLE_CLIENT_SECRET=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`
5. Render auto-redeploys

#### Cause 6: Browser Cache
**Error Message:** Works on incognito but not normal window

**Fix:**
1. Hard refresh: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
2. Or clear cache:
   - DevTools → Application → Clear site data
3. Try again

#### Cause 7: Changes Not Propagated
**Error Message:** Works locally but not on production

**Fix:**
- Google changes take 5-10 minutes to propagate
- Wait 10 minutes and try again
- Don't test immediately after saving

---

## Issue 2: WhatsApp QR Code Not Showing in Render Logs

### Symptoms
- No QR code in Render logs
- Can't scan WhatsApp session
- WhatsApp authentication fails

### Root Cause
Render doesn't support interactive terminal output. WhatsApp Web JS needs a terminal to display QR codes.

### Solution 1: Skip WhatsApp (Recommended)
Use Supabase OTP instead:
- Already configured
- Users get OTP via email
- No setup needed
- Works on production

**Status:** ✅ Already working

### Solution 2: Set Up Locally
If you need WhatsApp:

1. Run backend locally:
   ```bash
   cd backend
   npm run dev
   ```

2. You'll see QR code in terminal:
   ```
   ┌─────────────────────────────────┐
   │                                 │
   │  [QR CODE APPEARS HERE]         │
   │                                 │
   └─────────────────────────────────┘
   ```

3. Scan with WhatsApp on your phone

4. Session saves to `.wwebjs_auth/session-virtual-otp/`

5. To use on production:
   - Commit `.wwebjs_auth/` to git
   - Or set up environment variable for session storage

### Solution 3: Use Environment Variable
If you want WhatsApp on production:

1. Set up locally and get session
2. Store session in environment variable
3. Set on Render
4. Backend reads from environment

---

## Issue 3: Backend Errors

### Error: "Google token is required"
**Cause:** Frontend not sending token to backend

**Fix:**
1. Check browser console for errors
2. Verify Google login completes
3. Check network tab to see if request is sent

### Error: "Invalid Google token"
**Cause:** Token verification failed

**Fix:**
1. Verify `GOOGLE_CLIENT_ID` is set on backend
2. Verify `GOOGLE_CLIENT_SECRET` is set on backend
3. Check backend logs for detailed error

### Error: "No account found with this Google email"
**Cause:** User trying to login but account doesn't exist

**Fix:**
- User should sign up first
- Or create account manually in database

---

## Debugging Steps

### Step 1: Check Browser Console
1. Open https://virtual-core.netlify.app/login
2. Press F12 to open DevTools
3. Go to **Console** tab
4. Click "Login with Google"
5. Look for red error messages
6. Screenshot the error

### Step 2: Check Network Tab
1. Open DevTools
2. Go to **Network** tab
3. Click "Login with Google"
4. Look for requests to:
   - `accounts.google.com` (Google popup)
   - `virtual-230s.onrender.com/api/auth/google/login` (Backend)
5. Check response status and body

### Step 3: Check Backend Logs
1. Go to https://dashboard.render.com
2. Select your backend service
3. Go to **Logs** tab
4. Look for errors related to Google auth
5. Check for "Invalid token" or "Client ID mismatch"

### Step 4: Test Locally
1. Run backend locally:
   ```bash
   cd backend
   npm run dev
   ```
2. Run frontend locally:
   ```bash
   cd frontend
   npm run dev
   ```
3. Go to http://localhost:5173/login
4. Try Google login
5. Check if it works locally

---

## Quick Checklist

### Google Auth Setup
- [ ] Google Client ID set in frontend .env
- [ ] Google Client ID set in backend .env
- [ ] Google Client Secret set in backend .env
- [ ] Authorized JavaScript origins added to Google Console
- [ ] Authorized redirect URIs added to Google Console
- [ ] Environment variables set on Netlify
- [ ] Environment variables set on Render
- [ ] 5-10 minutes waited for propagation
- [ ] Browser cache cleared
- [ ] Tested on production

### WhatsApp Setup
- [ ] Decided: Use Supabase OTP or WhatsApp
- [ ] If WhatsApp: Set up locally and scanned QR code
- [ ] If Supabase: Already configured and working

---

## Getting Help

If you're still stuck:

1. **Check the error message:**
   - Browser console (F12 → Console)
   - Backend logs (Render dashboard)
   - Network tab (F12 → Network)

2. **Verify configuration:**
   - All Client IDs match
   - All origins/URIs added to Google Console
   - All environment variables set

3. **Try the basics:**
   - Hard refresh (Ctrl+Shift+R)
   - Clear cache
   - Try incognito window
   - Wait 10 minutes

4. **Test locally:**
   - Run backend and frontend locally
   - Try Google login on localhost
   - Check if it works

5. **Check documentation:**
   - GOOGLE_AUTH_FIX_STEPS.md
   - GOOGLE_AUTH_SETUP.md
   - QUICK_FIX_GUIDE.md

