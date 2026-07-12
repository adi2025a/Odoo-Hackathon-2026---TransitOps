import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env } from './config/env';
import { connectDB } from './config/db';
import { corsOptions } from './config/cors';
import cors from 'cors';

// Import Middlewares
import { errorHandler } from './middleware/errorHandler';
import { publicLimiter } from './middleware/rateLimiter';
import { auditLogger } from './middleware/auditLog';

// Import Route Routers
import authRouter from './modules/auth/auth.router';
import vehiclesRouter from './modules/vehicles/vehicles.router';
import driversRouter from './modules/drivers/drivers.router';
import tripsRouter from './modules/trips/trips.router';
import maintenanceRouter from './modules/maintenance/maintenance.router';
import fuelRouter from './modules/fuel/fuel.router';
import expensesRouter from './modules/expenses/expenses.router';
import reportsRouter from './modules/reports/reports.router';
import analyticsRouter from './modules/analytics/analytics.router';
import notificationsRouter from './modules/notifications/notifications.router';
import documentsRouter from './modules/documents/documents.router';
import settingsRouter from './modules/settings/settings.router';
import profileRouter from './modules/profile/profile.router';

// Import jobs
import { startCronJobs } from './jobs/cronJobs';

const app = express();

// Set security headers (excluding cross-origin-resource-policy constraint for local public uploads)
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Audit Logger for all mutating write requests
app.use(auditLogger);

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Mount API Routers
app.use('/api/auth', authRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/drivers', driversRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/maintenance', maintenanceRouter);
app.use('/api/fuel', fuelRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/profile', profileRouter);

// Health Check Endpoint
app.get('/health', publicLimiter, (req, res) => {
  res.status(200).json({ status: 'healthy', database: mongooseConnectionState() });
});

// Global Error Handler
app.use(errorHandler);

// Helper for health check DB status
function mongooseConnectionState() {
  const states: any = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  const conn = require('mongoose').connection;
  return states[conn.readyState] || 'unknown';
}

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    
    // Start node-cron jobs
    startCronJobs();

    const PORT = env.PORT;
    app.listen(PORT, () => {
      console.log(`🚀 TransitOps API Backend listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
