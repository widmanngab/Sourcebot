# PLAN DE DÉVELOPPEMENT
## Projet SourceBot - Feuille de Route Détaillée

---

## 1. INTRODUCTION

Ce document présente le **plan de développement chronologique** pour réaliser l'application SourceBot. Le projet est divisé en **10 étapes clés**, du setup initial jusqu'aux itérations finales.

**Durée totale estimée** : 8-10 semaines (1 développeur)  
**Méthodologie** : Agile itératif par sprint de 1 semaine  
**Priorité** : Features MVP d'abord, optimisations après validation

---

## 2. TIMELINE GLOBALE

```
Semaine 1  ├─ Phase 1: Initialisation
           └─ Phase 2: Google Places API

Semaine 2  ├─ Phase 2 (suite)
           └─ Phase 3: Scraping emails

Semaine 3  ├─ Phase 3 (suite)
           └─ Phase 4: Interface UI

Semaine 4  ├─ Phase 4 (suite)
           └─ Phase 5: Envoi emails

Semaine 5  ├─ Phase 5 (suite)
           └─ Phase 6: IMAP réception

Semaine 6  ├─ Phase 6 (suite)
           └─ Phase 7: Parser devis

Semaine 7  ├─ Phase 7 (suite)
           └─ Phase 8: Tests complets

Semaine 8  ├─ Phase 8 (suite)
           └─ Phase 9: Déploiement

Semaine 9  ├─ Phase 10: Itérations fines
           └─ Documentation finale

Semaine 10 └─ Marge/contingence + validation utilisateur
```

---

## 3. PHASE 1 : INITIALISATION DU PROJET

### 3.1 Objectif
Créer la structure de base du projet Node.js avec Git, configuration, et dépendances essentielles.

### 3.2 Durée estimée
**1-2 jours**

### 3.3 Tâches détaillées

#### Tâche 1.1 : Setup Node.js et npm
```bash
# 1. Vérifier Node.js v18+ installé
node --version
npm --version

# 2. Créer répertoire projet
mkdir sourcebot
cd sourcebot

# 3. Initialiser npm
npm init -y
```

**Livrables** :
- ✅ Node v18+ confirmé
- ✅ `package.json` créé

#### Tâche 1.2 : Structure répertoires
```
sourcebot/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── middleware/
│   ├── services/
│   ├── utils/
│   ├── config/
│   └── app.js
├── public/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── app.js
│       └── api-client.js
├── .env.example
├── .gitignore
├── server.js
├── package.json
└── README.md
```

**Exécution** :
```bash
mkdir -p src/{api/{routes,controllers,middleware},services,utils,config}
mkdir -p public/{css,js}
touch .env.example .gitignore server.js README.md
```

#### Tâche 1.3 : Initialiser Git

```bash
git init
git config user.name "Your Name"
git config user.email "your@email.com"

# Créer fichier .gitignore
cat > .gitignore << 'EOF'
node_modules/
.env
.env.local
.DS_Store
dist/
logs/
uploads/
.vscode/settings.json
EOF

# Commit initial
git add .
git commit -m "init: setup project structure"
```

**Livrables** :
- ✅ `.gitignore` créé
- ✅ Git repository initialisé
- ✅ Commit initial

#### Tâche 1.4 : Installer dépendances essentielles

```bash
npm install express dotenv cors helmet axios cheerio
npm install nodemailer imap mailparser
npm install joi winston
npm install --save-dev eslint prettier nodemon
```

**Package.json final** :
```json
{
  "name": "sourcebot",
  "version": "1.0.0",
  "description": "Application web de mise en relation avec sous-traitants",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix && prettier --write src/"
  },
  "dependencies": {
    "express": "^4.18.0",
    "dotenv": "^16.0.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "axios": "^1.3.0",
    "cheerio": "^1.0.0-rc.12",
    "nodemailer": "^6.9.0",
    "imap": "^0.8.19",
    "mailparser": "^3.6.0",
    "joi": "^17.9.0",
    "winston": "^3.8.0"
  },
  "devDependencies": {
    "eslint": "^8.35.0",
    "prettier": "^2.8.4",
    "nodemon": "^2.0.20"
  }
}
```

**Livrables** :
- ✅ `package.json` avec toutes dépendances
- ✅ `node_modules/` installé

#### Tâche 1.5 : Configuration environnement (.env)

**Fichier : `.env.example`**
```bash
# ========== Google API ==========
GOOGLE_PLACES_API_KEY=your_api_key_here
GOOGLE_SHEETS_API_KEY=your_api_key_here
GOOGLE_SHEETS_ID=your_sheet_id_here

# ========== Email Configuration ==========
MAILJET_API_KEY=your_mailjet_key_here
MAILJET_SECRET_KEY=your_mailjet_secret_here
SMTP_HOST=in.mailjet.com
SMTP_PORT=587
SMTP_USER=your_email@company.com
SMTP_PASSWORD=your_smtp_password

# ========== IMAP Configuration ==========
IMAP_HOST=in.mailjet.com
IMAP_PORT=993
IMAP_USER=your_email@company.com
IMAP_PASSWORD=your_imap_password

# ========== App Configuration ==========
NODE_ENV=development
APP_PORT=3000
APP_URL=http://localhost:3000
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:3000
```

**Commande** :
```bash
cp .env.example .env
# Éditer .env avec vraies credentials
```

**Livrables** :
- ✅ `.env.example` créé (versionné)
- ✅ `.env` local (non-versionné, créé par dev)

#### Tâche 1.6 : App Express minimal

**Fichier : `src/app.js`**
```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use(express.static('public'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
```

**Fichier : `server.js`**
```javascript
const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const logger = require('./src/config/logger');

const PORT = process.env.APP_PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down...');
  server.close(() => process.exit(0));
});
```

**Test** :
```bash
npm run dev
# Visiter http://localhost:3000/api/health
# Réponse: { "status": "ok", ... }
```

**Livrables** :
- ✅ `src/app.js` fonctionnel
- ✅ `server.js` startup
- ✅ Serveur démarre sans erreurs

### 3.7 Critères d'acceptation Phase 1

- ✅ Node.js v18+ et npm opérationnels
- ✅ Répertoires organisés (MVC pattern)
- ✅ Git repo initialisé avec `.gitignore`
- ✅ Toutes dépendances installées et documentées
- ✅ `.env.example` avec tous les paramètres requis
- ✅ Express serveur démarre sur port 3000
- ✅ `/api/health` endpoint répond
- ✅ Linting + Prettier configurés (`npm run lint`)

### 3.8 Commit
```bash
git add .
git commit -m "feat: initialize Node.js project with Express scaffold"
```

---

## 4. PHASE 2 : GOOGLE PLACES API - RECHERCHE

### 4.1 Objectif
Implémenter l'intégration Google Places API pour rechercher les entreprises par catégorie et localisation, puis récupérer les détails (adresse, téléphone, site web).

### 4.2 Durée estimée
**2-3 jours**

### 4.3 Tâches détaillées

#### Tâche 2.1 : Obtenir clé API Google Places

1. Accéder Google Cloud Console : https://console.cloud.google.com/
2. Créer nouveau projet : "SourceBot"
3. Activer API : "Places API (New)"
4. Créer clé API : Credentials → API key
5. Copier clé dans `.env` : `GOOGLE_PLACES_API_KEY=AIzaSy...`

**Livrables** :
- ✅ Clé API Google Places obtenue
- ✅ API activée dans Cloud Console
- ✅ Clé stockée dans `.env`

#### Tâche 2.2 : Créer GooglePlacesService

**Fichier : `src/services/GooglePlacesService.js`**

