# Virtual Platform - Complete Setup Guide

## Project Overview

The Virtual Platform is a full-stack web application built with:
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (single-page app)
- **Backend**: Node.js with Express.js REST API
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
website/
├── backend/                    # Node.js/Express server & API
│   ├── config/                 # Configuration files
│   ├── controllers/            # Business logic (7 files)
│   ├── middleware/             # Authentication & validation
│   ├── models/                 # MongoDB schemas (6 models)
│   ├── routes/                 # API endpoints (7 routes, 37 endpoints)
│   ├── utils/                  # Helper functions
│   ├── package.json            # NPM dependencies
│   ├── .env                    # Environment variables
│   ├── server.js               # Express app initialization
│   └── README.md               # Backend documentation
├── public/                     # Frontend static files
│   ├── index.html              # Main HTML file (SPA)
│   └── app.js                  # JavaScript application
└── README.md                   # Project overview
```

## Prerequisites

Before you start, ensure you have installed:

1. **Node.js** (v14 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

2. **MongoDB** (v4.4 or higher)
   - Option A: Local installation from https://www.mongodb.com/try/download/community
   - Option B: MongoDB Atlas cloud database (recommended for beginners)
   - Verify: `mongod --version`

## Installation Steps

### 1. Install Node.js Dependencies

```bash
# Navigate to the backend directory
cd backend

# Install all required packages
npm install
```

This will install:
- `express` - Web server framework
- `mongoose` - MongoDB ORM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `express-validator` - Input validation
- `dotenv` - Environment variables
- `cors` - Cross-Origin Resource Sharing
- And more...

### 2. Configure Environment Variables

Create/update the `backend/.env` file with your settings:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/virtual-platform

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Password Hashing
BCRYPT_ROUNDS=10

# Optional: Email Configuration (for future features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### MongoDB Connection Options:

**Option A: Local MongoDB**
```
MONGODB_URI=mongodb://localhost:27017/virtual-platform
```

**Option B: MongoDB Atlas (Cloud)**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/virtual-platform?retryWrites=true&w=majority
```

### 3. Start MongoDB

**If using local MongoDB:**
```bash
# On Windows
mongod --dbpath "path/to/data/directory"

# On macOS/Linux
mongod
```

**If using MongoDB Atlas:**
- No local setup needed, connection is via connection string in .env

### 4. Start the Application

```bash
# From the backend directory
npm start

# Or for development with auto-reload:
npm run dev
```

You should see:
```
MongoDB Connected: localhost
Server running on port 5000
```

### 5. Access the Application

Open your browser and navigate to:
```
http://localhost:5000
```

## Usage Guide

### First Time Setup

1. **Create Account**
   - Click "Sign Up" tab
   - Enter your name, email, password, and date of birth (must be 16+)
   - Select at least one skill/field
   - Click "Sign Up"

2. **Login**
   - Use the credentials you just created
   - You'll be assigned the "precrate" role (learner)

3. **Explore Features**
   - **Dashboard**: View overview of projects, tasks, earnings
   - **Projects**: Create and manage projects (requires "crate" role or higher)
   - **Tasks**: View assigned tasks and track progress
   - **Earnings**: Monitor your earnings and request payouts
   - **Profile**: View and manage your profile and skills

### User Roles & Promotion

The platform has 5 role levels:

1. **Precrate** (Learner)
   - Can view content and learning resources
   - Cannot create projects yet

2. **Crate** (Basic Worker)
   - Can create personal projects
   - Can accept and complete tasks
   - Earns based on completed tasks
   - **Promotion req**: 10 completed projects OR $5,000 earned

3. **Project Initiator** (Intermediate)
   - Can create team projects
   - Can assign team members
   - Higher earning potential
   - **Promotion req**: 15 completed projects OR $10,000 earned

4. **Momentum Supervisor** (Advanced)
   - Can manage team members
   - Can create main projects
   - Can supervise other craters

5. **Admin** (Platform Admin)
   - Full platform access
   - System administration

### Creating a Project

1. Click **"+ New Project"** button
2. Fill in project details:
   - **Title**: Project name
   - **Type**: Personal, Team, or Main
   - **Description**: Project details
   - **Budget**: Expected project cost
   - **Deadline**: Project deadline
3. Click **"Create Project"**

### Working on Tasks

1. Navigate to **"My Tasks"**
2. Find a pending task
3. Click **"Start Task"** to begin working
4. Once complete, click **"Mark Complete"**
5. Earnings are credited upon completion

### Requesting Payout

1. Go to **"Earnings"** section
2. Click **"Request Payout"**
3. Enter payout amount
4. Request is processed within 3-5 business days

## API Endpoints

### Authentication Endpoints
```
POST   /api/auth/signup           - Register new user
POST   /api/auth/login            - User login
GET    /api/auth/me               - Get current user
POST   /api/auth/logout           - User logout
```

### User Endpoints
```
GET    /api/users/profile         - Get user profile
GET    /api/users/:id             - Get specific user
PUT    /api/users/:id             - Update user
GET    /api/users                 - Get all users
POST   /api/users/promote         - Promote user to next role
```

