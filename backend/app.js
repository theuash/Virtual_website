import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL, // Add your local dev port too
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow frontend to load assets
}));
app.use(morgan('dev'));

// Serve static assets (videos, images, etc.)
app.use('/assets', express.static(join(__dirname, 'assets')));
app.use('/uploads', express.static(join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

import authRoutes from './routes/auth.routes.js';
import clientRoutes from './routes/client.routes.js';
import freelancerRoutes from './routes/freelancer.routes.js';
import crateRoutes from './routes/crate.routes.js';
import initiatorRoutes from './routes/initiator.routes.js';
import adminRoutes from './routes/admin.routes.js';
import seedRoutes from './routes/seed.routes.js';
import pricingRoutes from './routes/pricing.routes.js';
import learningRoutes from './routes/learning.routes.js';
import messagingRoutes from './routes/messaging.routes.js';
import profileRoutes from './routes/profile.routes.js';
import supervisorRoutes from './routes/supervisor.routes.js';

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

if (process.env.NODE_ENV !== 'production') {
  app.use('/api/seed', seedRoutes);
}

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