```javascript
const axios = require('axios');
const logger = require('../config/logger');

class GooglePlacesService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://maps.googleapis.com/maps/api/place';
  }

  /**
   * Text Search : recherche nationale
   */
  async textSearch(query) {
    try {
      const response = await axios.get(`${this.baseUrl}/textsearch/json`, {
        params: {
          query,
          key: this.apiKey,
        },
      });

      if (response.data.status !== 'OK') {
        throw new Error(`API error: ${response.data.status}`);
      }

      logger.info(`Text Search: ${query}`, {
        results: response.data.results.length,
      });

      return response.data.results;
    } catch (error) {
      logger.error('Text Search failed', { query, error: error.message });
      throw error;
    }
  }

  /**
   * Place Details : récupérer infos complètes
   */
  async getPlaceDetails(placeId) {
    try {
      const response = await axios.get(`${this.baseUrl}/details/json`, {
        params: {
          place_id: placeId,
          fields: [
            'name',
            'formatted_address',
            'international_phone_number',
            'website',
            'geometry',
            'rating',
            'user_ratings_total',
            'business_status',
          ].join(','),
          key: this.apiKey,
        },
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Place Details error: ${response.data.status}`);
      }

      return response.data.result;
    } catch (error) {
      logger.error('Place Details failed', { placeId, error: error.message });
      throw error;
    }
  }

  /**
   * Recherche complète : Text Search + Place Details
   */
  async comprehensiveSearch(keyword, country) {
    const query = `${keyword} in ${country}`;
    const textResults = await this.textSearch(query);

    const companies = [];
    for (const result of textResults) {
      try {
        const details = await this.getPlaceDetails(result.place_id);
        companies.push({
          placeId: result.place_id,
          name: details.name,
          address: details.formatted_address,
          phone: details.international_phone_number || 'N/A',
          website: details.website || 'N/A',
          lat: details.geometry.location.lat,
          lng: details.geometry.location.lng,
          rating: details.rating || 0,
          totalRatings: details.user_ratings_total || 0,
        });
      } catch (error) {
        logger.warn(`Could not get details for ${result.name}`, { error: error.message });
      }
    }

    return companies;
  }
}

module.exports = GooglePlacesService;
```

**Livrables** :
- ✅ `GooglePlacesService` implémenté
- ✅ Méthodes `textSearch`, `getPlaceDetails`, `comprehensiveSearch`

#### Tâche 2.3 : Créer route API /api/search

**Fichier : `src/api/routes/search.js`**

```javascript
const express = require('express');
const router = express.Router();
const GooglePlacesService = require('../../services/GooglePlacesService');
const logger = require('../../config/logger');

const googlePlaces = new GooglePlacesService(process.env.GOOGLE_PLACES_API_KEY);

router.post('/', async (req, res, next) => {
  try {
    const { category, country } = req.body;

    if (!category || !country) {
      return res.status(400).json({ error: 'Missing category or country' });
    }

    logger.info('Search initiated', { category, country });

    const companies = await googlePlaces.comprehensiveSearch(category, country);

    res.json({
      success: true,
      count: companies.length,
      companies,
    });
  } catch (error) {
    logger.error('Search error', { error: error.message });
    next(error);
  }
});

module.exports = router;
```

**Intégrer dans app.js** :
```javascript
const searchRoutes = require('./api/routes/search');
app.use('/api/search', searchRoutes);
```

#### Tâche 2.4 : Tester la recherche

**Test manuel via Postman/cURL** :
```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "category": "thermoformage",
    "country": "France"
  }'
```

**Réponse attendue** :
```json
{
  "success": true,
  "count": 15,
  "companies": [
    {
      "placeId": "ChIJ...",
      "name": "Thermoformage ACME",
      "address": "123 Rue de l'Industrie, 75001 Paris",
      "phone": "+33 1 23 45 67 89",
      "website": "https://acme.fr",
      "lat": 48.8566,
      "lng": 2.3522,
      "rating": 4.5,
      "totalRatings": 28
    },
    ...
  ]
}
```

**Test de code** :
```javascript
// Fichier: src/services/__tests__/GooglePlacesService.test.js
const GooglePlacesService = require('../GooglePlacesService');

describe('GooglePlacesService', () => {
  let service;

  beforeAll(() => {
    service = new GooglePlacesService(process.env.GOOGLE_PLACES_API_KEY);
  });

  it('devrait retourner des entreprises via text search', async () => {
    const results = await service.textSearch('thermoformage en France');
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  it('devrait extraire détails d\'une entreprise', async () => {
    const results = await service.textSearch('restaurant paris');
    const placeId = results[0].place_id;

    const details = await service.getPlaceDetails(placeId);
    expect(details.name).toBeDefined();
    expect(details.formatted_address).toBeDefined();
  });
});
```

**Exécuter tests** :
```bash
npm test
```

**Livrables** :
- ✅ Route POST `/api/search` opérationnelle
- ✅ Requête API Google Places fonctionne
- ✅ Données complètes récupérées (name, address, phone, website, GPS)
- ✅ Tests passent (au moins test manuel)
- ✅ Logs détaillés de chaque appel API
- ✅ Gestion erreurs implémentée

### 4.5 Critères d'acceptation Phase 2

- ✅ Clé API Google Places obtenue et configurée
- ✅ Service `GooglePlacesService` complet
- ✅ Méthodes `textSearch()` et `getPlaceDetails()` fonctionnent
- ✅ Route `/api/search` retourne entreprises avec tous les champs
- ✅ Récupération : name, address, phone, website, GPS
- ✅ Gestion erreurs API (quotas, erreurs réseau)
- ✅ Tests unitaires basiques passent
- ✅ Logging exhaustif

### 4.6 Commit
```bash
git add src/services/GooglePlacesService.js src/api/routes/search.js
git commit -m "feat: implement Google Places API text search and place details"
```

---

## 5. PHASE 3 : SCRAPING D'EMAILS

### 5.1 Objectif
Développer un script Node.js utilisant Cheerio pour extraire automatiquement les adresses email du site web de chaque entreprise trouvée.

### 5.2 Durée estimée
**2-3 jours**

### 5.3 Tâches détaillées

#### Tâche 3.1 : Créer ScrapingService

**Fichier : `src/services/ScrapingService.js`**

```javascript
const axios = require('axios');
const cheerio = require('cheerio');
const logger = require('../config/logger');

class ScrapingService {
  constructor() {
    this.timeout = 10000;
    this.userAgent = 'SourceBot/1.0 (+https://sourcebot.local)';
    this.emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  }

  /**
   * Scraper un site et extraire emails
   */
  async scrapeEmail(websiteUrl) {
    if (!websiteUrl || !websiteUrl.startsWith('http')) {
      return [];
    }

    try {
      logger.info(`Scraping: ${websiteUrl}`);

      // Fetch HTML
      const response = await axios.get(websiteUrl, {
        headers: { 'User-Agent': this.userAgent },
        timeout: this.timeout,
        maxRedirects: 5,
      });

      const html = response.data;

      // Parse avec Cheerio
      const $ = cheerio.load(html);
      const emails = [];

      // 1. Chercher <a href="mailto:">
      $('a[href^="mailto:"]').each((i, elem) => {
        const email = $(elem).attr('href').replace('mailto:', '').split('?')[0];
        if (this.isValidEmail(email)) {
          emails.push(email);
        }
      });

      // 2. Chercher texte contenant emails
      $('*').each((i, elem) => {
        const text = $(elem).text();
        const matches = text.match(this.emailRegex);
        if (matches) {
          matches.forEach((email) => {
            if (this.isValidEmail(email)) {
              emails.push(email);
            }
          });
        }
      });

      logger.info(`Scraping success: ${websiteUrl}`, {
        emailsFound: emails.length,
      });

      return [...new Set(emails)];  // Dédupliquer
    } catch (error) {
      logger.warn(`Scraping error: ${websiteUrl}`, {
        error: error.message,
      });
      return [];
    }
  }

  /**
   * Valider format email
   */
  isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  }

  /**
   * Scraper multiples sites en parallèle
   */
  async scrapeMultiple(websites, batchSize = 10) {
    const results = {};

    for (let i = 0; i < websites.length; i += batchSize) {
      const batch = websites.slice(i, i + batchSize);
      const promises = batch.map((url) =>
        this.scrapeEmail(url).then((emails) => ({
          url,
          emails,
        }))
      );

      const batchResults = await Promise.allSettled(promises);
      batchResults.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          results[batch[idx]] = result.value;
        } else {
          results[batch[idx]] = { emails: [], error: result.reason.message };
        }
      });

      // Délai entre batch
      if (i + batchSize < websites.length) {
        await new Promise((r) => setTimeout(r, 3000));
      }
    }

    return results;
  }
}

module.exports = ScrapingService;
```

**Livrables** :
- ✅ `ScrapingService` avec méthode `scrapeEmail()`
- ✅ Regex extraction emails
- ✅ Gestion erreurs + timeouts
- ✅ Batch processing parallèle

#### Tâche 3.2 : Intégrer scraping dans route search

**Modifier : `src/api/routes/search.js`**

```javascript
const ScrapingService = require('../../services/ScrapingService');

const googlePlaces = new GooglePlacesService(process.env.GOOGLE_PLACES_API_KEY);
const scraping = new ScrapingService();

