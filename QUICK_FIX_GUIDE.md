# Quick Fix Guide - WhatsApp QR Code & Google Auth

## Problem 1: WhatsApp QR Code Not Showing in Render Logs

### Why This Happens
- Render doesn't support interactive terminal output
- WhatsApp Web JS needs a browser/terminal to display QR code
- Headless mode can't render QR codes

### Solution: Use Local WhatsApp Setup

Since Render can't display QR codes, you have two options:

#### Option A: Skip WhatsApp for Now (Recommended)
Use Supabase OTP instead (already configured):

```env
# In backend/.env - already set up
SUPABASE_URL=https://hlxmbsutrfnmkonngahs.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# SKIP_SUPABASE_OTP=true  # Keep commented to use Supabase
```

Users will get OTP via email instead of WhatsApp.

#### Option B: Set Up WhatsApp Locally
1. Run backend locally:
   ```bash
   cd backend
   npm run dev
   ```

2. You'll see QR code in terminal
3. Scan with WhatsApp on your phone
4. Session saves to `.wwebjs_auth/session-virtual-otp/`
5. Commit the session folder to git (or use environment variable)

---

## Problem 2: Google Auth Not Working

### Root Cause
Google OAuth app is missing authorized origins/redirect URIs for your deployed domain.

### Quick Fix (5 minutes)

#### Step 1: Go to Google Cloud Console
https://console.cloud.google.com/

#### Step 2: Find Your OAuth Credentials
1. Click your project name (top left)
2. Go to **APIs & Services** → **Credentials**
3. Click your OAuth 2.0 Client ID (should be the one with your Client ID)

#### Step 3: Add Authorized Origins
Click **Edit** and add these to **Authorized JavaScript origins**:

```
http://localhost:5173
http://localhost:3000
https://virtual-core.netlify.app
```

#### Step 4: Add Authorized Redirect URIs
Add these to **Authorized redirect URIs**:

```
http://localhost:5001
http://localhost:5001/api/auth/google/callback
https://virtual-230s.onrender.com
https://virtual-230s.onrender.com/api/auth/google/callback
```

#### Step 5: Save and Test
1. Click **Save**
2. Wait 5-10 minutes for changes to propagate
3. Test on https://virtual-core.netlify.app
4. Try Google login

---

## Verification Checklist

### Google Auth
- [ ] Go to https://virtual-core.netlify.app/login
- [ ] Click "Login with Google"
- [ ] Google popup appears
- [ ] Can authenticate
- [ ] Redirected to dashboard

### WhatsApp (Optional)
- [ ] Run backend locally: `npm run dev`
- [ ] See QR code in terminal
- [ ] Scan with WhatsApp
- [ ] Session saved

---

## Troubleshooting

### Google Login Still Not Working

**Check 1: Browser Console**
- Open DevTools (F12)
- Go to **Console** tab
- Look for errors
- Common errors:
  - "Invalid Client ID" → Check VITE_GOOGLE_CLIENT_ID
  - "Redirect URI mismatch" → Add domain to Google Console
  - "Origin mismatch" → Add domain to Authorized JavaScript origins

**Check 2: Verify Environment Variables**
```bash
# Frontend (.env)
VITE_GOOGLE_CLIENT_ID=554046531423-vim40jl5crv8vha0hcbscq3ednkj7748.apps.googleusercontent.com

# Backend (.env)
GOOGLE_CLIENT_ID=554046531423-vim40jl5crv8vha0hcbscq3ednkj7748.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

**Check 3: Clear Cache**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Clear browser cache
- Try incognito/private window

**Check 4: Wait for Propagation**
- Google changes take 5-10 minutes to propagate
- Wait and try again

### WhatsApp QR Code Not Showing

**Solution 1: Run Locally**
```bash
cd backend
npm run dev
# QR code will appear in terminal
```

**Solution 2: Use Supabase OTP Instead**
- Already configured
- Users get OTP via email
- No WhatsApp setup needed

---

## Current Configuration Status

### ✅ Already Configured
- Backend: `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` set
- Frontend: `VITE_GOOGLE_CLIENT_ID` set
- Supabase OTP: Fully configured
- Database: MongoDB Atlas connected

### ⚠️ Needs Manual Setup
- Google Cloud Console: Add authorized origins/URIs
- WhatsApp: Either skip or set up locally

---

## Next Steps

1. **Immediate (5 min):**
   - Go to Google Cloud Console
   - Add authorized origins/URIs
   - Wait 5-10 minutes

2. **Test (2 min):**
   - Visit https://virtual-core.netlify.app/login
   - Try Google login
   - Check browser console for errors

3. **WhatsApp (Optional):**
   - Run backend locally if needed
   - Scan QR code
   - Or use Supabase OTP instead

---

## Support

If Google Auth still doesn't work:
1. Check browser console for exact error
2. Verify all 4 authorized URIs are added
3. Clear browser cache and try again
4. Wait 10 minutes and try again
5. Check that Client ID matches in frontend and backend

