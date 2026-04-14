# 🚀 Getting Started - Virtual Website Backend Auth

## Status: ✅ COMPLETE

Your backend now has **full authentication system** with:
- ✅ Password-based signup & login  
- ✅ OTP-based signup & login via Supabase
- ✅ JWT token management
- ✅ Protected routes
- ✅ Database persistence

---

## 📋 What You Need To Do

### Option 1: Test Password Auth NOW (2 minutes)

```bash
# 1. Install dependencies
cd server
npm install

# 2. Ensure MongoDB is running (separate terminal)
mongod

# 3. Start backend
npm run dev

# 4. In another terminal, test signup
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "fullName": "Test User",
    "role": "client",
    "company": "Test Co"
  }'

# 5. Copy the token from response and test login
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

✨ That's it! Password auth works!

---

### Option 2: Setup OTP Auth (5 minutes)

**Prerequisites:** Completed Option 1 above

#### Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Sign up (free account)
3. Click "New Project"
4. Fill in details and create

#### Step 2: Get Credentials
1. In Supabase dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL** → Copy this
   - **Anon Key** → Copy this (NOT the service role key)

#### Step 3: Enable Email OTP
1. Go to **Authentication** → **Providers**
2. Click **Email**
3. Enable **Email OTP**
4. Click **Save**

#### Step 4: Update .env
Edit `server/.env`:
```env
SUPABASE_URL=https://your-project-abc123.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...your-key-here...
```

#### Step 5: Restart Server
```bash
# Stop: Ctrl+C
# Start again:
npm run dev
```

#### Step 6: Test OTP
```bash
# Request OTP signup
curl -X POST http://localhost:5000/api/auth/register-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test@example.com",
    "fullName": "Test User",
    "role": "client"
  }'

# Check email for OTP code
# Then verify:
curl -X POST http://localhost:5000/api/auth/otp/verify-signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test@example.com",
    "token": "123456"
  }'
```

✨ OTP auth works!

---

## 📚 Documentation

Read in this order:

1. **QUICK_START.md** ← Start here (you're reading it!)
2. **BACKEND_AUTH_SUMMARY.md** ← Understand what changed
3. **AUTHENTICATION_SETUP.md** ← Full API documentation
4. **FRONTEND_AUTH_INTEGRATION.md** ← How to update React app

---

## 🔌 API Endpoints Ready

### Password Auth
```
POST   /api/auth/register        # Create account with password
POST   /api/auth/login           # Login with password
GET    /api/auth/me              # Get current user [Protected]
```

### OTP Auth (after Supabase setup)
```
POST   /api/auth/register-otp        # Start signup with OTP
POST   /api/auth/otp/verify-signup   # Complete signup with OTP
POST   /api/auth/otp/request-login   # Start login with OTP
POST   /api/auth/otp/verify-login    # Complete login with OTP
```

---

## 🎯 Recommended Next Steps

### Immediate (Now)
- [x] Install dependencies: `npm install`
- [x] Test password auth (see above)
- [ ] Optional: Setup Supabase and test OTP

### Short Term (This week)
- [ ] Update React components to use auth API
- [ ] Create signup/login pages
- [ ] Test both auth methods
- [ ] Add logout functionality

### Medium Term (Next week)
- [ ] Add password reset flow
- [ ] Add email verification resend
- [ ] Add profile page/settings
- [ ] Deploy to staging

### Long Term (Later)
- [ ] Enable 2FA option
- [ ] Add social login (Google, GitHub)
- [ ] Analytics dashboard
- [ ] Deploy to production

---

## 🔥 Quick Facts

| Aspect | Details |
|--------|---------|
| **Database** | MongoDB (local or Atlas) |
| **Auth Methods** | Password + OTP |
| **OTP Provider** | Supabase (free tier) |
| **Tokens** | JWT (15m access, 7d refresh) |
| **Password Hash** | bcryptjs (10 rounds) |
| **Roles** | client, freelancer, admin |
| **Protected Routes** | /api/auth/me, all role routes |

---

## 🆘 Troubleshooting

### "Cannot connect to MongoDB"
**Fix:** Start MongoDB in a separate terminal
```bash
# Windows/Mac
mongod

# Linux
sudo systemctl start mongod
```

### "OTP not configured" error
**Fix:** Add Supabase keys to .env and restart server
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-key-here
```

### "Email already registered"
**Fix:** That email is already in database. Use different email or delete from MongoDB.

### Port 5000 already in use
**Fix:** Change port in .env or kill process:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

---

## 📊 Example Request/Response

### Register with Password
**Request:**
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "role": "client",
  "company": "Acme Corp"
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "john@example.com",
      "fullName": "John Doe",
      "role": "client",
      "isVerified": false,
      "authMethod": "password"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

---

## 🔐 Security Built-In

✅ Passwords hashed with bcryptjs  
✅ OTP via Supabase (industry standard)  
✅ JWT tokens with expiry  
✅ Protected endpoints  
✅ CORS configured  
✅ Role-based access ready  

---

## 📦 What's Installed

```json
"@supabase/supabase-js": "^2.38.5",
"bcryptjs": "^3.0.3",
"cors": "^2.8.6",
"express": "^5.2.1",
"jsonwebtoken": "^9.0.3",
"mongoose": "^9.4.1"
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts server on port 5000
- [ ] `http://localhost:5000/api/health` returns `{ status: "ok" }`
- [ ] Can register with password
- [ ] Can login with password
- [ ] `/api/auth/me` returns current user when authenticated
- [ ] (Optional) Can signup with OTP after Supabase setup
- [ ] (Optional) Can login with OTP after Supabase setup

---

## 🎓 Learning Path

1. **Understanding**: Read `BACKEND_AUTH_SUMMARY.md`
2. **API Reference**: Use `AUTHENTICATION_SETUP.md`
3. **Integration**: Follow `FRONTEND_AUTH_INTEGRATION.md`
4. **Testing**: Use provided cURL examples
5. **Implementation**: Update React components

---

## 💬 Common Questions

**Q: Do I need Supabase?**  
A: No! Password auth works without it. OTP needs Supabase (free tier available).

**Q: Can I use OTP with email service besides Supabase?**  
A: Yes, but you'd need to update `supabase.service.js` with your provider.

**Q: How long do tokens last?**  
A: Access token: 15 minutes, Refresh token: 7 days (configurable in .env)

**Q: How many auth methods can one user have?**  
A: Currently one per account. Can upgrade to support both later.

**Q: Is this production ready?**  
A: Yes, but add: rate limiting, email verification requirement, password requirements, HTTPS.

---

## 🚀 Running Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Run setup script (Linux/Mac)
bash setup.sh

# Run setup script (Windows)
setup.bat
```

---

## 📞 Need Help?

1. Check the troubleshooting section above
2. Read `AUTHENTICATION_SETUP.md` completely
3. Check Supabase dashboard for email logs
4. Check server console for detailed error messages
5. Verify MongoDB is running with: `mongod`

---

## 🎉 You're All Set!

**Next action:** Run `npm run dev` and test an endpoint above!

Questions? Check the documentation files or update to use the integration guide for React.

**Happy coding!** 🚀