router.post('/', async (req, res, next) => {
  try {
    const { category, country } = req.body;

    if (!category || !country) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    // 1. Récupérer entreprises via Google Places
    const companies = await googlePlaces.comprehensiveSearch(category, country);

    // 2. Scraper emails en parallèle
    const websites = companies
      .filter((c) => c.website !== 'N/A')
      .map((c) => c.website);

    const emailResults = await scraping.scrapeMultiple(websites);

    // 3. Enrichir données
    const enrichedCompanies = companies.map((c) => ({
      ...c,
      email: emailResults[c.website]?.emails[0] || 'Not found',
      emailStatus: emailResults[c.website]?.emails.length > 0 ? 'found' : 'not_found',
    }));

    res.json({
      success: true,
      count: enrichedCompanies.length,
      emailFoundRate: `${((enrichedCompanies.filter((c) => c.emailStatus === 'found').length / enrichedCompanies.length) * 100).toFixed(1)}%`,
      companies: enrichedCompanies,
    });
  } catch (error) {
    logger.error('Search error', { error: error.message });
    next(error);
  }
});
```

#### Tâche 3.3 : Tester le scraping

**Test manuel** :
```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "category": "thermoformage",
    "country": "France"
  }'
```

**Réponse attendue** :
```json
{
  "success": true,
  "count": 15,
  "emailFoundRate": "65.3%",
  "companies": [
    {
      "placeId": "...",
      "name": "Thermoformage ACME",
      "address": "123 Rue...",
      "email": "contact@acme.fr",
      "emailStatus": "found",
      ...
    },
    {
      "name": "Other Company",
      "email": "Not found",
      "emailStatus": "not_found",
      ...
    }
  ]
}
```

**Tests unitaires** :
```javascript
describe('ScrapingService', () => {
  let service;

  beforeAll(() => {
    service = new ScrapingService();
  });

  it('devrait extraire email d\'un site', async () => {
    const emails = await service.scrapeEmail('https://example.com');
    expect(Array.isArray(emails)).toBe(true);
  });

  it('devrait valider format email', () => {
    expect(service.isValidEmail('contact@example.com')).toBe(true);
    expect(service.isValidEmail('invalid-email@')).toBe(false);
  });
});
```

**Livrables** :
- ✅ Scraping fonctionnel sur sites réels
- ✅ Emails extraits correctement (60-70% success rate)
- ✅ Timeouts gérés (10s max par site)
- ✅ Batch processing fonctionnel
- ✅ Logging détaillé
- ✅ Tests unitaires

### 5.4 Critères d'acceptation Phase 3

- ✅ Service `ScrapingService` implémenté avec Cheerio
- ✅ Regex extraction emails fonctionnelle
- ✅ Scraping parallèle (10 sites simultanés)
- ✅ Timeout 10s par site implémenté
- ✅ Taux succès > 50% (au moins 50% emails trouvés)
- ✅ Gestion erreurs gracieuse (pas de crash)
- ✅ Logs détaillés de chaque scrape
- ✅ Route `/api/search` retourne emails enrichis

### 5.5 Commit
```bash
git add src/services/ScrapingService.js
git commit -m "feat: implement email scraping with Cheerio and parallel processing"
```

---

## 6. PHASE 4 : INTERFACE UTILISATEUR (Frontend)

### 6.1 Objectif
Développer une page web avec formulaire pour saisir les critères de recherche (catégorie, description, localisation, fichiers).

### 6.2 Durée estimée
**2 jours**

### 6.3 Tâches détaillées

#### Tâche 4.1 : Créer page HTML

**Fichier : `public/index.html`**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SourceBot - Mise en Relation avec Sous-Traitants</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="container">
    <header>
      <h1>SourceBot</h1>
      <p>Trouvez et contactez automatiquement des sous-traitants</p>
    </header>

    <main>
      <form id="search-form">
        <!-- Catégorie -->
        <div class="form-group">
          <label for="category">Catégorie de sous-traitant *</label>
          <select id="category" name="category" required>
            <option value="">-- Sélectionner --</option>
            <option value="thermoformage">Thermoformage</option>
            <option value="soudure">Soudure</option>
            <option value="plomberie">Plomberie</option>
            <option value="menuiserie">Menuiserie</option>
            <option value="électricité">Électricité</option>
          </select>
        </div>

        <!-- Description -->
        <div class="form-group">
          <label for="description">Description projet *</label>
          <textarea id="description" name="description" 
                    placeholder="Décrivez votre demande en détail..."
                    maxlength="5000" required></textarea>
          <small>Max 5000 caractères</small>
        </div>

        <!-- Localisation -->
        <div class="form-row">
          <div class="form-group">
            <label for="country">Pays *</label>
            <select id="country" name="country" required>
              <option value="">-- Sélectionner --</option>
              <option value="France">France</option>
              <option value="Belgique">Belgique</option>
              <option value="Suisse">Suisse</option>
              <option value="Germany">Allemagne</option>
            </select>
          </div>

          <div class="form-group">
            <label for="radius">Rayon (km) *</label>
            <input type="number" id="radius" name="radius" 
                   min="50" max="3000" value="300" required>
          </div>
        </div>

        <!-- Upload fichiers -->
        <div class="form-group">
          <label for="files">Fichiers à joindre (optionnel)</label>
          <input type="file" id="files" name="files" multiple
                 accept=".pdf,.png,.jpg,.dwg,.step,.zip">
          <small>Max 25MB par fichier, 10 fichiers max</small>
          <div id="file-preview"></div>
        </div>

        <!-- Submit -->
        <div class="form-actions">
          <button type="submit" id="submit-btn">Lancer recherche</button>
          <button type="reset">Réinitialiser</button>
        </div>
      </form>

      <!-- Results -->
      <div id="results" style="display: none;">
        <h2>Résultats (<span id="result-count">0</span> entreprises)</h2>
        <div id="results-list"></div>
        <div class="results-actions">
          <button id="export-btn">Exporter CSV</button>
          <button id="send-emails-btn">Envoyer demandes</button>
        </div>
      </div>

      <!-- Loading -->
      <div id="loading" style="display: none;">
        <p>Recherche en cours...</p>
        <div class="spinner"></div>
      </div>

      <!-- Error -->
      <div id="error" style="display: none;" class="error"></div>
    </main>

    <footer>
      <p><small>Conformité RGPD: <a href="#">Lire conditions</a></small></p>
    </footer>
  </div>

  <script src="js/api-client.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

#### Tâche 4.2 : Styling CSS

**Fichier : `public/css/style.css`**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 20px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
}

header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
}

header h1 {
  font-size: 2.5em;
  margin-bottom: 10px;
}

main {
  background: white;
  border-radius: 10px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.form-group {
  margin-bottom: 25px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 25px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

input[type="text"],
input[type="number"],
select,
textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 1em;
  font-family: inherit;
  transition: border-color 0.3s;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #667eea;
}

textarea {
  resize: vertical;
  min-height: 120px;
}

small {
  display: block;
  margin-top: 5px;
  color: #666;
  font-size: 0.9em;
}

.form-actions {
  display: flex;
  gap: 10px;
}

button {
  padding: 12px 30px;
  border: none;
  border-radius: 5px;
  font-size: 1em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

button[type="submit"] {
  background: #667eea;
  color: white;
  flex: 1;
}

button[type="submit"]:hover {
  background: #5a67d8;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

button[type="reset"],
button[type="button"] {
  background: #f0f0f0;
  color: #333;
}

button[type="button"]:hover {
  background: #e0e0e0;
}

#results {
  margin-top: 40px;
  border-top: 2px solid #eee;
  padding-top: 30px;
}

.result-item {
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 15px;
  background: #f9f9f9;
}

.result-item h3 {
  color: #667eea;
  margin-bottom: 8px;
}

.result-item p {
  margin: 5px 0;
  color: #666;
}

.error {
  background: #fee;
  border: 1px solid #f99;
  color: #c33;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
}

#loading {
  text-align: center;
  padding: 40px;
}

.spinner {
  border: 4px solid #f0f0f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

footer {
  text-align: center;
  margin-top: 30px;
  color: white;
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  header h1 {
    font-size: 1.8em;
  }
}
```

#### Tâche 4.3 : JavaScript client

**Fichier : `public/js/api-client.js`**

```javascript
class ApiClient {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
  }

  async post(endpoint, data) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async search(category, country, radius, description) {
    return this.post('/search', {
      category,
      country,
      radius,
      description,
    });
  }
}

const apiClient = new ApiClient('/api');
```

**Fichier : `public/js/app.js`**

