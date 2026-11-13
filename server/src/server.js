import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { env } from './config/env.js';
import { authMiddleware } from './middleware/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import farmRoutes from './routes/farmRoutes.js';
import cropRoutes from './routes/cropRoutes.js';
import soilRoutes from './routes/soilRoutes.js';
import fertilizerRoutes from './routes/fertilizerRoutes.js';
import irrigationRoutes from './routes/irrigationRoutes.js';
import diseaseRoutes from './routes/diseaseRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';
import historyRoutes from './routes/historyRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(morgan('dev'));

// Static files for uploaded disease inspection images
const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Healthcheck
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'AgriSahayak Agricultural Decision-Support API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Authentication middleware applied across API
app.use('/api', authMiddleware);

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/crop-recommendation', cropRoutes);
app.use('/api/soil-analysis', soilRoutes);
app.use('/api/fertilizer', fertilizerRoutes);
app.use('/api/irrigation', irrigationRoutes);
app.use('/api/disease-detection', diseaseRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/history', historyRoutes);

// Serve static frontend build if dist exists
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error handling middleware
app.use(errorHandler);

const PORT = env.PORT || 5000;

// Start server if directly executed
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🌾 AgriSahayak Backend Server running on http://localhost:${PORT}`);
    console.log(`🌱 Agricultural AI Engine: Active (${env.GEMINI_MODEL})`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);
  });
}
