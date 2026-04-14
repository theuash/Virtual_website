# Backend Authentication Implementation - Summary

## What Changed

### 1. **New Dependencies Added**
- `@supabase/supabase-js` - Supabase client for OTP authentication

### 2. **New Files Created**
- `server/services/supabase.service.js` - Supabase OTP integration service
- `AUTHENTICATION_SETUP.md` - Complete setup and API documentation
- `server/setup.sh` - Quick setup script

### 3. **Files Modified**

#### `server/package.json`
- Added `@supabase/supabase-js` dependency

#### `server/models/User.js`
Added OTP-related fields:
- `otpVerified: Boolean` - Whether OTP was verified
- `otpSentAt: Date` - When OTP was last sent
- `supabaseId: String` - Link to Supabase user
- `authMethod: String` - Either 'password' or 'otp'

#### `server/.env`
Added Supabase configuration:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

#### `server/services/auth.service.js`
Added new functions:
- `registerWithOtp()` - Register using email OTP
- `loginWithOtpRequest()` - Request OTP for login
- `verifyOtpAndLogin()` - Verify OTP and complete login
- `verifySignupOtp()` - Verify OTP during signup

Existing functions enhanced:
- `registerUser()` - Now sets `authMethod: 'password'`
- `loginUser()` - Unchanged, works as before

#### `server/controllers/auth.controller.js`
Added new endpoints:
- `registerWithOtp()` - POST /api/auth/register-otp
- `requestOtpLogin()` - POST /api/auth/otp/request-login
- `verifyOtpLogin()` - POST /api/auth/otp/verify-login
- `verifyOtpSignup()` - POST /api/auth/otp/verify-signup

Existing endpoints work as before:
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me (protected)

#### `server/routes/auth.routes.js`
Added new route handlers for all OTP endpoints

---

## Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Supabase (Optional but Recommended)

**Get Supabase credentials:**
1. Go to [https://supabase.com](https://supabase.com)
2. Create a free account and new project
3. Go to Settings → API
4. Copy Project URL and Anon Key

**Update .env:**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Start Server
```bash
npm run dev
```

Server runs on `http://localhost:5000`

---

## Authentication Methods

### Option 1: Password Authentication (No Supabase needed)
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "role": "client"
}

POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Option 2: OTP Authentication (Requires Supabase)

**Signup with OTP:**
```bash
POST /api/auth/register-otp
{
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "client"
}

# User receives OTP email
# Then verify:

POST /api/auth/otp/verify-signup
{
  "email": "user@example.com",
  "token": "123456"
}
```

**Login with OTP:**
```bash
POST /api/auth/otp/request-login
{
  "email": "user@example.com"
}

# User receives OTP email
# Then verify:

POST /api/auth/otp/verify-login
{
  "email": "user@example.com",
  "token": "123456"
}
```

---

## Database Changes

Users are now stored in MongoDB with these structure:

```javascript
{
  _id: ObjectId,
  email: String,
  passwordHash: String, // empty for OTP users
  role: String, // 'client', 'freelancer', 'admin'
  fullName: String,
  avatar: String,
  isVerified: Boolean,
  isSuspended: Boolean,
  otpVerified: Boolean, // new
  otpSentAt: Date, // new
  supabaseId: String, // new
  authMethod: String, // new: 'password' or 'otp'
  createdAt: Date,
  updatedAt: Date,
  // Plus role-specific fields (Client, Freelancer discriminators)
}
```

---

## Security Features

✅ **Password Security**
- Passwords hashed with bcryptjs (salt: 10 rounds)
- Hash verified on login

✅ **OTP Security**
- OTP sent via Supabase (email-only)
- OTP expires after 1 hour (Supabase default)
- User verified in database upon OTP verification

✅ **JWT Tokens**
- Access token: 15 minutes expiry
- Refresh token: 7 days expiry
- Configured in .env

✅ **Rate Limiting Ready**
- Infrastructure supports express-rate-limit
- Can be added to routes as needed

---

## Testing Endpoints

### Using cURL

**Test password registration:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "fullName": "Test User",
    "role": "client",
    "company": "Test Co"
  }'
```

**Test password login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

**Get current user (after login):**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### In Postman
1. Create new requests for each endpoint
2. Use JSON body format as shown above
3. For protected routes, add header: `Authorization: Bearer YOUR_TOKEN`

---

## What Still Works

✅ All existing database collections (Client, Freelancer, Projects, etc.)
✅ Existing middlewares (auth.js, roleGuard.js)
✅ Existing routes (client, freelancer, admin, seed)
✅ Traditional password-based login/registration
✅ JWT token generation and validation

---

## What's New

✨ **OTP Registration** - Sign up with just email + full name
✨ **OTP Login** - Login without remembering passwords
✨ **Email Verification** - Automatic with OTP flow
✨ **Supabase Integration** - Professional OTP service
✨ **Flexible Auth** - Support both password and OTP methods
✨ **Audit Trail** - Track auth method used (password vs OTP)

---

## Configuration Files

### .env
```env
# Core
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5174

# MongoDB
MONGODB_URI=mongodb://localhost:27017/virtual

# JWT
JWT_SECRET=super_secret_jwt_key
JWT_REFRESH_SECRET=super_secret_refresh_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Supabase (Optional)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Supabase not configured" | Set SUPABASE_URL and SUPABASE_ANON_KEY in .env, restart server |
| OTP not received | Check spam folder, verify email in Supabase dashboard |
| "User already exists" | That email is registered; use different email |
| MongoDB connection error | Start MongoDB: `mongod` on Windows/Mac |
| Token invalid | Check token hasn't expired, re-login if needed |

---

## Next Steps

1. **Frontend Integration** - Update signup/login pages to use new endpoints
2. **OTP UI** - Create OTP input component for verification
3. **Password Reset** - Add password recovery flow
4. **Session Management** - Implement token refresh mechanism
5. **Testing** - Create comprehensive test suite

---

## Files Reference

| File | Purpose |
|------|---------|
| `server/models/User.js` | User schema with OTP fields |
| `server/services/auth.service.js` | Core authentication logic |
| `server/services/supabase.service.js` | OTP integration |
| `server/controllers/auth.controller.js` | Route handlers |
| `server/routes/auth.routes.js` | Route definitions |
| `server/.env` | Configuration |
| `AUTHENTICATION_SETUP.md` | Detailed documentation |

---

## Support

For detailed API documentation, see: **AUTHENTICATION_SETUP.md**

For frontend integration examples, see that same file under "Frontend Integration" section.