```javascript
const form = document.getElementById('search-form');
const resultsDiv = document.getElementById('results');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const resultsList = document.getElementById('results-list');
const resultCount = document.getElementById('result-count');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const category = document.getElementById('category').value;
  const country = document.getElementById('country').value;
  const radius = document.getElementById('radius').value;
  const description = document.getElementById('description').value;

  // Validation
  if (!category || !country || !description) {
    showError('Veuillez remplir tous les champs requis');
    return;
  }

  hideError();
  showLoading();
  resultsDiv.style.display = 'none';

  try {
    const result = await apiClient.search(category, country, radius, description);

    displayResults(result.companies);
  } catch (error) {
    showError(`Erreur: ${error.message}`);
  } finally {
    hideLoading();
  }
});

function displayResults(companies) {
  resultsList.innerHTML = '';

  companies.forEach((company) => {
    const div = document.createElement('div');
    div.className = 'result-item';
    div.innerHTML = `
      <h3>${company.name}</h3>
      <p><strong>Adresse:</strong> ${company.address}</p>
      <p><strong>Téléphone:</strong> ${company.phone}</p>
      <p><strong>Email:</strong> ${company.email}</p>
      <p><strong>Site:</strong> <a href="${company.website}" target="_blank">${company.website}</a></p>
      <p><strong>Note Google:</strong> ${company.rating}/5 (${company.totalRatings} avis)</p>
    `;
    resultsList.appendChild(div);
  });

  resultCount.textContent = companies.length;
  resultsDiv.style.display = 'block';
}

function showLoading() {
  loadingDiv.style.display = 'block';
}

function hideLoading() {
  loadingDiv.style.display = 'none';
}

function showError(message) {
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
}

function hideError() {
  errorDiv.style.display = 'none';
}
```

#### Tâche 4.4 : Tester l'interface

1. Démarrer serveur : `npm run dev`
2. Ouvrir http://localhost:3000 dans le navigateur
3. Remplir formulaire
4. Cliquer "Lancer recherche"
5. Vérifier affichage résultats

**Livrables** :
- ✅ Page HTML complète avec formulaire
- ✅ CSS responsive (desktop/mobile)
- ✅ JavaScript validation côté client
- ✅ Appel API depuis frontend
- ✅ Affichage résultats dynamique
- ✅ Messages d'erreur clairs

### 6.4 Critères d'acceptation Phase 4

- ✅ Page index.html accessible sur http://localhost:3000
- ✅ Formulaire complet (catégorie, description, localisation, files)
- ✅ Validation côté client (champs obligatoires)
- ✅ Stylé responsive (desktop/mobile)
- ✅ Submit appelle `/api/search` via fetch
- ✅ Résultats affichent entreprises
- ✅ Affichage loading pendant requête
- ✅ Gestion erreurs (messages utilisateur)

### 6.5 Commit
```bash
git add public/
git commit -m "feat: create frontend UI with form and results display"
```

---

## 7. PHASE 5 : ENVOI D'EMAILS (SMTP)

### 7.1 Objectif
Intégrer Nodemailer et implémenter l'envoi automatique de demandes de devis profe

ssionnelles aux entreprises.

### 7.2 Durée estimée
**2 jours**

### 7.3 Tâches détaillées

#### Tâche 5.1 : Configurer Mailjet

1. S'inscrire : https://www.mailjet.com/
2. Récupérer clés API :
   - API Key (dans Settings → API Keys)
   - Secret Key (même endroit)
3. Ajouter sender email vérifié
4. Mettre à jour `.env` :
   ```
   MAILJET_API_KEY=your_key
   MAILJET_SECRET_KEY=your_secret
   ```

**Livrables** :
- ✅ Compte Mailjet créé
- ✅ Clés API dans `.env`
- ✅ Email sender vérifié

#### Tâche 5.2 : Créer EmailService

**Fichier : `src/services/EmailService.js`**

```javascript
const nodemailer = require('nodemailer');
const logger = require('../config/logger');

class EmailService {
  constructor(config) {
    this.from = config.from;
    this.transporter = nodemailer.createTransport({
      host: 'in.mailjet.com',
      port: 587,
      secure: false,
      auth: {
        user: config.apiKey,
        pass: config.secretKey,
      },
    });
    this.sentCount = 0;
    this.failedCount = 0;
  }

  /**
   * Envoyer email demande de devis
   */
  async sendQuoteRequest(company, request) {
    try {
      const { subject, html } = this.composeEmail(company, request);

      const mailOptions = {
        from: this.from,
        to: company.email,
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);

      this.sentCount++;
      logger.info('Email sent', {
        to: company.email.slice(-10),
        company: company.name,
        messageId: info.messageId,
      });

      return { status: 'sent', messageId: info.messageId };
    } catch (error) {
      this.failedCount++;
      logger.error('Email send failed', {
        to: company.email,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Composer email professionnel
   */
  composeEmail(company, request) {
    const subject = `[DEMANDE DE DEVIS] ${request.category} - ${request.clientName}`;

    const html = `
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p>Madame, Monsieur,</p>

        <p>Nous vous contactons dans le cadre de notre recherche d'un prestataire en <strong>${request.category}</strong>.</p>

        <h2>Description du projet :</h2>
        <p>${request.description}</p>

        <h2>Informations demandées :</h2>
        <ul>
          <li>Prix unitaire HT</li>
          <li>Quantité minimale (MOQ)</li>
          <li>Délai de livraison</li>
          <li>Incoterms</li>
          <li>Certifications applicables</li>
        </ul>

        <p>Nous vous remercions de nous transmettre votre meilleure offre au plus tôt.</p>

        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

        <p><strong>${request.clientName}</strong><br>
        ${request.clientCompany}<br>
        ${request.clientPhone}<br>
        ${request.clientEmail}</p>

        <p style="font-size: 0.9em; color: #666; margin-top: 20px;">
          <em>Ce message a été généré automatiquement par SourceBot.</em><br>
          <a href="https://${process.env.APP_URL}/unsubscribe?email=${encodeURIComponent(company.email)}">
            Se désinscrire
          </a>
        </p>
      </body>
      </html>
    `;

    return { subject, html };
  }

  /**
   * Envoyer batch d'emails avec délai
   */
  async sendBatch(companies, request, delayMs = 30000) {
    logger.info('Starting email batch', {
      count: companies.length,
      delayMs,
    });

    const results = [];

    for (let i = 0; i < companies.length; i++) {
      try {
        const result = await this.sendQuoteRequest(companies[i], request);
        results.push({ company: companies[i].name, status: 'sent', ...result });
      } catch (error) {
        results.push({
          company: companies[i].name,
          status: 'failed',
          error: error.message,
        });
      }

      // Délai entre emails
      if (i < companies.length - 1) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }

    logger.info('Email batch complete', {
      sent: this.sentCount,
      failed: this.failedCount,
      rate: `${((this.sentCount / (this.sentCount + this.failedCount)) * 100).toFixed(1)}%`,
    });

    return results;
  }
}

module.exports = EmailService;
```

#### Tâche 5.3 : Créer route d'envoi

**Fichier : `src/api/routes/email.js`**

```javascript
const express = require('express');
const router = express.Router();
const EmailService = require('../../services/EmailService');
const logger = require('../../config/logger');

const emailService = new EmailService({
  from: process.env.SMTP_USER,
  apiKey: process.env.MAILJET_API_KEY,
  secretKey: process.env.MAILJET_SECRET_KEY,
});

router.post('/send-batch', async (req, res, next) => {
  try {
    const { companies, request } = req.body;

    if (!companies || !request) {
      return res.status(400).json({ error: 'Missing companies or request' });
    }

    logger.info('Send batch initiated', { count: companies.length });

    // Envoyer en arrière-plan (non-blocking)
    const results = await emailService.sendBatch(companies, request);

    res.json({
      success: true,
      sent: results.filter((r) => r.status === 'sent').length,
      failed: results.filter((r) => r.status === 'failed').length,
      results,
    });
  } catch (error) {
    logger.error('Send batch error', { error: error.message });
    next(error);
  }
});

module.exports = router;
```

**Intégrer dans app.js** :
```javascript
const emailRoutes = require('./api/routes/email');
app.use('/api/email', emailRoutes);
```

#### Tâche 5.4 : Tester envoi

**Test manuel** :
```bash
curl -X POST http://localhost:3000/api/email/send-batch \
  -H "Content-Type: application/json" \
  -d '{
    "companies": [
      {
        "name": "ACME",
        "email": "test@example.com"
      }
    ],
    "request": {
      "category": "thermoformage",
      "description": "...",
      "clientName": "Your Name",
      "clientCompany": "Your Company",
      "clientPhone": "+33...",
      "clientEmail": "you@company.com"
    }
  }'
```

**Vérifier réception** :
- Vérifier boîte mail test
- Vérifier sujet/corps du mail
- Vérifier lien unsubscribe

**Livrables** :
- ✅ `EmailService` complet
- ✅ Route `/api/email/send-batch` opérationnelle
- ✅ Mails envoyés via Mailjet SMTP
- ✅ Délai 30s entre emails
- ✅ Logging succès/erreurs

