import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    const allowed = (process.env.CLIENT_URL || '').split(',').map(u => u.trim());
    if (!origin || allowed.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));

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

app.use('/api/auth', authRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/freelancer', freelancerRoutes);
app.use('/api/crate', crateRoutes);
app.use('/api/initiator', initiatorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/messaging', messagingRoutes);

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
