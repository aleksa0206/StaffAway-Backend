import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import pinoHttp from 'pino-http';
import { logger } from './config/logger';
import apiKeyRoutes from './routes/apiKeyRoutes';
import attachmentRoutes from './routes/attachmentRoutes';
import auditLogRoutes from './routes/auditLogRoutes';
import authRoutes from './routes/authRoutes';
import commentRoutes from './routes/commentRoutes';
import companyRoutes from './routes/companyRoutes';
import companySettingsRoutes from './routes/companySettingsRoutes';
import departmentRoutes from './routes/departmentRoutes';
import healthRoutes from './routes/healthRoutes';
import holidayRoutes from './routes/holidayRoutes';
import leaveBalanceRoutes from './routes/leaveBalanceRoutes';
import leaveRequestRoutes from './routes/leaveRequestRoutes';
import leaveTypeRoutes from './routes/leaveTypeRoutes';
import notificationRoutes from './routes/notificationRoutes';
import statusHistoryRoutes from './routes/statusHistoryRoutes';
import userRoutes from './routes/userRoutes';
import workScheduleRoutes from './routes/workScheduleRoutes';
import { errorMiddleware } from './middleware/errorMiddleware';
import { generalDbRateLimiter } from './middleware/dbRateLimiter';
import type {} from './types/express';

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  next();
});
app.use(
  pinoHttp({
    logger,
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
      censor: '[Redacted]',
    },
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(generalDbRateLimiter);
app.use(healthRoutes);
app.use(userRoutes);
app.use(departmentRoutes);
app.use(leaveTypeRoutes);
app.use(holidayRoutes);
app.use(companyRoutes);
app.use(commentRoutes);
app.use(workScheduleRoutes);
app.use(notificationRoutes);
app.use(auditLogRoutes);
app.use(attachmentRoutes);
app.use(statusHistoryRoutes);
app.use(leaveRequestRoutes);
app.use(leaveBalanceRoutes);
app.use(companySettingsRoutes);
app.use(apiKeyRoutes);
app.use(authRoutes);
app.use(errorMiddleware);

export default app;