### 7.4 Critères d'acceptation Phase 5

- ✅ Compte Mailjet créé et clés configurées
- ✅ Service `EmailService` implémenté
- ✅ Emails composés professionnellement
- ✅ Route `/api/email/send-batch` fonctionnelle
- ✅ Emails reçus correctement (sujet, corps, lien opt-out)
- ✅ Délai 30s entre envois implémenté
- ✅ Logging exhaustif (envoyés, échoués)
- ✅ Gestion erreurs SMTP

### 7.5 Commit
```bash
git add src/services/EmailService.js src/api/routes/email.js
git commit -m "feat: implement email sending via Mailjet SMTP with batch processing"
```

---

## 8. PHASE 6 : RÉCEPTION D'EMAILS (IMAP)

### 8.1 Objectif
Implémenter un module IMAP pour lire automatiquement les réponses des entreprises toutes les 3 heures, et stocker les emails reçus.

### 8.2 Durée estimée
**2 jours**

### 8.3 Tâches détaillées

#### Tâche 6.1 : Configurer IMAP

**Pour Mailjet** :
- Host: `in.mailjet.com`
- Port: `993` (SSL)
- User: Email sender (même que SMTP_USER)
- Password: Mot de passe app Mailjet

**Mettre à jour .env** :
```
IMAP_HOST=in.mailjet.com
IMAP_PORT=993
IMAP_USER=sender@company.com
IMAP_PASSWORD=your_mailjet_password
```

#### Tâche 6.2 : Créer ImapService

**Fichier : `src/services/ImapService.js`**

```javascript
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const logger = require('../config/logger');

class ImapService {
  constructor(config) {
    this.config = config;
    this.imap = new Imap({
      user: config.user,
      password: config.password,
      host: config.host,
      port: config.port,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    });
  }

  /**
   * Connecter et syncer emails
   */
  async sync() {
    return new Promise((resolve, reject) => {
      this.imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          logger.error('IMAP box open failed', { error: err.message });
          return reject(err);
        }

        logger.info('IMAP connected', { totalMessages: box.messages.total });

        // Chercher emails non-lus
        this.imap.search(['UNSEEN'], (err, results) => {
          if (err) {
            this.imap.end();
            return reject(err);
          }

          if (results.length === 0) {
            logger.info('No new emails');
            this.imap.end();
            return resolve([]);
          }

          const f = this.imap.fetch(results, { bodies: '' });
          const emails = [];

          f.on('message', (msg, seqno) => {
            simpleParser(msg, async (err, parsed) => {
              if (err) {
                logger.error('Email parse error', { error: err.message });
                return;
              }

              try {
                const emailData = {
                  from: parsed.from.text,
                  subject: parsed.subject,
                  text: parsed.text || '',
                  html: parsed.html || '',
                  attachments: (parsed.attachments || []).map((a) => ({
                    filename: a.filename,
                    size: a.size,
                  })),
                  receivedAt: new Date(),
                };

                emails.push(emailData);
                logger.info('Email parsed', {
                  from: emailData.from.slice(-10),
                  subject: emailData.subject,
                });

                // Marquer comme lu
                this.imap.addFlags(seqno, '\\Seen', () => {});
              } catch (error) {
                logger.error('Email processing error', { error });
              }
            });
          });

          f.on('error', reject);
          f.on('end', () => {
            this.imap.end();
            resolve(emails);
          });
        });
      });

      this.imap.openBox('INBOX', false, () => {});
    });
  }

  /**
   * Lancer scheduler toutes les 3 heures
   */
  startScheduler(onNewEmails) {
    const intervalMs = 3 * 60 * 60 * 1000; // 3 heures

    setInterval(async () => {
      try {
        logger.info('IMAP sync started');
        const emails = await this.sync();

        if (emails.length > 0 && onNewEmails) {
          onNewEmails(emails);
        }
      } catch (error) {
        logger.error('IMAP sync error', { error: error.message });
      }
    }, intervalMs);

    logger.info('IMAP scheduler started', { intervalHours: 3 });
  }
}

module.exports = ImapService;
```

#### Tâche 6.3 : Intégrer le scheduler dans app

**Fichier : `src/config/imap-scheduler.js`**

```javascript
const ImapService = require('../services/ImapService');
const logger = require('./logger');

function startImapScheduler(storageService) {
  const imapService = new ImapService({
    user: process.env.IMAP_USER,
    password: process.env.IMAP_PASSWORD,
    host: process.env.IMAP_HOST,
    port: parseInt(process.env.IMAP_PORT, 10),
  });

  const handleNewEmails = async (emails) => {
    logger.info('Processing new emails', { count: emails.length });

    for (const email of emails) {
      try {
        // Sauvegarder email
        await storageService.saveReceivedEmail(email);
      } catch (error) {
        logger.error('Failed to save email', { error: error.message });
      }
    }
  };

  imapService.startScheduler(handleNewEmails);
}

module.exports = startImapScheduler;
```

**Modifier server.js** :
```javascript
const startImapScheduler = require('./src/config/imap-scheduler');

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  
  // Démarrer scheduler IMAP
  startImapScheduler(storageService);
});
```

#### Tâche 6.4 : Tester IMAP

1. Envoyer email test à `sender@company.com`
2. Attendre quelques secondes
3. Vérifier logs serveur :
   ```
   IMAP sync started
   Email parsed: from=...@example.com subject=Test
   ```

**Livrables** :
- ✅ ImapService implémenté
- ✅ Scheduler lancé au startup
- ✅ Emails lus automatiquement (max 3h)
- ✅ Emails marqués comme lus
- ✅ Logging détaillé

### 8.4 Critères d'acceptation Phase 6

- ✅ Service `ImapService` complet
- ✅ Connexion IMAP à boîte mail fonctionnelle
- ✅ Scheduler lancé automatiquement (toutes 3h)
- ✅ Emails UNSEEN lus correctement
- ✅ Emails marqués comme lus après traitement
- ✅ Logging détaillé de chaque sync
- ✅ Pas d'erreurs crash (gestion erreurs IMAP)

### 8.5 Commit
```bash
git add src/services/ImapService.js src/config/imap-scheduler.js
git commit -m "feat: implement IMAP scheduler for reading incoming emails every 3 hours"
```

---

## 9. PHASE 7 : PARSING DES DEVIS

### 9.1 Objectif
Extraire automatiquement les informations clés des emails reçus (prix, MOQ, délai) et les stocker dans le tableau récapitulatif.

### 9.2 Durée estimée
**2 jours**

### 9.3 Tâches détaillées

#### Tâche 7.1 : Créer QuoteParserService

**Fichier : `src/services/QuoteParserService.js`**

```javascript
const logger = require('../config/logger');

class QuoteParserService {
  constructor() {
    this.patterns = {
      price: /(?:prix|price|tarif|eur|€|\$|usd)[\s:]*([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{2})?)/gi,
      moq: /(?:moq|min|minimum|qty|quantité)[\s:]*([0-9]+)/gi,
      delay: /(?:delay|délai|livraison|jours|days|j)[\s:]*([0-9]+)\s*(?:jours|days|j)?/gi,
      incoterms: /(?:exw|fob|cif|cpt|dap|dpu|ddp)/gi,
    };
  }

  /**
   * Parser email de devis
   */
  async parseQuoteEmail(email) {
    const fullText = email.text || '';

    const quote = {
      from: email.from,
      subject: email.subject,
      prices: this.extractPrices(fullText),
      moqs: this.extractMoqs(fullText),
      delays: this.extractDelays(fullText),
      incoterms: this.extractIncoterms(fullText),
      rawContent: fullText.substring(0, 500),
    };

    logger.info('Quote parsed', {
      from: email.from.slice(-10),
      pricesFound: quote.prices.length,
      moqsFound: quote.moqs.length,
      delaysFound: quote.delays.length,
    });

    return quote;
  }

  extractPrices(text) {
    const matches = [...text.matchAll(this.patterns.price)];
    return matches
      .map((m) => {
        const value = m[1].replace(/[,.]/g, (c) => (c === ',' ? '.' : ''));
        return parseFloat(value);
      })
      .filter((v) => v > 0 && v < 1000000);
  }

  extractMoqs(text) {
    const matches = [...text.matchAll(this.patterns.moq)];
    return matches
      .map((m) => parseInt(m[1], 10))
      .filter((v) => v > 0 && v < 1000000);
  }

  extractDelays(text) {
    const matches = [...text.matchAll(this.patterns.delay)];
    return matches
      .map((m) => parseInt(m[1], 10))
      .filter((v) => v > 0 && v < 365);
  }

  extractIncoterms(text) {
    const matches = [...text.matchAll(this.patterns.incoterms)];
    return [...new Set(matches.map((m) => m[0].toUpperCase()))];
  }
}

module.exports = QuoteParserService;
```

