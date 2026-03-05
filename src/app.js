import 'dotenv/config.js';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger.js';
import searchRoutes from './routes/searchRoutes.js';
import scrapingRoutes from './routes/scrapingRoutes.js';
import emailRoutes from './routes/emailRoutes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy (needed for Railway, Vercel, etc)
app.set('trust proxy', 1);

// Middleware de sécurité
app.use(helmet());

// CORS Configuration - Allow requests from Vercel frontend
const corsOptions = {
  origin: function (origin, callback) {
    // Allow all Vercel deployments, localhost, and production domain
    const allowedOrigins = [
      /^https:\/\/.*\.vercel\.app$/,
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
    ];

    // If no origin header (like in mobile apps), allow it
    if (!origin) return callback(null, true);

    // Check if origin matches any allowed pattern
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS not allowed for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
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

// Use scraping routes
app.use('/api', scrapingRoutes);

// Use email routes
app.use('/api', emailRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Error handler
app.use((err, req, res, next) => {
  logger.error('Erreur serveur:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erreur serveur interne',
    status: err.status || 500,
  });
});

// Démarrer le serveur
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    logger.info(`🚀 Serveur SourceBot démarré sur le port ${PORT}`);
    logger.info(`📝 Environnement: ${process.env.NODE_ENV}`);
    logger.info(`🌐 http://localhost:${PORT}`);
  });
}

export default app;
