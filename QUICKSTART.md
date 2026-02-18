# Quick Start - Virtual Platform

## 🚀 Get Running in 5 Minutes

### Step 1: Prerequisites ✅
- **Node.js** v14+ installed? Check: `node --version`
- **MongoDB** running? (local or MongoDB Atlas)

### Step 2: Run the Quick Start Script

**Windows:**
```bash
start.bat
```

**Mac/Linux:**
```bash
bash start.sh
```

### Step 3: Open Browser
```
http://localhost:5000
```

---

## 📋 Manual Setup (If Script Doesn't Work)

### Install Dependencies
```bash
cd backend
npm install
```

### Configure Database
Edit `backend/.env`:

**For Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/virtual-platform
```

**For MongoDB Atlas (Cloud):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/virtual-platform
```

### Start Server
```bash
npm start
```

### Open App
```
http://localhost:5000
```

---

## 🧪 Test the Platform

1. **Sign Up**
   - Create account with email, password, DOB (16+), and skill selection
   - You'll start as "precrate" (learner)

2. **Explore Dashboard**
   - View your stats, recent tasks, active projects
   - Check notifications and team members

3. **Create a Project**
   - Click "+ New Project" (requires "crate" role or higher)
   - Fill in title, type, description, budget, deadline
   - Click "Create Project"

4. **Complete a Task**
   - Go to "My Tasks"
   - Click "Start Task" on a pending task
   - Click "Mark Complete" when done
   - Watch your earnings increase!

5. **Check Earnings**
   - Go to "Earnings" section
   - See your total earnings from completed tasks
   - Click "Request Payout" to cash out

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't connect to MongoDB | Make sure `mongod` is running in another terminal |
| Port 5000 in use | Change PORT in `.env` to 5001, 5002, etc. |
| npm install fails | Run: `npm install --legacy-peer-deps` |
| Page won't load | Check browser console (F12) for errors |
| API not responding | Verify backend is running: `npm start` works |

---

## 📚 What's Included?

✅ **Full-stack application** - Backend API + Frontend UI
✅ **Authentication system** - Signup, login, JWT tokens
✅ **6 data models** - Users, Projects, Tasks, Earnings, Notifications, Teams
✅ **37 API endpoints** - Complete REST API for all features
✅ **Role-based access** - 5 user levels with permissions
✅ **Promotion system** - Automatic role upgrading
✅ **Earnings tracking** - Task-based money system
✅ **Real-time features** - Notifications, live updates

---

## 🎯 User Roles

```
Precrate → Crate → Project Initiator → Momentum Supervisor → Admin
(Learner) (Worker) (Manager)        (Supervisor)          (System Admin)
```

Promote by completing projects or earning money!

---

## 📁 Project Structure

```
website/
├── backend/              # Express.js API server
│   ├── models/           # Database schemas
│   ├── controllers/      # Business logic
│   ├── routes/           # API endpoints
│   ├── middleware/       # Auth & validation
│   ├── utils/            # Helper functions
│   └── server.js         # Main server file
├── public/               # Frontend (served by Express)
│   ├── index.html        # Main app
│   └── app.js            # JavaScript logic
├── SETUP.md              # Detailed setup guide
├── start.bat             # Quick start (Windows)
└── start.sh              # Quick start (Mac/Linux)
```

---

## 🔗 Key Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/users/profile` | Get profile |
| POST | `/api/projects` | Create project |
| GET | `/api/tasks` | Get tasks |
| POST | `/api/earnings` | Track earnings |

See [backend/README.md](backend/README.md) for all 37 endpoints.

---

## 💡 Pro Tips

- **Speed up setup**: Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free cloud MongoDB)
- **Better debugging**: Use Postman to test API calls
- **Auto-reload code**: Use `npm run dev` instead of `npm start`
- **Check database**: Use MongoDB Compass to visualize data

---

## 📖 Full Documentation

- **Setup Guide**: [SETUP.md](SETUP.md)
- **Backend APIs**: [backend/README.md](backend/README.md)
- **Project Overview**: [README.md](README.md)

---

## ❓ Issues?

1. Check error message in terminal
2. Verify MongoDB is running
3. Check `backend/.env` file
4. Review [SETUP.md](SETUP.md) troubleshooting section
5. Check browser console for JavaScript errors (F12)

---

## 🎉 You're All Set!

Your complete platform is ready to go. Start building amazing things! 🚀

**Questions?** Check the documentation files or review the code - it's all well-commented!