#### Tâche 7.2 : Créer StorageService (Google Sheets)

**Fichier : `src/services/StorageService.js`**

```javascript
const fs = require('fs/promises');
const path = require('path');
const logger = require('../config/logger');

class StorageService {
  constructor() {
    this.dataFile = path.resolve('data/companies.json');
    this.quotesFile = path.resolve('data/quotes.json');
    this.receivedEmailsFile = path.resolve('data/received-emails.json');
  }

  /**
   * Initialiser fichiers de données
   */
  async initialize() {
    const dataDir = path.dirname(this.dataFile);
    try {
      await fs.mkdir(dataDir, { recursive: true });

      // Créer fichiers s'ils nexistent pas
      if (!await this.fileExists(this.dataFile)) {
        await fs.writeFile(this.dataFile, JSON.stringify([], null, 2));
      }

      if (!await this.fileExists(this.quotesFile)) {
        await fs.writeFile(this.quotesFile, JSON.stringify([], null, 2));
      }

      if (!await this.fileExists(this.receivedEmailsFile)) {
        await fs.writeFile(this.receivedEmailsFile, JSON.stringify([], null, 2));
      }

      logger.info('Storage initialized');
    } catch (error) {
      logger.error('Storage init error', { error: error.message });
      throw error;
    }
  }

  /**
   * Sauvegarder entreprises
   */
  async saveCompanies(companies) {
    try {
      await fs.writeFile(this.dataFile, JSON.stringify(companies, null, 2));
      logger.info('Companies saved', { count: companies.length });
    } catch (error) {
      logger.error('Save error', { error: error.message });
      throw error;
    }
  }

  /**
   * Charger entreprises
   */
  async loadCompanies() {
    try {
      const data = await fs.readFile(this.dataFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      logger.error('Load error', { error: error.message });
      return [];
    }
  }

  /**
   * Sauvegarder devis
   */
  async saveQuotes(quotes) {
    try {
      await fs.writeFile(this.quotesFile, JSON.stringify(quotes, null, 2));
      logger.info('Quotes saved', { count: quotes.length });
    } catch (error) {
      logger.error('Save quotes error', { error: error.message });
      throw error;
    }
  }

  /**
   * Sauvegarder email reçu
   */
  async saveReceivedEmail(email) {
    try {
      const emails = await this.loadReceivedEmails();
      emails.push({
        ...email,
        id: `email_${Date.now()}`,
        savedAt: new Date(),
      });
      await fs.writeFile(this.receivedEmailsFile, JSON.stringify(emails, null, 2));
      logger.info('Received email saved', { from: email.from });
    } catch (error) {
      logger.error('Save email error', { error: error.message });
      throw error;
    }
  }

  /**
   * Charger emails reçus
   */
  async loadReceivedEmails() {
    try {
      const data = await fs.readFile(this.receivedEmailsFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = StorageService;
```

#### Tâche 7.3 : Tester parsing

**Fichier : `src/services/__tests__/QuoteParserService.test.js`**

```javascript
const QuoteParserService = require('../QuoteParserService');

describe('QuoteParserService', () => {
  let service;

  beforeAll(() => {
    service = new QuoteParserService();
  });

  it('devrait extraire prix', () => {
    const text = 'Le prix unitaire est 15,50€ HT';
    const prices = service.extractPrices(text);
    expect(prices).toContain(15.5);
  });

  it('devrait extraire MOQ', () => {
    const text = 'MOQ: 100 pièces minimum';
    const moqs = service.extractMoqs(text);
    expect(moqs).toContain(100);
  });

  it('devrait extraire délai', () => {
    const text = 'Délai de livraison: 10 jours';
    const delays = service.extractDelays(text);
    expect(delays).toContain(10);
  });

  it('devrait parser email complet', async () => {
    const email = {
      from: 'contact@supplier.com',
      subject: 'Devis',
      text: 'Prix: 20€ HT / MOQ: 50 / Délai: 7 jours / EXW',
    };

    const quote = await service.parseQuoteEmail(email);
    expect(quote.prices[0]).toBe(20);
    expect(quote.moqs[0]).toBe(50);
    expect(quote.delays[0]).toBe(7);
    expect(quote.incoterms).toContain('EXW');
  });
});
```

**Exécuter tests** :
```bash
npm test
```

**Livrables** :
- ✅ `QuoteParserService` avec regex extraction
- ✅ `StorageService` pour persister données
- ✅ Parsing prix, MOQ, délai, incoterms
- ✅ Tests unitaires passent
- ✅ Logging détaillé

### 9.4 Critères d'acceptation Phase 7

- ✅ Service `QuoteParserService` implémenté
- ✅ Extraction prix/MOQ/délai/incoterms via regex
- ✅ Taux succès > 70% sur emails structurés
- ✅ Service `StorageService` persiste données JSON
- ✅ Tests unitaires valident parsing
- ✅ Gestion erreurs parsing robuste

### 9.5 Commit
```bash
git add src/services/QuoteParserService.js src/services/StorageService.js
git commit -m "feat: implement quote parsing from emails and JSON storage"
```

---

## 10. PHASE 8 : TESTS ET VALIDATION

### 10.1 Objectif
Tester l'enchaînement complet avec données de test et valider RGPD compliance.

### 10.2 Durée estimée
**2-3 jours**

### 10.3 Tâches détaillées

#### Tâche 8.1 : Tests d'intégration complets

**Fichier : `tests/integration.test.js`**

```javascript
const request = require('supertest');
const app = require('../src/app');

describe('Integration Tests', () => {
  it('devrait compléter le workflow search -> scrape -> results', async () => {
    const response = await request(app)
      .post('/api/search')
      .send({
        category: 'thermoformage',
        country: 'France',
        radius: 100,
        description: 'Pièces plastique complexes',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.companies.length).toBeGreaterThan(0);
    expect(response.body.companies[0]).toHaveProperty('name');
    expect(response.body.companies[0]).toHaveProperty('email');
    expect(response.body.emailFoundRate).toBeDefined();
  });

  it('devrait valider input recherche', async () => {
    const response = await request(app)
      .post('/api/search')
      .send({ category: '' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('devrait envoyer batch emails', async () => {
    const response = await request(app)
      .post('/api/email/send-batch')
      .send({
        companies: [
          { name: 'Test Company', email: 'test@example.com' },
        ],
        request: {
          category: 'thermoformage',
          description: 'Test',
          clientName: 'Test Client',
          clientCompany: 'Test Corp',
          clientPhone: '+33123456789',
          clientEmail: 'client@corp.com',
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.sent).toBeGreaterThanOrEqual(0);
  });
});
```

#### Tâche 8.2 : RGPD compliance checks

**Checklist RGPD** :

```
☐ Opt-out link présent dans tous les emails
☐ Mentions légales sur page web (politique confidentialité)
☐ No hardcoded emails en code
☐ Données sensibles chiffrées (emails, tel)
☐ Logs ne contiennent pas emails complets
☐ Consentement implicite (prospection B2B autorisée)
☐ Droit de rétractation easy (2 clicks max)
☐ Durée rétention données < 3 ans
```

**Fichier : `public/privacy.html`**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Politique de Confidentialité - SourceBot</title>
</head>
<body>
  <h1>Politique de Confidentialité</h1>
  
  <h2>Collecte de données</h2>
  <p>Les données (emails, téléphones, sites web) sont collectées via Google Places API et web scraping.
  Elles sont utilisées exclusivement pour envoyer demandes de devis relatives à votre projet.</p>

  <h2>RGPD & Droit de rétractation</h2>
  <p>Conformément au RGPD (prospection B2B autorisée sous intérêt légitime),
  vous pouvez à tout moment demander la suppression de votre adresse email en
  cliquant sur le lien "Se désinscrire" dans les emails reçus, ou en nous contactant.</p>

  <h2>Durée rétention</h2>
  <p>Les données sont conservées 12 mois maximum, puis supprimées.</p>

  <h2>Contact</h2>
  <p>Pour toute question: <a href="mailto:contact@sourcebot.local">contact@sourcebot.local</a></p>
