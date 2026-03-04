import 'dotenv/config.js';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware de sécurité
app.use(helmet());
app.use(cors());

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

// Routes API (à implémenter)
app.get('/api', (req, res) => {
  res.json({ message: 'API SourceBot v1.0.0', timestamp: new Date().toISOString() });
});

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
