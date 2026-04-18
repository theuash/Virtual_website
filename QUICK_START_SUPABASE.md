# Quick Start - Supabase OTP Production

## 🎯 What to Do (10 minutes)

### 1️⃣ Configure Email Provider (5 min)

**SendGrid (Recommended):**
1. Go to: https://sendgrid.com
2. Create account
3. Get API key
4. Go to: https://supabase.com/dashboard
5. Select project → **Authentication** → **Email**
6. Select **SendGrid**
7. Paste API key
8. Save

### 2️⃣ Verify Render Environment (2 min)

1. Go to: https://dashboard.render.com
2. Select backend service
3. **Environment** tab
4. Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` exist
5. If missing, add them

### 3️⃣ Deploy (1 min)

```bash
git push
```

### 4️⃣ Test (2 min)

1. Go to: https://virtual-core.netlify.app/login
2. Enter email + password
3. Click "Continue To Phone Verification"
4. Check email for OTP
5. Enter OTP
6. ✅ Done!

---

## 📊 Status

| Component | Status |
|-----------|--------|
| Backend | ✅ Ready |
| Frontend | ✅ Ready |
| Database | ✅ Ready |
| Supabase | ✅ Configured |
| Email Provider | ⏳ **YOU DO THIS** |
| Render Env | ✅ Set |

---

## 🔗 Links

- Supabase Dashboard: https://supabase.com/dashboard
- Render Dashboard: https://dashboard.render.com
- Production Site: https://virtual-core.netlify.app
- SendGrid: https://sendgrid.com

---

## ✅ Checklist

- [ ] Create SendGrid account
- [ ] Get API key
- [ ] Configure in Supabase
- [ ] Verify Render env vars
- [ ] Push changes
- [ ] Test on production

---

## 🎉 Done!

Supabase OTP working in production!

