import 'dotenv/config.js';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger.js';
import config from './config.js';
import errorHandler from './middleware/errorHandler.js';
import searchRoutes from './routes/searchRoutes.js';
import emailRoutes from './routes/emailRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = config.port;

// Trust proxy (needed for Railway, Vercel, etc)
app.set('trust proxy', 1);

// CORS - Enable ALL origins for now (demo/test mode)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: false,
  optionsSuccessStatus: 200,
}));

// Middleware de sécurité
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    origin: req.get('origin'),
    ip: req.ip,
  });
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Trop de requêtes, veuillez réessayer plus tard.',
});

app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Fichiers statiques
app.use(express.static(path.join(__dirname, '../public')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes API
app.get('/api', (req, res) => {
  res.json({ message: 'API SourceBot v1.0.0', timestamp: new Date().toISOString() });
});

// Use search routes
app.use('/api', searchRoutes);

// Use email routes
app.use('/api', emailRoutes);

// SPA - Serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Si ce n'est pas une route API, servir index.html (pour la SPA)
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../public/index.html'));
  } else {
    res.status(404).json({ error: 'Route non trouvée' });
  }
});

// Global error handler middleware (must be last)
app.use(errorHandler);

// Démarrer le serveur
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`Server started on port ${PORT}`);
    logger.info(`Environment: ${config.nodeEnv}`);
    logger.info(`URL: http://localhost:${PORT}`);
    
    // Log API configuration status
    if (config.googlePlacesApiKey) {
      logger.info(`Google Places API configured`);
    } else {
      logger.warn(`Google Places API not configured. Search will not work.`);
      logger.warn(`See GOOGLE_PLACES_API_SETUP.md for setup instructions`);
    }

    if (config.testMode) {
      logger.warn(`TEST MODE ENABLED - Emails will be sent to: ${config.testEmail}`);
    }

    if (config.mockEmailMode) {
      logger.warn(`MOCK EMAIL MODE ENABLED - Emails will be simulated`);
    }
  });
}

export default app;
