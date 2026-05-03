import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    // Parse comma-separated CLIENT_URL, strip trailing slashes from each
    const allowed = (process.env.CLIENT_URL || '')
      .split(',')
      .map(u => u.trim().replace(/\/$/, ''));
    if (allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow frontend to load assets
}));
app.use(morgan('dev'));
app.use(cookieParser());

// Serve static assets (videos, images, etc.)
app.use('/assets', express.static(join(__dirname, 'assets')));
app.use('/uploads', express.static(join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

import authRoutes from './routes/users/auth.routes.js';
import clientRoutes from './routes/roles/client.routes.js';
import freelancerRoutes from './routes/roles/freelancer.routes.js';
import crateRoutes from './routes/features/crate.routes.js';
import initiatorRoutes from './routes/roles/initiator.routes.js';
import adminRoutes from './routes/roles/admin.routes.js';
import seedRoutes from './routes/features/seed.routes.js';
import pricingRoutes from './routes/features/pricing.routes.js';
import learningRoutes from './routes/features/learning.routes.js';
import messagingRoutes from './routes/features/messaging.routes.js';
import profileRoutes from './routes/users/profile.routes.js';
import supervisorRoutes from './routes/roles/supervisor.routes.js';
import geoRoutes from './routes/features/geo.routes.js';
import debugRoutes from './routes/features/debug.routes.js';

app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/freelancer', freelancerRoutes);
app.use('/api/crate', crateRoutes);
app.use('/api/initiator', initiatorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/messaging', messagingRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/supervisor', supervisorRoutes);
app.use('/api/geo', geoRoutes);
app.use('/api/debug', debugRoutes);

if (process.env.NODE_ENV !== 'production') {
  app.use('/api/seed', seedRoutes);
}

// 404
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Default error handler
app.use((err, req, res, next) => {
  console.error('[Express Error Handler]:', err.message, err.stack);
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
    errors: err.errors
  });
});

export default app;
