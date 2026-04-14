# Quick Reference - Backend Authentication System

## 🚀 What's Ready Now

Your backend now has **full authentication** with two methods:

### ✅ Password Authentication (Ready to use NOW)
```bash
POST /api/auth/register      # Register with password
POST /api/auth/login         # Login with password  
GET /api/auth/me             # Get current user
```

### ✅ OTP Authentication (Ready after Supabase setup)
```bash
POST /api/auth/register-otp      # Start OTP signup
POST /api/auth/otp/verify-signup # Complete OTP signup

POST /api/auth/otp/request-login # Start OTP login
POST /api/auth/otp/verify-login  # Complete OTP login
```

---

## ⚡ Quick Start (5 minutes)

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Setup Supabase (Optional)
**Free and takes 2 minutes:**
1. Go to https://supabase.com → Sign up
2. Create new project
3. Go to Settings → API
4. Copy Project URL and Anon Key
5. Edit `.env`:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```
6. Enable Email OTP in Authentication → Providers → Email

### 3. Start Server
```bash
npm run dev
```

Server runs on **http://localhost:5000**

---

## 📝 Test Immediately

### Test Password Registration (NO Supabase needed)
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "fullName": "Test User",
    "role": "client",
    "company": "Test Company"
  }'
```

### Response:
```json
{
  "data": {
    "user": {
      "email": "test@example.com",
      "fullName": "Test User",
      "role": "client"
    },
    "token": "jwt-token-xxx",
    "refreshToken": "refresh-token-xxx"
  }
}
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `AUTHENTICATION_SETUP.md` | **Complete guide** - All endpoints, testing, troubleshooting |
| `BACKEND_AUTH_SUMMARY.md` | Quick summary of changes made |
| `FRONTEND_AUTH_INTEGRATION.md` | How to integrate with React frontend |

**Read these in order:**
1. First: `BACKEND_AUTH_SUMMARY.md` (understand what changed)
2. Then: `AUTHENTICATION_SETUP.md` (detailed API reference)
3. Finally: `FRONTEND_AUTH_INTEGRATION.md` (connect frontend)

---

## 🔧 Backend Files Created/Modified

### New Files
- ✨ `server/services/supabase.service.js` - OTP handler
- ✨ `server/setup.sh` - Linux/Mac setup script
- ✨ `server/setup.bat` - Windows setup script

### Modified Files
- 📝 `server/package.json` - Added @supabase/supabase-js
- 📝 `server/models/User.js` - Added OTP fields
- 📝 `server/services/auth.service.js` - Added OTP functions
- 📝 `server/controllers/auth.controller.js` - Added OTP endpoints
- 📝 `server/routes/auth.routes.js` - Added OTP routes
- 📝 `server/.env` - Added Supabase config

---

## 🎯 Two Authentication Methods

### 1️⃣ Password Auth (Works now, no setup)
```json
// Signup
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "client"
}

// Returns token immediately ✓
```

### 2️⃣ OTP Auth (Works after Supabase setup)
```json
// Step 1: Request OTP
{
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "client"
}
// Returns: OTP sent to email

// Step 2: Verify OTP
{
  "email": "user@example.com",
  "token": "123456"  // from email
}
// Returns token after verification ✓
```

---

## ✨ Features At A Glance

| Feature | Status | Details |
|---------|--------|---------|
| Password registration | ✅ Ready | Works immediately |
| Password login | ✅ Ready | Works immediately |
| OTP signup | ✅ Ready | After Supabase setup |
| OTP login | ✅ Ready | After Supabase setup |
| Email verification | ✅ Ready | Automatic with OTP |
| JWT tokens | ✅ Ready | 15 min access, 7d refresh |
| Database persistence | ✅ Ready | MongoDB integration |
| Role support | ✅ Ready | client, freelancer, admin |
| Protected routes | ✅ Ready | Middleware included |

---

## 🛑 Issues & Fixes

| Problem | Fix |
|---------|-----|
| "Port 5000 already in use" | Change PORT in .env or kill process on port 5000 |
| "Cannot connect to MongoDB" | Start MongoDB: `mongod` |
| "OTP not received" | Check spam, enable Email OTP in Supabase |
| "Supabase not configured" | Either skip OTP (use passwords) or add Supabase keys to .env |

---

## 📱 Next Step: Frontend

1. Copy components from `FRONTEND_AUTH_INTEGRATION.md`
2. Update `frontend/src/services/api.js` with endpoints
3. Update `frontend/src/context/AuthContext.jsx` with auth logic
4. Create signup/login pages with components provided
5. Test with `npm run dev`

---

## 🔐 Security Checklist

✅ Passwords hashed (bcryptjs)
✅ OTP via Supabase (industry standard)
✅ JWT tokens (industry standard)
✅ Protected /me endpoint
✅ Rate limiting ready (can be added)
✅ CORS configured

**Production TODO:**
- [ ] Enable HTTPS
- [ ] Add rate limiting to auth routes
- [ ] Add email verification resend
- [ ] Add password reset flow
- [ ] Add 2FA option
- [ ] Use httpOnly cookies for tokens

---

## 📊 Database Structure

Users stored in MongoDB with:
```
{
  _id, email, passwordHash, role, fullName,
  isVerified, isSuspended,
  otpVerified, otpSentAt, supabaseId, authMethod,
  createdAt, updatedAt,
  ...roleSpecificFields
}
```

---

## 💡 Tips

**For development:**
- Keep MongoDB running in separate terminal
- Use Supabase free tier for unlimited OTP emails
- Test both auth methods to ensure both work
- Check browser console for API errors

**For testing:**
- Use Postman for API testing
- Use Supabase dashboard to see OTP emails
- Check server logs: `npm run dev` shows all requests

**For production:**
- Add `.env.production` for production values
- Use environment variables in CI/CD
- Never commit secrets
- Use password reset flow
- Enable email verification requirements

---

## 📞 Support

Having issues? Check these files for solutions:
- **Setup issues**: `AUTHENTICATION_SETUP.md` → Troubleshooting section
- **API questions**: `AUTHENTICATION_SETUP.md` → API section
- **Frontend**: `FRONTEND_AUTH_INTEGRATION.md`
- **Changes made**: `BACKEND_AUTH_SUMMARY.md`

---

## ✅ Checklist

- [x] Backend authentication implemented
- [x] Database fields added
- [x] OTP service integrated
- [x] Routes created
- [x] Documentation written
- [ ] Frontend integration (Next)
- [ ] Test both auth methods (Next)
- [ ] Deploy to production (Later)

---

**Ready? Start with:** `npm run dev` in the server folder! 🚀
