# Google OAuth Setup Guide

This guide explains how to set up Google OAuth for the Virtual platform on both local development and production (Netlify).

## Problem: Google Auth Not Working on Deployed Site

If Google authentication fails on your deployed website (https://virtual-core.netlify.app), it's likely because the Google OAuth app is missing the deployed domain in its authorized URIs.

---

## Step 1: Get Your Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google+ API**:
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click **Enable**
4. Create OAuth 2.0 credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client ID**
   - Choose **Web application**
   - Name it (e.g., "Virtual Platform")

---

## Step 2: Configure Authorized URIs

This is the critical step that fixes the deployed site issue.

### Authorized JavaScript Origins
Add these origins where your frontend is hosted:

```
http://localhost:5173
http://localhost:3000
https://virtual-core.netlify.app
```

### Authorized Redirect URIs
Add these URIs for backend token verification:

```
http://localhost:5001
http://localhost:5001/api/auth/google/callback
https://virtual-230s.onrender.com
https://virtual-230s.onrender.com/api/auth/google/callback
```

---

## Step 3: Update Environment Variables

### Backend (.env)
```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
```

### Frontend (.env)
```env
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

**Important:** Both must use the SAME Client ID.

---

## Step 4: Deploy to Render & Netlify

### Render (Backend)
1. Go to your Render service dashboard
2. Go to **Environment** → **Environment Variables**
3. Add/update:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
4. Redeploy

### Netlify (Frontend)
1. Go to your Netlify site settings
2. Go to **Build & deploy** → **Environment**
3. Add/update:
   - `VITE_GOOGLE_CLIENT_ID`
4. Trigger a redeploy

---

## Step 5: Test

### Local Testing
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Visit http://localhost:5173 and test Google login
```

### Production Testing
Visit https://virtual-core.netlify.app and test Google login

---

## Troubleshooting

### Error: "Invalid Client ID"
- ✅ Check that `VITE_GOOGLE_CLIENT_ID` matches `GOOGLE_CLIENT_ID` in backend
- ✅ Verify credentials are deployed to both Render and Netlify

### Error: "Redirect URI mismatch"
- ✅ Add the exact domain to "Authorized Redirect URIs" in Google Console
- ✅ For Netlify: add `https://virtual-core.netlify.app`
- ✅ For Render: add `https://virtual-230s.onrender.com`

### Error: "Origin mismatch"
- ✅ Add the exact domain to "Authorized JavaScript Origins" in Google Console
- ✅ For Netlify: add `https://virtual-core.netlify.app`

### Google Login Button Not Appearing
- ✅ Check browser console for errors
- ✅ Verify `VITE_GOOGLE_CLIENT_ID` is set in frontend .env
- ✅ Verify `GoogleOAuthProvider` is wrapping the app in `main.jsx`

---

## How It Works

1. **Frontend** (`LoginPage.jsx` / `SignupPage.jsx`):
   - User clicks "Login with Google"
   - Google OAuth popup opens
   - User authenticates with Google
   - Frontend receives `idToken` from Google

2. **Backend** (`google.service.js`):
   - Frontend sends `idToken` to `/auth/google/login` or `/auth/google/signup`
   - Backend verifies token using `GOOGLE_CLIENT_ID`
   - Backend creates/updates user in database
   - Backend returns JWT token to frontend

3. **Frontend** (`AuthContext.jsx`):
   - Frontend stores JWT token
   - Frontend redirects to dashboard

---

## Security Notes

- ✅ Never commit `.env` files to git (already in `.gitignore`)
- ✅ Keep `GOOGLE_CLIENT_SECRET` private (backend only)
- ✅ `VITE_GOOGLE_CLIENT_ID` is public (frontend can see it)
- ✅ Always use HTTPS in production
- ✅ Rotate credentials if compromised

---

## Files Modified

- `backend/.env` - Added Google credentials
- `backend/.env.example` - Added Google setup instructions
- `frontend/.env` - Added Google Client ID
- `frontend/.env.example` - Added Google setup instructions
- `backend/services/google.service.js` - Handles token verification
- `frontend/context/AuthContext.jsx` - Handles Google login/signup
- `frontend/src/main.jsx` - Wraps app with GoogleOAuthProvider

---

## Next Steps

1. ✅ Add authorized URIs to Google Console
2. ✅ Update `.env` files on Render and Netlify
3. ✅ Redeploy both services
4. ✅ Test on production site
5. ✅ Monitor browser console for errors