</body>
</html>
```

#### Tâche 8.3 : Tests manuels de bout en bout

**Scenario test complet** :

1. **Setup** :
   - Créer 2 comptes test (supplier1@test.com, supplier2@test.com)
   - Remplir leurs sites web fictifs (http://supplier1-test.com, etc.)

2. **Test recherche** :
   - Accéder http://localhost:3000
   - Remplir formulaire (catégorie, pays, description)
   - Cliquer "Lancer recherche"
   - ✅ Vérifier résultats affichés

3. **Test scraping** :
   - Vérifier que emails sont extraits (ou "Not found")
   - Vérifier format emails valides

4. **Test envoi** :
   - Cliquer "Envoyer demandes"
   - Vérifier emails reçus dans boîtes tests
   - ✅ Vérifier sujet, corps, lien opt-out

5. **Test réception** :
   - Envoyer email réponse depuis test supplier
   - Attendre 3h (ou forcer sync IMAP manual)
   - ✅ Vérifier email parsé en backend logs

6. **Test tableau** :
   - Vérifier résultats visibles via API `/api/quotes`
   - ✅ Vérifier prix, MOQ, délai extraits

**Rapport test** :
```
✅ Phase 1: Search - 5 companies found, 3 emails extracted (60%)
✅ Phase 2: Email send - 3 emails sent (2 success, 1 bounce)
✅ Phase 3: Email receive - 1 reply parsed (price: €20, delay: 10j)
✅ Phase 4: RGPD - unsubscribe link present, no PII in logs
⚠️ Phase 5: Scraping delay - average 2s per site (acceptable)
```

**Livrables** :
- ✅ Tests intégration passent
- ✅ RGPD checklist validée
- ✅ Tests manuels complets (6 scenarios)
- ✅ Rapport de test

### 10.4 Critères d'acceptation Phase 8

- ✅ Tests intégration couvrent workflow complet
- ✅ Validation input stricte (400 errors)
- ✅ Email sending fonctionne bout-en-bout
- ✅ IMAP reception et parsing ok
- ✅ Opt-out link présent
- ✅ Privacy policy accessible
- ✅ Aucune PII en logs
- ✅ Success rate > 80% (scenario tests)

### 10.5 Commit
```bash
git add tests/ public/privacy.html
git commit -m "test: add integration tests and RGPD compliance validation"
```

---

## 11. PHASE 9 : DÉPLOIEMENT LOCAL

### 11.1 Objectif
Finaliser configuration locale, documenter setup, et créer Docker optionnel pour faciliter réplication.

### 11.2 Durée estimée
**1-2 jours**

### 11.3 Tâches détaillées

#### Tâche 9.1 : README complet

**Fichier : `README.md`**

```markdown
# SourceBot

Application web automatisant la mise en relation avec des sous-traitants.

## À propos

SourceBot recherche automatiquement des entreprises spécialisées, collecte leurs coordonnées, envoie des demandes de devis professional, et compile les réponses dans un tableau comparative.

## Stack technique

- **Backend** : Node.js 18+ + Express
- **Frontend** : HTML5 + CSS3 + JavaScript
- **APIs** : Google Places API, Mailjet SMTP, IMAP
- **Scraping** : Cheerio
- **Storage** : JSON local (ou Google Sheets futur)

## Installation

### Préalables

