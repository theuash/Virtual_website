# Authentication Setup Guide - OTP & Password Auth

## Overview
The backend now supports two authentication methods:
1. **Traditional Password Authentication** - Email/Password registration and login
2. **OTP Authentication with Supabase** - One-time password via email

## Quick Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

This installs `@supabase/supabase-js` for OTP authentication support.

### 2. Configure Supabase (Optional but Recommended)

#### Step A: Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Click "Sign Up" and create an account
3. Create a new project:
   - Click "New Project"
   - Choose your organization
   - Set database password (save it!)
   - Select region closest to you
   - Click "Create new project"
4. Wait for project to initialize (2-3 minutes)

#### Step B: Get Your Credentials
1. Go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** - This is your `SUPABASE_URL`
   - **Anon Key** - This is your `SUPABASE_ANON_KEY` (use the anon/public key)

#### Step C: Enable Email OTP in Supabase
1. Go to **Authentication** → **Providers**
2. Click on **Email**
3. Enable "Email OTP" toggle
4. Allow signup and auto-confirm off (we handle verification)
5. Click "Save"

#### Step D: Configure Email Settings (Optional)
1. Go to **Authentication** → **Email Templates**
2. Customize the OTP confirmation email template if needed
3. Default template works fine for testing

### 3. Update .env File

Edit `server/.env`:

```env
# ... existing config ...

# Supabase Configuration for OTP Authentication
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

Replace:
- `https://your-project.supabase.co` with your actual Project URL
- `your-anon-key-here` with your actual Anon Key

### 4. Start the Server

```bash
npm run dev
```

Server runs on http://localhost:5000

---

## API Endpoints

### Traditional Authentication

#### Register with Password
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "fullName": "John Doe",
  "role": "client", // or "freelancer", "admin"
  "company": "Acme Corp" // for clients
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "user": {
      "_id": "user-mongo-id",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "client",
      "isVerified": false,
      "authMethod": "password"
    },
    "token": "jwt-token-here",
    "refreshToken": "refresh-token-here"
  },
  "message": "User registered successfully"
}
```

#### Login with Password
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** Same as register response

---

### OTP Authentication

#### Register with OTP (Step 1)
Send OTP to user's email
```http
POST /api/auth/register-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "fullName": "John Doe",
  "role": "client", // or "freelancer", "admin"
  "company": "Acme Corp" // for clients
}
```

**Response:**
```json
{
  "statusCode": 201,
  "data": {
    "success": true,
    "message": "OTP sent to your email. Please verify to complete registration.",
    "user": {
      "_id": "user-mongo-id",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "client",
      "otpVerified": false,
      "isVerified": false,
      "authMethod": "otp"
    },
    "otpSent": true
  },
  "message": "OTP sent to your email. Please verify to complete registration."
}
```

#### Verify OTP after Signup (Step 2)
User receives OTP email and submits the code
```http
POST /api/auth/otp/verify-signup
Content-Type: application/json

{
  "email": "user@example.com",
  "token": "123456" // 6-digit OTP from email
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "user-mongo-id",
      "email": "user@example.com",
      "isVerified": true,
      "otpVerified": true,
      "authMethod": "otp"
    },
    "token": "jwt-token-here",
    "refreshToken": "refresh-token-here"
  },
  "message": "Email verified successfully! You can now log in."
}
```

#### Request OTP for Login (Step 1)
```http
POST /api/auth/otp/request-login
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "success": true,
    "message": "OTP sent to your email",
    "otpSent": true
  },
  "message": "OTP sent to your email"
}
```

#### Verify OTP for Login (Step 2)
```http
POST /api/auth/otp/verify-login
Content-Type: application/json

{
  "email": "user@example.com",
  "token": "123456" // 6-digit OTP from email
}
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "_id": "user-mongo-id",
      "email": "user@example.com",
      "isVerified": true,
      "otpVerified": true,
      "authMethod": "otp"
    },
    "token": "jwt-token-here",
    "refreshToken": "refresh-token-here"
  },
  "message": "Email verified. Logged in successfully"
}
```

#### Get Current User (Protected)
```http
GET /api/auth/me
Authorization: Bearer jwt-token-here
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "user-mongo-id",
    "email": "user@example.com",
    "fullName": "John Doe",
    "role": "client",
    "isVerified": true,
    "authMethod": "password"
  }
}
```

---

## Testing the API

### Using cURL

#### Test Password Registration:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123",
    "fullName": "Test User",
    "role": "client",
    "company": "Test Company"
  }'
```

#### Test OTP Registration:
```bash
curl -X POST http://localhost:5000/api/auth/register-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.otp@example.com",
    "fullName": "OTP Test User",
    "role": "freelancer"
  }'
```

### Using Postman

1. Create new requests with the URLs and JSON bodies shown above
2. Include `Authorization: Bearer YOUR_TOKEN` in headers for protected routes
3. Test both password and OTP flows

### Using Node.js/JavaScript

```javascript
// Register with password
const registerRes = await fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    fullName: 'John Doe',
    role: 'client',
    company: 'My Company'
  })
});

const { data } = await registerRes.json();
console.log('Token:', data.token);

// Get current user
const meRes = await fetch('http://localhost:5000/api/auth/me', {
  headers: { 'Authorization': `Bearer ${data.token}` }
});

const userInfo = await meRes.json();
console.log('User:', userInfo.data);
```

---

## OTP Email Testing

### On Supabase
- OTP emails are sent to the email address provided
- In development, check the **Auth** → **Users** section in Supabase dashboard
- Click on a user to see sent emails
- Click "Email Log" to see what was sent

### Local Testing (without Supabase)
If `SUPABASE_URL` or `SUPABASE_ANON_KEY` are not configured:
- OTP endpoints will return error: "OTP authentication is not configured"
- Regular password auth will continue to work
- Configure Supabase to enable OTP features

---

## Frontend Integration

### Example: OTP Signup Flow

```javascript
// Step 1: Request OTP
const response = await fetch('/api/auth/register-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    fullName: 'John Doe',
    role: 'client',
    company: 'Acme'
  })
});

// Step 2: Show OTP input form
// User enters 6-digit code from email

// Step 3: Verify OTP
const verifyResponse = await fetch('/api/auth/otp/verify-signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    token: userSubmittedOtp // e.g., "123456"
  })
});

const { data } = await verifyResponse.json();
localStorage.setItem('token', data.token);
// Redirect to dashboard
```

---

## Troubleshooting

### "Supabase not configured"
- Ensure `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set in `.env`
- Server must be restarted after changing `.env`
- Check for typos in the URL and key

### OTP not received
- Check email spam/junk folder
- Verify email address is correct
- Check Supabase Email Log (Auth → Users → select user)
- Ensure "Email OTP" is enabled in Supabase Authentication settings

### "User already exists"
- User with that email is already registered
- Use a different email or reset password through recovery flow

### Database Connection Error
- Ensure MongoDB is running on localhost:27017
- Check `MONGODB_URI` in `.env`
- MongoDB can be started with: `mongod` (if installed locally)

---

## Security Notes

1. **Never commit .env file** - It contains secrets
2. **Use HTTPS in production** - Don't send tokens over HTTP
3. **Store tokens securely** - Use httpOnly cookies or secure localStorage
4. **OTP expires** - Default Supabase OTP expiry is 1 hour
5. **Rate limiting** - Consider adding rate limits to auth endpoints
6. **Password requirements** - Currently no specific requirements; consider adding

---

## Next Steps

1. ✅ Backend authentication is configured
2. Next: Update frontend to use these endpoints
3. Then: Add frontend OTP verification UI
4. Finally: Add password reset flow
