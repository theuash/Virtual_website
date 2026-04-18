# Supabase OTP Setup Guide

## Current Status

✅ **Supabase is already configured in your backend!**

- Supabase URL: `https://hlxmbsutrfnmkonngahs.supabase.co`
- Supabase Key: Already set in `backend/.env`
- OTP endpoints: Already implemented
- Frontend UI: Already built

## What's Already Working

### Backend
- ✅ Supabase OTP service configured
- ✅ Email OTP sending implemented
- ✅ OTP verification implemented
- ✅ WhatsApp OTP as fallback
- ✅ Test mode for development

### Frontend
- ✅ OTP input UI built
- ✅ OTP verification flow implemented
- ✅ Error handling
- ✅ Resend OTP functionality

### Database
- ✅ MongoDB connected
- ✅ User schema ready
- ✅ OTP tracking ready

## How to Use Supabase OTP

### For Users (Login Flow)

1. **User goes to login page**
   - URL: `http://localhost:5174/login`

2. **User enters email and password**
   - Clicks "Continue To Phone Verification"

3. **User receives OTP via email**
   - Supabase sends 6-digit code to email
   - Code valid for 10 minutes

4. **User enters OTP**
   - Enters 6-digit code in verification field
   - Clicks "Verify"

5. **User is logged in**
   - Redirected to dashboard

### For Users (Signup Flow)

1. **User goes to signup page**
   - URL: `http://localhost:5174/signup`

2. **User fills signup form**
   - Email, password, role, etc.
   - Clicks "Create Account"

3. **User receives OTP via email**
   - Supabase sends 6-digit code to email

4. **User enters OTP**
   - Enters 6-digit code in verification field

5. **Account created and logged in**
   - Redirected to dashboard

## Testing Supabase OTP Locally

### Option 1: Use Real Supabase (Recommended)

The system is already configured to use real Supabase:

1. Start backend: `npm run dev` (in backend folder)
2. Start frontend: `npm run dev` (in frontend folder)
3. Go to `http://localhost:5174/login`
4. Enter any email and password
5. Click "Continue To Phone Verification"
6. Check your email for OTP code
7. Enter OTP and verify

**Note:** You'll receive real emails from Supabase

### Option 2: Test Mode (No Real Emails)

To test without sending real emails:

1. Edit `backend/.env`:
   ```env
   SKIP_SUPABASE_OTP=true
   ```

2. Restart backend: `npm run dev`

3. Go to `http://localhost:5174/login`

4. Enter any email and password

5. Click "Continue To Phone Verification"

6. Use any 6-digit code (e.g., `123456`)

7. Enter OTP and verify

**Note:** No emails sent, test mode only

## Supabase Configuration Details

### What's Configured

```javascript
// Backend uses Supabase for:
- Sending OTP emails
- Verifying OTP tokens
- Managing OTP sessions
- Rate limiting (built-in)
```

### Environment Variables

```env
# backend/.env
SUPABASE_URL=https://hlxmbsutrfnmkonngahs.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SKIP_SUPABASE_OTP=true  # Uncomment for test mode
```

### API Endpoints

```
POST /api/auth/request-otp-login
- Request OTP for login
- Body: { email }
- Response: { message, phone }

POST /api/auth/verify-otp-login
- Verify OTP and login
- Body: { email, token }
- Response: { user, token, refreshToken }

POST /api/auth/request-otp-signup
- Request OTP for signup verification
- Body: { email }
- Response: { message }

POST /api/auth/verify-otp-signup
- Verify OTP and complete signup
- Body: { email, token }
- Response: { user, token, refreshToken }
```

## Troubleshooting

### Issue: "Supabase not configured"

**Cause:** Missing environment variables

**Fix:**
1. Check `backend/.env` has:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
2. Restart backend: `npm run dev`

### Issue: OTP not received

**Cause 1:** Using test mode
- Check if `SKIP_SUPABASE_OTP=true` in `.env`
- If yes, use any 6-digit code

**Cause 2:** Email not configured
- Supabase needs email provider configured
- Check Supabase dashboard → Authentication → Email

**Cause 3:** Rate limited
- Supabase has rate limits
- Wait 5 minutes and try again

### Issue: "Invalid OTP token"

**Cause:** Wrong code or expired

**Fix:**
- Request new OTP
- Use code within 10 minutes
- Check email for correct code

### Issue: Backend won't start

**Cause:** Port 5001 in use

**Fix:**
```bash
# Kill process on port 5001
# Windows:
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :5001
kill -9 <PID>

# Then restart
npm run dev
```

## Features

### ✅ Implemented
- Email OTP sending
- OTP verification
- Rate limiting
- Test mode
- Error handling
- Resend functionality
- Session management

### ⏳ Optional
- SMS OTP (requires Twilio)
- WhatsApp OTP (requires WhatsApp Business API)
- Custom email templates

## Security

### ✅ Security Features
- OTP tokens expire after 10 minutes
- Rate limiting on OTP requests
- Secure token generation
- HTTPS only in production
- JWT tokens for sessions
- Refresh token rotation

### Best Practices
- Never share OTP codes
- OTP codes are single-use
- Codes are 6 digits (1 million combinations)
- Backend validates all OTP codes

## Next Steps

1. **Test locally:**
   ```bash
   # Terminal 1
   cd backend
   npm run dev

   # Terminal 2
   cd frontend
   npm run dev
   ```

2. **Go to login page:**
   - http://localhost:5174/login

3. **Test OTP flow:**
   - Enter email and password
   - Request OTP
   - Check email
   - Enter OTP
   - Verify

4. **Test signup flow:**
   - http://localhost:5174/signup
   - Fill form
   - Request OTP
   - Check email
   - Enter OTP
   - Create account

5. **Deploy to production:**
   - Supabase configuration already in Render
   - No additional setup needed
   - OTP will work on production

## Support

For more information:
- Supabase Docs: https://supabase.com/docs
- OTP Guide: https://supabase.com/docs/guides/auth/auth-otp
- Email Configuration: https://supabase.com/docs/guides/auth/auth-email