- Node.js v18+ ([https://nodejs.org](https://nodejs.org))
- npm (inclus avec Node)
- Comptes: Google Cloud (API Places), Mailjet (SMTP/IMAP)

### Setup local

```bash
# 1. Cloner repo
git clone https://github.com/yourorg/sourcebot.git
cd sourcebot

# 2. Installer dépendances
npm install

# 3. Copier config exemple
cp .env.example .env

# 4. Remplir .env avec vos clés API
# Éditer .env : GOOGLE_PLACES_API_KEY, MAILJET_API_KEY, etc.

# 5. Lancer serveur
npm run dev

# 6. Accéder application
# Ouvrir http://localhost:3000 dans navigateur
```

## Usage

1. **Remplir formulaire** : Sélectionner catégorie, décrire projet, préciser localisation
2. **Lancer recherche** : Cliquer "Lancer recherche"
3. **Résultats** : Affichage entreprises trouvées avec emails extraits
4. **Envoyer demandes** : Cliquer "Envoyer demandes de devis"
5. **Surveiller réponses** : Tableau mis à jour automatiquement (sync 3h)

## Commandes npm

```bash
npm start          # Lancer production
npm run dev        # Lancer dev (watch mode)
npm test           # Runner tests
npm run lint       # Vérifier style code
npm run lint:fix   # Fixer style automatiquement
npm run build      # Build production
```

## Architecture

Voir [Architecture.md](Architecture.md) pour diagrammes détaillés.

```
Frontend (HTML/CSS/JS)
    ↓ HTTP /api/search
Backend (Express)
    ├→ Google Places API (recherche entreprises)
    ├→ Cheerio Scraping (extraction emails)
    ├→ Mailjet SMTP (envoi demandes)
    ├→ IMAP (réception réponses)
    └→ Storage JSON (persistance)
```

## Configuration

### `.env` requises

```
GOOGLE_PLACES_API_KEY=...          # Clé API Google
MAILJET_API_KEY=...                # API Mailjet
MAILJET_SECRET_KEY=...             # Secret Mailjet
SMTP_USER=sender@company.com       # Email expéditeur
IMAP_USER=sender@company.com       # Email IMAP
# Voir .env.example pour tous les paramètres
```

### Obtenir les clés

**Google Places API** :
1. Aller https://console.cloud.google.com/
2. Créer nouveau projet
3. Activer API "Places API (New)"
4. Créer credentials (API Key)

**Mailjet** :
1. Créer compte https://www.mailjet.com
2. Aller Settings → API Keys
3. Copier API Key et Secret Key

## Troubleshooting

### Pas d'emails trouvés (40% au lieu 70%)
- Certains sites bloquent scraping ou ne listent pas emails publiquement
- Fallback: utiliser téléphone de Google Places

### Tests email n'arrivent pas
- Vérifier domaine sender vérifié en Mailjet
- Vérifier Spam folder
- Vérifier logs serveur: `npm run dev | grep -i email`

### IMAP sync ne polit pas
- Vérifier identifiants IMAP
- Vérifier pas 2FA activé (utiliser Apppassword)
- Forcer sync: `curl http://localhost:3000/api/debug/imap-sync`

## Documentation

- [Cahier des Charges](Cahier%20des%20charges.md)
- [Guidelines Développement](Guidlines%20de%20developpement.md)
- [Architecture Technique](Architecture.md)
- [Plan de Développement](Plan%20de%20developpement.md)

## Roadmap

- ✅ MVP Phase 1-9 (current)
- 🔄 Phase 10: Itérations
- 📋 v1.0: Release stable
- 🔮 v2.0: PostgreSQL backend, cloud hosting

## RGPD & Légal

- Prospection B2B autorisée sous "intérêt légitime" (RGPD)
- Opt-out link obligatoire dans chaque email
- Voir [privacy.html](public/privacy.html) pour politique complète
- Données conservées 12 mois max

## Support

Pour issues/bugs: Ouvrir ticket GitHub
Pour questions: Envoyer email à contact@sourcebot.local

## License

Propriétaire - Tous droits réservés

## Contributors

- [Your Name] - Développeur principal
```

#### Tâche 9.2 : Scripts npm utiles

**Ajouter à `package.json`** :

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest --passWithNoTests",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/ public/js/",
    "lint:fix": "eslint src/ public/js/ --fix && prettier --write 'src/**/*.js' 'public/js/**/*.js'",
    "format": "prettier --write 'src/**/*.{js,json}' 'public/**/*.{js,css,html}'",
    "build": "echo 'Build step (if using bundler)'",
    "debug:imap-sync": "node -e \"require('dotenv').config(); const ImapService = require('./src/services/ImapService'); new ImapService({user: process.env.IMAP_USER, password: process.env.IMAP_PASSWORD, host: process.env.IMAP_HOST, port: process.env.IMAP_PORT}).sync().then(console.log).catch(console.error);\""
  }
}
```

#### Tâche 9.3 : Dockerfile (optionnel)

**Fichier : `Dockerfile`**

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

**Fichier : `.dockerignore`**

```
node_modules
.env
.env.local
.git
.gitignore
data/
logs/
npm-debug.log
.DS_Store
tests/
```

**Build et run** :

```bash
docker build -t sourcebot:latest .
docker run -p 3000:3000 \
  -e GOOGLE_PLACES_API_KEY=... \
  -e MAILJET_API_KEY=... \
  sourcebot:latest
```

#### Tâche 9.4 : Scripts de setup

**Fichier : `scripts/setup.sh`** (Linux/Mac)

```bash
#!/bin/bash
set -e

echo "🚀 SourceBot Setup"

# 1. Check Node
echo "✓ Checking Node.js..."
node --version

# 2. Install deps
echo "✓ Installing dependencies..."
npm install

# 3. Create .env
if [ ! -f .env ]; then
  echo "✓ Creating .env from .env.example..."
  cp .env.example .env
  echo "⚠️  Please edit .env with your API keys"
else
  echo "✓ .env already exists"
fi

# 4. Create data dir
mkdir -p data logs

# 5. Run tests
echo "✓ Running tests..."
npm test

echo "✅ Setup complete!"
echo "Run 'npm run dev' to start server"
```

**Pemet'executer** :

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

**Livrables** :
- ✅ README.md complet avec installation
- ✅ Scripts npm utiles
- ✅ Dockerfile optionnel
- ✅ Setup automation script

### 11.4 Critères d'acceptation Phase 9

- ✅ README.md clair (installation, usage, troubleshooting)
- ✅ Tous les scriptsnpm 
 opérationnels
- ✅ Installation < 15 min
- ✅ Dockerfile fonctionne
- ✅ Pas d'erreurs au startup
- ✅ Health check répond (`/api/health`)

### 11.5 Commit
```bash
git add README.md Dockerfile .dockerignore scripts/setup.sh
git commit -m "docs: add complete README, Docker setup, and deployment scripts"
```

---

## 12. PHASE 10 : ITÉRATIONS ET AMÉLIORATIONS

### 12.1 Objectif
Après mise en route initiale, affiner les critères de recherche, optimiser scraping, et valider avec utilisateurs réels.

### 12.2 Durée estimée
**7-10 jours** (itérations continues)

### 12.3 Tâches détaillées

#### Tâche 10.1 : Optimiser Google Places Search

**Problèmes potentiels** :
- Doublons entre Text et Nearby Search
- Résultats non pertinents (mauvaise catégorie)
- Couverture géographique inégale

**Solutions** :
- Dédupliquer par place_id automatiquement
- Ajouter filtres: `business_status='OPERATIONAL'`, `type=explicit`
- Augmenter nombre de grille Nearby (5×5 au lieu 3×3)

**Code adjustment** :
```javascript
async comprehensiveSearch(keyword, country, maxRadius) {
  // ... existing code ...
  
  // Filtrer fermés
  const companies = textResults.filter(
    (c) => c.business_status === 'OPERATIONAL'
  );
  
  // Déduplicater par place_id
  const uniqueIds = new Set();
  return companies.filter((c) => {
    if (uniqueIds.has(c.place_id)) return false;
    uniqueIds.add(c.place_id);
    return true;
  });
}
```

#### Tâche 10.2 : Améliorer taux scraping

**Actions** :
- Ajouter fallback pages communes (/about, /contact-us)
- Implémenter regex améliorée (patterns métier)
- Cache emails par domaine

**Code** :
```javascript
async scrapeContactPages(baseUrl) {
  const paths = [
    '/contact',
    '/contact-us',
    '/nous-contacter',
    '/about',
    '/a-propos',
    '/contact-form',
    '/contactez-nous'
  ];
  
  for (const path of paths) {
    const emails = await this.scrapePage(`${baseUrl}${path}`);
    if (emails.length > 0) return emails;
  }
  
  return [];
}
```

#### Tâche 10.3 : Ajouter page de suivi

**Nouvelle route** : GET `/api/quotes` → tableau devis reçus

```javascript
app.get('/api/quotes', async (req, res) => {
  try {
    const quotes = await storageService.loadQuotes();
    res.json({ success: true, quotes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

**Nouveau page** : `public/quotes.html` avec table tri/filtre

#### Tâche 10.4 : Tests utilisateurs minimaliste

**Recruitment** : 2-3 utilisateurs tests (PMEs / responsables achat)

**Scenario** :
1. Remplir formulaire pour 1 vrai besoin
2. Lancer recherche
3. Suivre processus jusqu'à réception réponses

**Feedback attendu** :
- UX intuitive? 
- Emails professionnels?
- Données devis utiles?
- Suggestions amélioration?

**Itérations rapides** basées sur feedback

#### Tâche 10.5 : Monitoring et métriques

**Tracker** :
- Nombre recherches/jour
- Taux succès (emails trouvés, réponses reçues)
- Temps moyenne traitement
- Erreurs

**Dashboard simple** : Google Sheet auto-update avec logs

### 12.4 Critères d'acceptation Phase 10

- ✅ Taux scraping passe 60% → 75%+
- ✅ Doublons réduits via déduplication
- ✅ Page suivi devis opérationnelle
- ✅ Feedback utilisateurs collecté
- ✅ Bugs fixés itérationment
- ✅ Monitoring logs en place
- ✅ Documentation mise à jour

### 12.5 Commit (multiples)
```bash
git add .
git commit -m "refactor: optimize search deduplication and scraping fallbacks"
git commit -m "feat: add quotes tracking page and monitoring dashboard"
git commit -m "docs: update README with user feedback and known issues"
```

---

## 13. TABLEAU RÉSUMÉ DU PLAN

| Phase | Titre | Durée | Livrables | Dépendances |
|-------|-------|-------|-----------|------------|
| 1 | Initialisation | 1-2 j | Project scaffold, npm, Git | - |
| 2 | Google Places API | 2-3 j | Service search, `/api/search` | Phase 1 |
| 3 | Scraping | 2-3 j | Email extraction, 60%+ success | Phase 2 |
| 4 | Frontend UI | 2 j | Form, CSS, JS client | Phase 1 |
| 5 | Email Sending | 2 j | Mailjet SMTP, batch emails | Phase 2, 4 |
| 6 | IMAP Reception | 2 j | Scheduler 3h, email sync | Phase 5 |
| 7 | Quote Parsing | 2 j | Regex extraction, storage JSON | Phase 6 |
| 8 | Tests & RGPD | 2-3 j | Integration tests, compliance | Phase 7 |
| 9 | Déploiement Local | 1-2 j | README, Docker, Scripts | Phase 8 |
| 10 | Itérations | 7-10 j | Optimisations, feedback user | Phases 1-9 |

**Total estimé** : 8-10 semaines (1 développeur)

---

## 14. RISQUES ET CONTINGENCE

### Risques identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|------------|--------|-----------|
| Google Places quota limité | Moyenne | Haut | Monitorer usage, implémenter cache |
| Scraping bloqué (robots.txt) | Moyenne | Moyen | Ajouter fallback autres sources |
| Emails classés spam | Haute | Haut | Utiliser Mailjet (réputation), SPF/DKIM |
| IMAP timeout fréquent | Basse | Moyen | Retry logic, augmenter timeout |
| Données sensibles exposées | Basse | Critique | Chiffrement, .env secure, logs masqués |

### Plan de contingence

- **Si scraping échoue > 50%** : Ajouter OCR (Google Vision API) pour PDFs
- **Si quotas Google atteints** : Passer à API payante ou multiplier clés
- **Si déploiement cloud requis** : Heroku deployment (1-2 jours)
- **Si deadlineproblem** : Réduire phases 10 (itérations) + lancer MVP 50% features

---

## 15. RESSOURCES ET RÉFÉRENCES

### Documentation officielles
- [Google Places API Docs](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Place Details API](https://developers.google.com/maps/documentation/places/web-service/place-details)
- [Cheerio Docs](https://cheerio.js.org/)
- [Nodemailer Docs](https://nodemailer.com/)
- [IMAP Module](https://github.com/mscdex/imap)
- [Express.js Guide](https://expressjs.com/)

### Références scraping
- [Scrape a site with Node and Cheerio](https://medium.com/@dylan.sather/scrape-a-site-with-node-and-cheerio-in-5-minutes-4617daee3384)
- [Google Places Radar Search Radius](https://stackoverflow.com/questions/43101519/google-places-radar-search-with-a-radius-greater-than-50-000-meters)

### RGPD B2B
- [RGPD Prospection B2B - Leto Legal](https://www.leto.legal/guides/rgpd-et-prospection-btob-quelles-regles-respecter)
- [CNIL Guidelines](https://www.cnil.fr/)

### Outils recommended
- **Testing** : Postman (API requests), Jest (unit tests)
- **Monitoring** : Winston (logging), PM2 (process manager)
- **Deployment** : Heroku, Docker, GitHub Actions (CI/CD)

---

## 16. PROCHAINES ÉTAPES

Après Phase 10 (MVP stabilisé) :

1. **Validation marché** : Tester avec 10+ entreprises
2. **Collecting feedback** : Itérations utilisateurs
3. **Feature prioritization** : Décider v2.0 features
4. **Production readiness** :
   - PostgreSQL migration
   - Cloud deployment (Heroku/AWS)
   - Scaling (Redis cache, job queue)
5. **Monetization** : Modèle SaaS ou license

---

**Plan révisé** : 04 Mars 2026  
**Version** : 1.0 (MVP Roadmap)  
**Status** : Approuvé pour démarrage développement

