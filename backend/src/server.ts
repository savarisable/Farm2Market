import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import routes from './routes/api';
import { errorHandler } from './middleware/errorHandler';

export function createServer() {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'HEALTHY',
      service: 'Farm2Market SmartMandi API',
      problemStatementId: '26033',
      ministry: 'Ministry of Consumer Affairs, Food & Public Distribution (DoCA)',
      timestamp: new Date().toISOString(),
    });
  });

  // Master API router
  app.use('/api', routes);

  // Serve static frontend build if present
  const possibleDistPaths = [
    path.resolve(__dirname, '../../frontend/dist'),
    path.resolve(__dirname, '../frontend/dist'),
    path.resolve(process.cwd(), 'frontend/dist'),
    path.resolve(process.cwd(), '../frontend/dist'),
    path.resolve(process.cwd(), 'dist'),
    path.resolve(process.cwd(), 'public'),
  ];
  const frontendDist = possibleDistPaths.find(
    (p) => fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))
  );

  if (frontendDist) {
    app.use(express.static(frontendDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ success: false, message: 'API endpoint not found' });
      }
      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  }

  // Centralized Error handler
  app.use(errorHandler);

  return app;
}

