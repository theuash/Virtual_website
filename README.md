# Virtual Platform - Complete Guide

## Overview

Virtual Platform is a comprehensive learning and earning platform where users can:
- Create and manage projects
- Assign and track tasks
- Earn based on project completion
- Grow through promotion system
- Collaborate with teams
- Build their professional portfolio

## Architecture

### Frontend
- Static HTML/CSS/JavaScript application
- Responsive design
- Real-time UI updates
- Modal-based interactions

### Backend
- Node.js with Express.js
- MongoDB database
- RESTful API
- JWT Authentication
- Role-based access control

### Database
- MongoDB for data persistence
- Collections for Users, Projects, Tasks, Earnings, Notifications, Teams

## Folder Structure

```
website/
├── public/
│   └── index.html              # Main application file
├── backend/
│   ├── config/                 # Configuration
│   ├── controllers/            # Business logic
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── projectController.js
│   │   ├── taskController.js
│   │   ├── notificationController.js
│   │   ├── earningController.js
│   │   └── teamController.js
│   ├── middleware/             # Express middleware
│   │   ├── auth.js
│   │   └── validators.js
│   ├── models/                 # MongoDB schemas
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── Task.js
│   │   ├── Notification.js
│   │   ├── Earning.js
│   │   └── Team.js
│   ├── routes/                 # API endpoints
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── projectRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── earningRoutes.js
│   │   └── teamRoutes.js
│   ├── utils/                  # Helper functions
│   │   └── helpers.js
│   ├── server.js               # Main server
│   ├── package.json            # NPM dependencies
│   ├── .env                    # Environment config
│   └── README.md               # Backend docs
└── README.md                   # This file
```

## Quick Start

### Step 1: Prerequisites
- Node.js v14+
- MongoDB (local or Atlas)
- npm or yarn

### Step 2: Install Dependencies

```bash
cd backend
npm install
```

### Step 3: Configure Environment

Create `.env` file in the `backend` folder:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/virtual-platform
JWT_SECRET=your_secure_secret_key_here
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:5000/api
```

### Step 4: Start Backend Server

```bash
cd backend
npm install  # First time only
npm run dev  # Development mode with auto-reload
```

Server will run on `http://localhost:5000`

### Step 5: Access Frontend

Open `http://localhost:5000` in your browser

## User Roles

1. **Precrate** - Beginner, limited access
2. **Crate** - Active user, can create projects
3. **Project Initiator** - Can initiate and manage larger projects
4. **Momentum Supervisor** - Can supervise and manage teams
5. **Admin** - Full system access

## Promotion Requirements

| Role | Next Role | Requirements |
|------|-----------|--------------|
| precrate | crate | 1 project, $100 earnings |
| crate | project_initiator | 10 projects, $5000 earnings |
| project_initiator | momentum_supervisor | 25 projects, $20000 earnings |
| momentum_supervisor | admin | 50 projects, $100000 earnings |

## Key Features

### Authentication
- Secure signup and login
- JWT token-based authentication
- Token expiration: 7 days
- Password hashing with bcryptjs

### Projects
- Create, read, update, delete projects
- Assign users to projects
- Track project progress
- Manage project budget and deadline

### Tasks
- Create and assign tasks
- Update task status (pending, in_progress, completed)
- Add comments and attachments
- Track estimated vs actual hours

### Earnings
- Track earnings from completed tasks/projects
- Manage payment methods
- Request payouts
- View earning statistics

### Notifications
- Real-time notification system
- Mark as read/unread
- Filter by type
- Auto-expire after 30 days

### Team Management
- Create teams
- Add/remove members
- Assign roles within team
- Associate projects with teams

## API Authentication

All API requests (except signup/login) require:

```
Authorization: Bearer <YOUR_JWT_TOKEN>
```

Example:
```bash
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  http://localhost:5000/api/users/profile
```

## Common API Responses

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": { ... }
}
```

### Authentication Error
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

## Development Tips

1. **Use Postman** - Test API endpoints easily
2. **Check Logs** - Server logs show all requests and errors
3. **Validate Input** - Frontend and backend validation
4. **Use DevTools** - Browser console shows frontend logs
5. **Check MongoDB** - Use MongoDB Compass to view data

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify MongoDB credentials

### Port Already in Use
- Change PORT in `.env`
- Kill process on port 5000: `lsof -i :5000`

### CORS Errors
- Frontend and backend must run on different ports
- CORS is enabled in server.js
- Check browser console for details

### Authentication Errors
- Verify JWT_SECRET in `.env`
- Check token expiration
- Clear browser localStorage and login again

### Token Expired
- User needs to login again
- Tokens expire after JWT_EXPIRE time (default 7 days)

## Database Backup

For production, regularly backup your MongoDB:

```bash
# Local MongoDB backup
mongodump --uri mongodb://localhost:27017/virtual-platform --out ./backup

# MongoDB Atlas backup
# Use Atlas automated backup feature
```

## Performance Optimization

- Indexes on frequently queried fields
- Pagination for large datasets
- Caching strategies for notifications
- Connection pooling with MongoDB

## Security Considerations

1. Use strong JWT_SECRET (minimum 32 characters)
2. Enable HTTPS in production
3. Validate all user inputs
4. Use environment variables for secrets
5. Implement rate limiting
6. Regular security audits

## Support & Maintenance

- Monitor server logs
- Database performance tuning
- Regular backups
- Security updates
- User support system

## License

MIT License

## Contact

For issues and support, refer to your documentation or contact the development team.
