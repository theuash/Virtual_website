# Virtual Platform - Backend Setup

This is the backend for the Virtual Platform - Learn. Earn. Grow.

## Project Structure

```
backend/
├── config/           # Configuration files
├── controllers/      # Request handlers
├── middleware/       # Express middleware
├── models/          # MongoDB schemas
├── routes/          # API routes
├── utils/           # Helper functions
├── server.js        # Main server file
├── .env             # Environment variables
└── package.json     # Dependencies
```

## Installation

1. Install Node.js (v14 or higher)
2. Install MongoDB Community Edition or use MongoDB Atlas
3. Navigate to the backend folder:
   ```bash
   cd backend
   ```
4. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

Create a `.env` file in the backend folder with the following variables:

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/virtual-platform
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:5000/api
```

## Running the Server

**Development Mode (with auto-restart):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Users
- `GET /api/users/profile` - Get user profile
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `GET /api/users` - Get all users

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/assign` - Assign user to project

### Tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/:id/status` - Update task status
- `POST /api/tasks/:id/comment` - Add comment

### Notifications
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread/count` - Get unread count
- `PUT /api/notifications/:notificationId/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Earnings
- `GET /api/earnings` - Get earnings
- `GET /api/earnings/stats` - Get earnings stats
- `POST /api/earnings` - Create earning
- `POST /api/earnings/payout/request` - Request payout

### Team
- `POST /api/team` - Create team
- `GET /api/team` - Get teams
- `GET /api/team/:id` - Get team by ID
- `PUT /api/team/:id` - Update team
- `POST /api/team/:id/members` - Add member
- `DELETE /api/team/:id/members` - Remove member

## Database Models

### User
- name, email, password, dateOfBirth
- avatar, role, freelancingFields
- completedProjects, totalEarnings
- supervisor, isActive

### Project
- title, description, type, budget
- status, progress, deadline
- createdBy, assignedTo, tasks

### Task
- title, description, project
- assignedTo, status, priority
- dueDate, estimatedHours, actualHours
- comments, attachments

### Notification
- recipient, title, message, type
- read, readAt, actionUrl

### Earning
- user, project, task, amount
- description, status, earnedDate, paidDate

### Team
- name, description, leader
- members, projects, isActive

## Database Setup

MongoDB connection string should be provided in `.env` file. The application will automatically create collections when models are first used.

For local MongoDB:
```
MONGODB_URI=mongodb://localhost:27017/virtual-platform
```

For MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/virtual-platform
```

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Role-based access control
- Environment variable management
- CORS enabled
- Input validation

## Error Handling

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "error": {...}
}
```

## Development Notes

- Use nodemon for auto-restart during development
- All API requests require authentication token in Authorization header
- Tokens expire after 7 days by default
- Passwords are hashed and never stored in plain text
