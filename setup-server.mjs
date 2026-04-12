import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const serverDir = path.join(process.cwd(), 'server');
if (!fs.existsSync(serverDir)) fs.mkdirSync(serverDir);
process.chdir(serverDir);

// 1. Initialize npm
fs.writeFileSync('package.json', JSON.stringify({
  name: "virtual-backend",
  version: "1.0.0",
  type: "module",
  scripts: {
    start: "node server.js",
    dev: "nodemon server.js"
  }
}, null, 2));

// 2. Directories
const dirs = ['config', 'models', 'middleware', 'routes', 'controllers', 'services', 'sockets', 'utils'];
dirs.forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d);
});

// 3. Setup .env
fs.writeFileSync('.env', `PORT=5000
MONGODB_URI=mongodb://localhost:27017/virtual
JWT_SECRET=super_secret_jwt_key
JWT_REFRESH_SECRET=super_secret_refresh_key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5174
NODE_ENV=development
`);

// 4. Utility files
fs.writeFileSync('utils/asyncHandler.js', `export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
`);

fs.writeFileSync('utils/ApiError.js', `export class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.success = false;
  }
}
`);

fs.writeFileSync('utils/ApiResponse.js', `export class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}
`);

// 5. Config files
fs.writeFileSync('config/db.js', `import mongoose from 'mongoose';
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(\`MongoDB Connected: \${conn.connection.host}\`);
  } catch (error) {
    console.error(\`Error: \${error.message}\`);
    process.exit(1);
  }
};
`);

fs.writeFileSync('config/constants.js', `export const ROLES = ['client', 'freelancer', 'admin'];
export const SKILLS = ['video_editing', '3d_animation', 'cgi', 'script_writing', 'graphic_designing'];
export const TIERS = ['precrate', 'crate', 'project_initiator', 'momentum_supervisor', 'admin'];
export const PROJECT_STATUS = ['open', 'in_progress', 'under_review', 'completed', 'cancelled'];
export const TASK_STATUS = ['unassigned', 'assigned', 'submitted', 'approved', 'rejected'];
export const PAYMENT_TYPE = ['escrow_hold', 'escrow_release', 'payout', 'refund'];
export const PAYMENT_STATUS = ['pending', 'held', 'released', 'failed'];
export const DISPUTE_STATUS = ['open', 'under_review', 'resolved'];
`);

// 6. Base Model (User, Client, Freelancer using discriminators)
fs.writeFileSync('models/User.js', `import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES } from '../config/constants.js';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ROLES, required: true },
  fullName: { type: String, required: true },
  avatar: { type: String },
  isVerified: { type: Boolean, default: false },
  isSuspended: { type: Boolean, default: false },
}, { timestamps: true, discriminatorKey: 'userType' });

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

export const User = mongoose.model('User', userSchema);
`);

fs.writeFileSync('models/Client.js', `import mongoose from 'mongoose';
import { User } from './User.js';

const clientSchema = new mongoose.Schema({
  companyName: String,
  totalSpent: { type: Number, default: 0 },
  activeProjects: { type: Number, default: 0 },
  completedProjects: { type: Number, default: 0 }
});
export const Client = User.discriminator('Client', clientSchema);
`);

fs.writeFileSync('models/Freelancer.js', `import mongoose from 'mongoose';
import { User } from './User.js';
import { SKILLS, TIERS } from '../config/constants.js';

const freelancerSchema = new mongoose.Schema({
  primarySkill: { type: String, enum: SKILLS },
  tier: { type: String, enum: TIERS, default: 'precrate' },
  dateOfBirth: Date,
  portfolioUrl: String,
  totalEarnings: { type: Number, default: 0 },
  tasksCompleted: { type: Number, default: 0 },
  projectsCompleted: { type: Number, default: 0 },
  teamProjectsCompleted: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  promotionEligible: { type: Boolean, default: false }
});
export const Freelancer = User.discriminator('Freelancer', freelancerSchema);
`);

// Setup basic app.js and server.js
fs.writeFileSync('app.js', `import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(helmet());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// 404
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Default error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
    errors: err.errors
  });
});

export default app;
`);

fs.writeFileSync('server.js', `import 'dotenv/config.js';
import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(\`Server running in \${process.env.NODE_ENV} mode on port \${PORT}\`);
  });
});
`);

console.log('Setup basic server scaffolding.');