### Project Endpoints
```
POST   /api/projects              - Create project
GET    /api/projects              - Get user's projects
GET    /api/projects/:id          - Get specific project
PUT    /api/projects/:id          - Update project
DELETE /api/projects/:id          - Delete project
POST   /api/projects/:id/assign   - Assign user to project
```

### Task Endpoints
```
POST   /api/tasks                 - Create task
GET    /api/tasks                 - Get user's tasks
GET    /api/tasks/:id             - Get specific task
PUT    /api/tasks/:id             - Update task
PUT    /api/tasks/:id/status      - Update task status
DELETE /api/tasks/:id             - Delete task
POST   /api/tasks/:id/comment     - Add task comment
```

### Notification Endpoints
```
GET    /api/notifications         - Get notifications
GET    /api/notifications/unread/count   - Get unread count
PUT    /api/notifications/:id/read       - Mark as read
PUT    /api/notifications/read-all       - Mark all as read
DELETE /api/notifications/:id     - Delete notification
```

### Earning Endpoints
```
GET    /api/earnings              - Get earnings
GET    /api/earnings/stats        - Get earning statistics
GET    /api/earnings/:id          - Get specific earning
POST   /api/earnings              - Create earning
POST   /api/earnings/payout/request - Request payout
```

### Team Endpoints
```
POST   /api/team                  - Create team
GET    /api/team                  - Get teams
GET    /api/team/:id              - Get specific team
PUT    /api/team/:id              - Update team
DELETE /api/team/:id              - Delete team
POST   /api/team/:id/members      - Add team member
DELETE /api/team/:id/members      - Remove team member
```

## Testing the API

### Using cURL (Command Line)

```bash
# Test health check
curl http://localhost:5000/api/health

# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"pass123","dob":"2005-01-15"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'
```

### Using Postman

1. Download Postman: https://www.postman.com/downloads/
2. Import the API collection (create requests for each endpoint)
3. Set the base URL: `http://localhost:5000`
4. For protected endpoints, add Authorization header: `Bearer YOUR_JWT_TOKEN`

## Troubleshooting

### MongoDB Connection Error
```
Error: Cannot open connection to mongodb://localhost:27017
```

**Solution:**
- Make sure MongoDB is running: `mongod`
- Check if port 27017 is available
- Verify MONGODB_URI in .env file

### Port 5000 Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solution:**
- Change PORT in .env to another port (e.g., 5001)
- Or kill the process using port 5000:
  - Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
  - Mac/Linux: `lsof -i :5000` then `kill -9 <PID>`

### npm install Fails
```
Error: npm ERR! code ERESOLVE, unable to resolve dependency tree
```

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Install with legacy peer deps flag
npm install --legacy-peer-deps
```

### Application Crashes on Startup
- Check the error message in console
- Verify all environment variables in .env
- Ensure all required packages are installed: `npm install`
- Check MongoDB is running

### Frontend Not Loading
- Make sure server is running: `npm start` (from backend folder)
- Check browser console for errors (F12)
- Clear browser cache (Ctrl+Shift+Delete)
- Verify public/index.html and public/app.js exist

## Development Tips

### Hot Reload (Auto-restart on file changes)
Install and use nodemon:
```bash
npm install --save-dev nodemon
npm run dev  # Uses nodemon script in package.json
```

### View Database Collections
```bash
# Connect to MongoDB
mongosh

# List databases
show dbs

# Select your database
use virtual-platform

# List collections
show collections

# Query data
db.users.find().pretty()
db.projects.find().pretty()
```

### Debugging JavaScript
1. Open browser DevTools (F12)
2. Go to Console tab
3. Check for JavaScript errors
4. Use Network tab to monitor API calls

### Testing Workflow
1. Create an account
2. Login
3. Create a project
4. Create a task within the project
5. Complete the task
6. Check earnings increased
7. View notifications

## Production Deployment

### Before Deploying:
1. Update JWT_SECRET to a strong, random value
2. Set NODE_ENV=production in .env
3. Use a managed MongoDB service (MongoDB Atlas)
4. Enable HTTPS
5. Set proper CORS origins

### Deployment Platforms:
- **Heroku**: Follow Heroku docs for Node.js apps
- **AWS**: Use EC2 + RDS for MongoDB
- **DigitalOcean**: Similar to AWS setup
- **Render.com**: Easy Node.js deployment
- **Railway**: Simple MongoDB + Node.js hosting

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT Authentication](https://jwt.io/)

## Support & Issues

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review error messages in console
3. Check MongoDB connection
4. Ensure all environment variables are set
5. Try restarting the server

## Project Summary

- **37 API Endpoints** for complete platform functionality
- **6 Database Models** for comprehensive data management
- **Role-Based Access Control** with 5 user levels
- **JWT Authentication** for secure user sessions
- **Promotion System** that automatically elevates users
- **Real-time Notifications** for user engagement
- **Earnings Tracking** with task-based compensation
- **Team Collaboration** with member management
- **Task Management** with status tracking
- **Project Management** with progress monitoring

---

**Happy Building!** 🚀

For detailed backend API documentation, see [backend/README.md](backend/README.md)
For project architecture overview, see [README.md](README.md)
