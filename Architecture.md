# ARCHITECTURE TECHNIQUE
## Projet SourceBot - Application Web de Mise en Relation avec des Sous-Traitants

---

## 1. INTRODUCTION

Ce document détaille l'architecture technique de SourceBot, une application web locale développée en Node.js/Express. L'application coordonne la recherche automatique, la collecte des données, l'envoi de demandes de devis et le suivi des réponses par email.

**Contexte** :
- Développement local sur VS Code
- Stack JavaScript (frontend + backend)
- Intégrations multiples : Google Places API, SMTP/IMAP, Web scraping
- Scalabilité progressive vers cloud (optionnel)

---

## 2. VUE D'ENSEMBLE - DIAGRAMME D'ARCHITECTURE

### 2.1 Diagramme général (flux de données)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          UTILISATEUR FINAL                                │
│                      (Interface Web Navigateur)                           │
└────────────────────────────────┬─────────────────────────────────────────┘
                                 │ HTTP/HTTPS
                                 ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                     FRONTEND (HTML5/CSS3/JavaScript)                     │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │  Form Input Module                                              │   │
│  │  - Catégorie sous-traitant (dropdown)                          │   │
│  │  - Description projet (textarea)                               │   │
│  │  - Localisation (pays / rayon)                                 │   │
│  │  - Upload files (PDF, PNG, etc.)                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                 │ POST /api/search                        │
└─────────────────────────────────┬────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                 BACKEND (Node.js + Express.js)                           │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  API Routes Layer (/api/search, /api/send, /api/quotes, etc.)  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                           │                                              │
│         ┌─────────────────┼─────────────────────────────────┐           │
│         ▼                 ▼                                 ▼           │
│  ┌──────────────┐  ┌──────────────────┐  ┌──────────────────────┐    │
│  │ Search       │  │ Email Service    │  │ Quote Parser         │    │
│  │ Controller   │  │ Module           │  │ Module               │    │
│  └──────────────┘  └──────────────────┘  └──────────────────────┘    │
│         │                 │                       │                    │
│         ▼                 ▼                       ▼                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              Services Layer (Business Logic)                     │  │
│  │                                                                  │  │
│  │  ┌────────────────────┐  ┌──────────────────┐                  │  │
│  │  │ Google Places     │  │ Scraping Service │                  │  │
│  │  │ Service           │  │ (Cheerio)        │                  │  │
│  │  │ - Text Search     │  │ - Parse HTML     │                  │  │
│  │  │ - Nearby Search   │  │ - Extract Emails │                  │  │
│  │  │ - Place Details   │  │ - Handle Errors  │                  │  │
│  │  └────────────────────┘  └──────────────────┘                  │  │
│  │                                                                  │  │
│  │  ┌────────────────────┐  ┌──────────────────┐                  │  │
│  │  │ Storage Service   │  │ Email Service    │                  │  │
│  │  │ - Google Sheets   │  │ - Send (SMTP)    │                  │  │
│  │  │   API             │  │ - Receive (IMAP) │                  │  │
│  │  │ - CSV Export      │  │ - Parse response │                  │  │
│  │  │ - Database Ops    │  │ - Retry logic    │                  │  │
│  │  └────────────────────┘  └──────────────────┘                  │  │
│  │                                                                  │  │
│  │  ┌────────────────────────────────────────────────────────────┐│  │
│  │  │ Utilities & Middleware                                    ││  │
│  │  │ - Logging (Winston)                                       ││  │
│  │  │ - Error Handling                                          ││  │
│  │  │ - Input Validation (Joi)                                  ││  │
│  │  │ - Rate Limiting                                           ││  │
│  │  └────────────────────────────────────────────────────────────┘│  │
│  └──────────────────────────────────────────────────────────────────┘  │
│         │                    │                  │                   │   │
└─────────┼────────────────────┼──────────────────┼───────────────────┼──┘
          │                    │                  │                   │
          ▼                    ▼                  ▼                   ▼
   ┌─────────────┐    ┌──────────────┐   ┌─────────────┐   ┌──────────────┐
   │Google       │    │Google        │   │Email        │   │  Local       │
   │Places API   │    │Sheets API    │   │SMTP/IMAP    │   │  Storage     │
   │(recherche)  │    │(stockage)    │   │(Mailjet,    │   │  (CSV/Sheets)│
   │             │    │              │   │Nodemailer)  │   │              │
   └─────────────┘    └──────────────┘   └─────────────┘   └──────────────┘
```

### 2.2 Diagramme de communication entre modules

```
User Request
    │
    ▼
┌─────────────────────────────────────────────────────────┐
│ Frontend Form Submit                                    │
│ (category, description, location, files)               │
└──────────┬──────────────────────────────────────────────┘
           │
           ▼ POST /api/search
┌──────────────────────────────────────────────────────┐
│ Backend: Search Controller                           │
│ 1. Validate input                                    │
│ 2. Create search query                               │
└──────────┬───────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────┐
│ Google Places Service                                │
│ 1. Text Search: "thermoformeurs en France"          │
│ 2. Get 20-50 results with place_id                  │
│ 3. For each: Place Details API call                 │
│    → Extract: name, address, phone, website         │
└──────────┬───────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────┐
│ For each company found:                              │
│ - Store in temporary list                            │
│ - Call Scraping Service                              │
└──────────┬───────────────────────────────────────────┘
           │
           ▼ (Parallel)
┌──────────────────────────────────────────────────────┐
│ Scraping Service (Cheerio)                           │
│ For each website:                                    │
│ 1. Fetch HTML (10s timeout)                         │
│ 2. Parse with Cheerio                               │
│ 3. Search email regex: .*@.*\..* │ <a href="mailto:">
│ 4. If found: store email                            │
│ 5. If not: mark "not found"                         │
└──────────┬───────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────┐
│ Storage Service                                      │
│ Save all data to Google Sheets/CSV:                  │
│ (name, address, phone, website, email, GPS, etc.)   │
└──────────┬───────────────────────────────────────────┘
           │
           ▼ (Parallel)
┌──────────────────────────────────────────────────────┐
│ Email Service (SMTP via Mailjet/Nodemailer)         │
│ For each email found:                                │
│ 1. Compose professional email                        │
│ 2. Attach user files                                 │
│ 3. Send via SMTP                                    │
│ 4. Log delivery status                               │
└──────────┬───────────────────────────────────────────┘
           │
           ▼ (Scheduled: every 3 hours)
┌──────────────────────────────────────────────────────┐
│ Email Listening Service (IMAP)                       │
│ 1. Connect to IMAP inbox (Mailjet, Gmail, etc.)     │
│ 2. Check for new emails                              │
│ 3. For each reply:                                   │
│    a. Match sender to company (reverse lookup)      │
│    b. Extract key data (price, MOQ, delay, etc.)    │
│    c. Save attachments (PDF devis)                  │
│    d. Update storage with response info              │
└──────────┬───────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────┐
│ Quote Parser Service                                │
│ Extract structured data from email/PDF:             │
│ - Email body text extraction                        │
│ - PDF parsing (if attached)                         │
│ - Regex patterns: price, quantity, delay           │
│ - Store in Quote table                              │
└──────────┬───────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────┐
│ Final Output                                        │
│ Comparative table (Google Sheets / CSV export)      │
│ Columns: Company, email, price, MOQ, delay, etc.    │
└──────────────────────────────────────────────────────┘
```

---

## 3. DESCRIPTION DÉTAILLÉE DES MODULES

### 3.1 Frontend - Interface Utilisateur

#### 3.1.1 Composants
```
public/
├── index.html                 # Single page (formulaire)
├── css/
│   ├── style.css             # Styles généraux
│   └── responsive.css        # Mobile-friendly
└── js/
    ├── app.js                # Initialisation app
    ├── form.js               # Gestion formulaire
    ├── api-client.js         # Client HTTP (fetch API)
    └── ui.js                 # Mise à jour DOM
```

#### 3.1.2 Formulaire principal

**Champs** :
```html
<form id="search-form">
  <!-- 1. Catégorie -->
  <select name="category" required>
    <option>Thermoformage</option>
    <option>Soudure</option>
    <option>Plomberie</option>
    <!-- Plus... -->
  </select>

  <!-- 2. Description projet -->
  <textarea name="description" maxlength="5000" 
            placeholder="Décrivez votre demande..."></textarea>

  <!-- 3. Upload fichiers -->
  <input type="file" name="files" multiple 
         accept=".pdf,.png,.jpg,.dwg,.step,.zip">

  <!-- 4. Localisation -->
  <select name="locationMode">
    <option value="country">Par pays</option>
    <option value="radius">Par rayon</option>
  </select>
  
  <select name="country" required>
    <option>France</option>
    <option>Belgique</option>
    <!-- Plus... -->
  </select>
  
  <input type="number" name="radius" min="50" max="3000" 
         placeholder="Rayon en km">

  <!-- 5. Submit -->
  <button type="submit">Lancer recherche</button>
</form>
```

#### 3.1.3 Justification technique

| Technologie | Justification |
|-------------|---------------|
| **HTML5** | Standard web, sémantique, support formulaires natif |
| **CSS3** | Responsive design, compatibilité navigateurs modernes |
| **JavaScript ES6+** | Validation côté client, fetch API, meilleure UX |
| **Pas de framework** (MVP) | Simplifier déploiement, réduit dépendances; React optionnel pour future |

#### 3.1.4 Communication avec backend

```javascript
// public/js/api-client.js
async function submitSearch(formData) {
  const response = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: formData.category,
      description: formData.description,
      country: formData.country,
      radius: formData.radius,
      files: formData.files,  // Base64 encoded
    }),
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
```

---

### 3.2 Backend - Express.js Server

#### 3.2.1 Architecture routes

```
src/api/routes/
├── search.js        # POST /api/search
├── email.js         # POST /api/send-email
├── quotes.js        # GET /api/quotes
├── upload.js        # POST /api/upload
└── health.js        # GET /api/health (monitoring)
```

**Exemple Route Search** :
```javascript
// src/api/routes/search.js
const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const validation = require('../middleware/validation');

router.post('/', 
  validation.validateSearch,   // Middleware validation
  searchController.search      // Handler
);

module.exports = router;
```

#### 3.2.2 Controllers & Services

**Pattern MVC** :
```
search request
    ↓
searchController (req/res handling)
    ↓
SearchService (business logic)
    ↓
GooglePlacesService + ScrapingService (external APIs)
    ↓
StorageService (data persistence)
```

**Exemple Controller** :
```javascript
// src/api/controllers/searchController.js
const logger = require('../../config/logger');
const SearchService = require('../../services/SearchService');

exports.search = async (req, res, next) => {
  try {
    const { category, country, radius, description, files } = req.body;

    logger.info('Search initiated', { category, country, radius });

    // Start search (non-blocking pour UX)
    const jobId = await SearchService.initializeSearch({
      category,
      country,
      radius,
      description,
      files,
    });

    // Retourner immédiatement avec job ID
    res.json({
      status: 'processing',
      jobId,
      message: 'Recherche lancée. Vous pouvez surveiller la progression...',
    });

    // Continue traitement en arrière-plan
    SearchService.executeSearch(jobId).catch((err) => {
      logger.error('Search failed', { jobId, error: err });
    });
  } catch (error) {
    next(error);  // Pass à error handler middleware
  }
};
```

#### 3.2.3 Server startup

```javascript
// server.js
const app = require('./src/app');
const logger = require('./src/config/logger');

const PORT = process.env.APP_PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
```

---

### 3.3 Module Google Places API

#### 3.3.1 Objectives
- Trouve les entreprises par catégorie et localisation
- Extrait contact, téléphone, site web, GPS
- Gère quotas API

#### 3.3.2 Implémentation

```javascript
// src/services/GooglePlacesService.js
const axios = require('axios');
const logger = require('../config/logger');

class GooglePlacesService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://maps.googleapis.com/maps/api/place';
    this.requestCount = 0;
    this.costTracker = 0;
  }

  /**
   * Text Search : recherche nationale/large périmètre
   * @param {string} query - ex. "thermoformeurs en France"
   * @returns {Promise<Array>} Liste des entreprises trouvées
   */
  async textSearch(query) {
    try {
      const url = `${this.baseUrl}/textsearch/json`;
      const response = await axios.get(url, {
        params: {
          query,
          key: this.apiKey,
        },
      });

      this.requestCount++;
      this.costTracker += 0.032; // ~$0.032 per Text Search query

      if (response.data.status !== 'OK') {
        throw new Error(`API error: ${response.data.status}`);
      }

      logger.info(`Text Search: ${query}`, {
        results: response.data.results.length,
      });

      return response.data.results;
    } catch (error) {
      logger.error('Text Search failed', { query, error });
      throw error;
    }
  }

  /**
   * Nearby Search : recherche par rayon géo (max ~50km)
   * @param {Object} params - {latitude, longitude, radius, keyword}
   * @returns {Promise<Array>} Entreprises trouvées près du point
   */
  async nearbySearch({ latitude, longitude, radius, keyword }) {
    try {
      const url = `${this.baseUrl}/nearbysearch/json`;
      const response = await axios.get(url, {
        params: {
          location: `${latitude},${longitude}`,
          radius,  // en mètres (1km = 1000m)
          keyword,
          key: this.apiKey,
        },
      });

      this.requestCount++;
      this.costTracker += 0.032;

      logger.info('Nearby Search completed', {
        location: `${latitude},${longitude}`,
        results: response.data.results.length,
      });

      return response.data.results;
    } catch (error) {
      logger.error('Nearby Search failed', { error });
      throw error;
    }
  }

  /**
   * Place Details : récupère infos complètes pour un établissement
   * @param {string} placeId - ID unique du lieu (API)
   * @returns {Promise<Object>} Détails complets
   */
  async getPlaceDetails(placeId) {
    try {
      const url = `${this.baseUrl}/details/json`;
      const response = await axios.get(url, {
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
            'opening_hours',
            'business_status',
            'type',
          ].join(','),
          key: this.apiKey,
        },
      });

      this.requestCount++;
      this.costTracker += 0.017; // ~$0.017 per Place Details

      if (response.data.status !== 'OK') {
        throw new Error(`Place Details error: ${response.data.status}`);
      }

      return response.data.result;
    } catch (error) {
      logger.error('Place Details failed', { placeId, error });
      throw error;
    }
  }

  /**
   * Stratégie recherche : combiner Text Search + Nearby Search
   */
  async comprehensiveSearch({ keyword, country, maxRadius }) {
    const companies = new Map();  // Dédupliquer par place_id

    // 1. Text Search large
    logger.info('Starting comprehensive search...', { keyword, country });
    const textResults = await this.textSearch(`${keyword} in ${country}`);

    for (const result of textResults) {
      const details = await this.getPlaceDetails(result.place_id);
      companies.set(result.place_id, {
        placeId: result.place_id,
        ...details,
      });
    }

    // 2. Nearby Search multi-points (si rayon > 50km)
    if (maxRadius > 50000) {
      const grids = this.createSearchGrid(country, maxRadius);
      
      for (const point of grids) {
        const nearbyResults = await this.nearbySearch({
          latitude: point.lat,
          longitude: point.lng,
          radius: 50000,  // Max API limit
          keyword,
        });

        for (const result of nearbyResults) {
          if (!companies.has(result.place_id)) {
            const details = await this.getPlaceDetails(result.place_id);
            companies.set(result.place_id, {
              placeId: result.place_id,
              ...details,
            });
          }
        }
      }
    }

    logger.info('Comprehensive search complete', {
      totalCompanies: companies.size,
      apiCost: `$${this.costTracker.toFixed(2)}`,
    });

    return Array.from(companies.values());
  }

  /**
   * Créer grille de points pour couvrir large zone
   * Spacing = rayon / 3 (pour overlap minime)
   */
  createSearchGrid(country, maxRadius) {
    // Simplifié : centrer sur capitale ou point moyen
    // IRL: utiliser centre utilisateur input
    const countryCenter = {
      France: { lat: 46.5, lng: 2.5 },
      Germany: { lat: 51.1, lng: 10.4 },
      // ...
    };

    const center = countryCenter[country] || { lat: 50, lng: 5 };
    const spacing = maxRadius / 3 / 111000;  // Convert m to degrees

    const grid = [];
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        grid.push({
          lat: center.lat + (i * spacing),
          lng: center.lng + (j * spacing),
        });
      }
    }

    return grid;
  }
}

module.exports = GooglePlacesService;
```

#### 3.3.3 Justification technique

| Choix | Justification |
|-------|---------------|
| **Text Search** | Couvre zones larges, meilleure couverture géographique que Nearby seul |
| **Nearby Search multi-grille** | Contourne limite 50km en créant grille de requêtes (rayon = 3000 km ÷ 3 grilles) |
| **Place Details** | Récupère données compètes (tel, adresse officielle, site web) en un appel |
| **Déduplication par place_id** | Évite doublons entre Text et Nearby |
| **Coût tracking** | Anticiper facturation Google (limite quotas, budget alert) |

#### 3.3.4 Coûts et quotas

```
Google Places API (New) Pricing:
- Text Search: $0.032 par appel | 100,000/mois gratuit
- Nearby Search: $0.032 par appel | 100,000/mois gratuit
- Place Details: $0.017 par appel | 200,000/mois gratuit

Exemple recherche 200 entreprises:
- 1 Text Search: $0.032
- 10 Nearby Search (grille): $0.32
- 200 Place Details: $3.40
Total: ~$3.75 par recherche complète

Budget mensuel recommendation: $50-100 (marge de sécurité)
```

---

### 3.4 Module Scraping - Cheerio

#### 3.4.1 Objectives
- Extraire emails depuis site web de chaque entreprise
- Gérer timeouts, erreurs réseau, robots.txt
- Maximiser taux succès extraction

#### 3.4.2 Implémentation

```javascript
// src/services/ScrapingService.js
const axios = require('axios');
const cheerio = require('cheerio');
const robots = require('robots-parser');
const logger = require('../config/logger');

class ScrapingService {
  constructor() {
    this.timeout = 10000;  // 10s par site
    this.userAgent = 'SourceBot/1.0 (+https://sourcebot.local/info)';
    this.emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  }

  /**
   * Extraire email(s) depuis un site web
   * @param {string} websiteUrl - URL complète
   * @returns {Promise<Array<string>>} Array emails trouvés ou vide
   */
  async scrapeEmail(websiteUrl) {
    const emails = [];

    try {
      // 1. Valider URL
      if (!this.isValidUrl(websiteUrl)) {
        logger.warn(`Invalid URL: ${websiteUrl}`);
        return [];
      }

      // 2. Vérifier robots.txt
      const canScrape = await this.checkRobots(websiteUrl);
      if (!canScrape) {
        logger.info(`Robots.txt blocked: ${websiteUrl}`);
        return [];
      }

      // 3. Fetch HTML
      logger.info(`Scraping: ${websiteUrl}`);
      const html = await this.fetchWithTimeout(websiteUrl, this.timeout);

      // 4. Parse et chercher emails
      const foundEmails = await this.extractEmailsFromHtml(html, websiteUrl);
      emails.push(...foundEmails);

      // 5. Si pas d'email trouvé, chercher page contact spécifique
      if (emails.length === 0) {
        const contactPageEmails = await this.scrapeContactPage(websiteUrl);
        emails.push(...contactPageEmails);
      }

      logger.info(`Scraping success: ${websiteUrl}`, {
        emailsFound: emails.length,
      });
    } catch (error) {
      logger.warn(`Scraping error: ${websiteUrl}`, {
        error: error.message,
      });
      // Continue sans erreur (fallback: pas d'email trouvé)
    }

    return [...new Set(emails)];  // Dédupliquer
  }

  /**
   * Récupérer HTML avec timeout
   */
  async fetchWithTimeout(url, timeoutMs) {
    return Promise.race([
      axios.get(url, {
        headers: { 'User-Agent': this.userAgent },
        timeout: timeoutMs,
        maxRedirects: 5,
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeoutMs)
      ),
    ]).then((response) => response.data);
  }

  /**
   * Extraire emails du HTML
   */
  async extractEmailsFromHtml(html, baseUrl) {
    const emails = [];
    const $ = cheerio.load(html);

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

    // 3. Chercher patterns email courants
    const patterns = [
      'contact',
      'info',
      'support',
      'sales',
      'hello',
      'commercial',
    ];
    
    for (const pattern of patterns) {
      const element = $(`[class*="${pattern}"], [id*="${pattern}"]`);
      const email = element.text().match(this.emailRegex);
      if (email) emails.push(...email);
    }

    return emails.map((e) => e.toLowerCase());
  }

  /**
   * Chercher page /contact puis extraire emails
   */
  async scrapeContactPage(baseUrl) {
    const contactPaths = ['/contact', '/contact-us', '/nous-contacter',
                          '/kontakt', '/about', '/support'];
    const emails = [];

    for (const path of contactPaths) {
      try {
        const url = new URL(baseUrl);
        url.pathname = path;
        
        const html = await this.fetchWithTimeout(url.toString(), 5000);
        const foundEmails = await this.extractEmailsFromHtml(html);
        emails.push(...foundEmails);

        if (emails.length > 0) break;  // Arrêter si trouvé
      } catch (error) {
        // Continue
      }
    }

    return emails;
  }

  /**
   * Vérifier robots.txt
   */
  async checkRobots(baseUrl) {
    try {
      const url = new URL(baseUrl);
      const robotsUrl = `${url.protocol}//${url.host}/robots.txt`;
      
      const response = await axios.get(robotsUrl, { timeout: 5000 });
      const robotsParser = robots(robotsUrl, response.data);
      
      // Vérifier si scraping path autorisé
      return robotsParser.isAllowed(baseUrl, this.userAgent);
    } catch (error) {
      // Si pas de robots.txt = généralement autorisé
      return true;
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
   * Valider URL
   */
  isValidUrl(urlString) {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Scraper parallèle (10 sites simultanés)
   */
  async scrapeMultiple(websites) {
    const batchSize = 10;
    const results = {};

    for (let i = 0; i < websites.length; i += batchSize) {
      const batch = websites.slice(i, i + batchSize);
      const promises = batch.map((url) =>
        this.scrapeEmail(url).then((emails) => ({
          url,
          emails,
          status: emails.length > 0 ? 'found' : 'not_found',
        }))
      );

      const batchResults = await Promise.allSettled(promises);
      batchResults.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          results[batch[idx]] = result.value;
        } else {
          results[batch[idx]] = { emails: [], status: 'error' };
        }
      });

      // Délai 2-5s entre batches (respecter serveurs cibles)
      await new Promise((r) => setTimeout(r, 3000));
    }

    return results;
  }
}

module.exports = ScrapingService;
```

#### 3.4.3 Justification technique

| Choix | Justification |
|-------|---------------|
| **Cheerio** | Léger (contrairement Puppeteer/Playwright), efficace HTML parsing, pas de browser overhead |
| **Regex email** | Rapide, simple; accepte faux positifs (validé par SMTP later) |
| **Timeout 10s** | Équilibre découverte vs rapidité (sites lents) |
| **Robots.txt check** | Légal + éthique (pas abuser serveurs) |
| **Parallel 10 sites** | Vitesse acceptable sans surcharger |
| **Retry contact pages** | Augmente taux succès (70% → +5-10%) |

#### 3.4.4 Performance metrics

```
Expected results:
- Success rate (email found): 60-70% (dépend qualité sites)
- Average time per site: 1-2s
- Batch of 100 sites: 10-20 minutes (avec délai respectueux)
- Erreurs tolérées: <5% (timeout, unreachable, etc.)
```

---

### 3.5 Module Email - Envoi (SMTP)

#### 3.5.1 Objectives
- Envoyer demandes de devis professionnelles
- Personnaliser contenu (nom entreprise, catégorie)
- Gérer erreurs, retries, logging

#### 3.5.2 Implémentation

```javascript
// src/services/EmailService.js
const nodemailer = require('nodemailer');
const { render } = require('ejs');
const logger = require('../config/logger');

class EmailService {
  constructor(config) {
    this.service = config.service;  // 'mailjet', 'sendgrid', 'nodemailer'
    this.from = config.from;
    this.transporter = this.createTransporter(config);
    this.templates = {};
    this.sentCount = 0;
    this.failedCount = 0;
  }

  /**
   * Créer transporter selon service
   */
  createTransporter(config) {
    if (config.service === 'mailjet') {
      // Mailjet SMTP auth
      return nodemailer.createTransport({
        host: 'in.mailjet.com',
        port: 587,
        secure: false,
        auth: {
          user: config.mailjetApiKey,
          pass: config.mailjetSecretKey,
        },
      });
    } else if (config.service === 'nodemailer') {
      // Gmail ou autre SMTP
      return nodemailer.createTransport({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpPort === 465,
        auth: {
          user: config.smtpUser,
          pass: config.smtpPassword,
        },
      });
    }
    // Plus: SendGrid, Postmark, etc.
  }

  /**
   * Envoyer email demande de devis
   */
  async sendQuoteRequest(company, request) {
    try {
      // Composer email professionnel
      const emailContent = this.composeMail(company, request);

      const mailOptions = {
        from: this.from,
        to: company.email,
        subject: emailContent.subject,
        html: emailContent.html,
        attachments: request.files || [],
      };

      // Envoyer
      const info = await this.transporter.sendMail(mailOptions);

      this.sentCount++;
      logger.info('Email sent successfully', {
        to: company.email.slice(-8),  // Masquer
        company: company.name,
        messageId: info.messageId,
      });

      return {
        status: 'sent',
        messageId: info.messageId,
        timestamp: new Date(),
      };
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
   * Composer email HTML
   */
  composeMail(company, request) {
    const subject = `[DEMANDE DE DEVIS] ${request.category} - ${request.clientName}`;

    const html = `
      <p>Madame, Monsieur,</p>

      <p>Dans le cadre de notre projet de <strong>${request.category}</strong>,
      nous sommes à la recherche d'un prestataire capable de répondre à nos besoins spécifiques.</p>

      <h2>Description du projet :</h2>
      <p>${request.description}</p>

      <h2>Informations demandées :</h2>
      <ul>
        <li>Prix unitaire HT</li>
        <li>Quantité minimale (MOQ)</li>
        <li>Délai de livraison</li>
        <li>Incoterms appliqués</li>
        <li>Normes et certifications appliquées</li>
      </ul>

      <p>Les pièces jointes (plans, cahier des charges) sont accessibles en annexe.</p>

      <p>Nous restons à votre disposition pour toute clarification.</p>

      <p>Cordialement,</p>
      <hr>
      <strong>${request.clientName}</strong><br>
      ${request.clientTitle || 'Responsable Achat'}<br>
      ${request.clientCompany}<br>
      ${request.clientPhone}<br>
      ${request.clientAddress}<br>
      <br>
      <small>
        <p><em>Cette demande a été générée automatiquement via SourceBot.</em></p>
        <p>Vous ne souhaitez pas recevoir de telles demandes? 
        <a href="https://${process.env.APP_URL}/unsubscribe?email=${encodeURIComponent(company.email)}">
        Cliquer ici pour vous désinscrire</a>.</p>
      </small>
    `;

    return { subject, html };
  }

  /**
   * Envoyer batch d'emails (planning)
   */
  async sendBatch(companies, request, delayBetweenMs = 30000) {
    logger.info('Starting email batch', {
      count: companies.length,
      delayMs: delayBetweenMs,
    });

    const results = [];

    for (let i = 0; i < companies.length; i++) {
      const company = companies[i];

      try {
        const result = await this.sendQuoteRequest(company, request);
        results.push({ company: company.name, result });
      } catch (error) {
        results.push({ company: company.name, error: error.message });
      }

      // Délai entre emails
      if (i < companies.length - 1) {
        await new Promise((r) => setTimeout(r, delayBetweenMs));
      }
    }

    logger.info('Email batch complete', {
      sent: this.sentCount,
      failed: this.failedCount,
      deliveryRate: `${((this.sentCount / (this.sentCount + this.failedCount)) * 100).toFixed(1)}%`,
    });

    return results;
  }

  /**
   * Valider email avant envoi (SMTP validation optionnel)
   */
  async validateEmail(email) {
    // Format check minimum
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}

module.exports = EmailService;
```

#### 3.5.3 Justification technique

| Choix | Justification |
|-------|---------------|
| **Nodemailer** | Multiprotocole (SMTP, SendGrid API), fiabilité reconnue, logging facile |
| **Mailjet comme défaut (prod)** | Délivrabilité certifiée, RGPD compliant, affordable ($15/mois) |
| **Personnalisation HTML** | Professionnel, branding, meilleure open rate |
| **Délai 30s entre emails** | Évite throttling, respecte SPF limits (Gmail: 500/jour) |
| **Batch processing** | Scalable, permet pauses, retry logic |
| **Opt-out link** | RGPD compliance, meilleure reputation sender |

#### 3.5.4 Quota et limits

```
Gmail SMTP (direct):
  - 500 emails/jour max
  - 100 recipients max per email
  
Mailjet SMTP:
  - 200 emails/jour (gratuit)
  - Illimité (payant)
  
Impact:
  - 100 entreprises × 30s délai = 50 min batch
  - Peut être lancé en background (job queue)
```

---

### 3.6 Module Email - Réception (IMAP)

#### 3.6.1 Objectives
- Lire automatiquement réponses par email
- Parser contenu & pièces jointes
- Matcher replies avec entreprises

#### 3.6.2 Implémentation

```javascript
// src/services/ImapService.js
const Imap = require('imap');
const { simpleParser } = require('mailparser');
const logger = require('../config/logger');

class ImapService {
  constructor(config) {
    this.imap = new Imap({
      user: config.user,
      password: config.password,
      host: config.host,  // imap.gmail.com, in.mailjet.com
      port: config.port || 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
    });
  }

  /**
   * Connecter et sync mails (cron toutes les 3h)
   */
  async sync() {
    return new Promise((resolve, reject) => {
      this.imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          logger.error('IMAP box open error', { error: err.message });
          return reject(err);
        }

        logger.info('IMAP connected', { totalMessages: box.messages.total });

        // Chercher emails non-lus
        this.imap.search(['UNSEEN'], (err, results) => {
          if (err) return reject(err);

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
                logger.error('Parse error', { error: err });
                return;
              }

              try {
                const emailData = await this.parseEmail(parsed);
                emails.push(emailData);

                // Marquer comme lu
                this.imap.addFlags(results, '\\Seen', () => {});
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
   * Parser un email reçu
   */
  async parseEmail(parsed) {
    const from = parsed.from.text;
    const subject = parsed.subject;
    const text = parsed.text || '';
    const html = parsed.html || '';
    const attachments = parsed.attachments || [];

    logger.info('Email parsed', {
      from: from.slice(-8),  // Masquer
      subject,
      attachmentCount: attachments.length,
    });

    return {
      from,
      subject,
      text,
      html,
      attachments: attachments.map((att) => ({
        filename: att.filename,
        size: att.size,
        content: att.content,  // Buffer
      })),
      receivedAt: new Date(),
    };
  }

  /**
   * Matcher email reply vers entreprise
   */
  async matchEmailToCompany(email, companies) {
    // Extraire domaine email sender
    const senderDomain = email.from.split('@')[1];
    const senderEmail = email.from;

    // Chercher company avec même domain ou email
    let matchedCompany = companies.find(
      (c) => c.email === senderEmail ||
             c.website?.includes(senderDomain)
    );

    if (!matchedCompany && email.subject.includes('Re:')) {
      // Chercher dans subject line (ex. "[DEVIS] Company Name")
      const nameMatch = email.subject.match(/\[.*?\]\s*(.+?)(?:\s*-|$)/);
      if (nameMatch) {
        const name = nameMatch[1];
        matchedCompany = companies.find((c) =>
          c.name.toLowerCase().includes(name.toLowerCase())
        );
      }
    }

    return matchedCompany;
  }

  /**
   * Scheduler : sync toutes les 3 heures
   */
  startScheduler(companies, storageService) {
    const syncInterval = 3 * 60 * 60 * 1000;  // 3 heures

    setInterval(async () => {
      try {
        logger.info('IMAP sync started');
        const emails = await this.sync();

        for (const email of emails) {
          const company = await this.matchEmailToCompany(email, companies);

          if (company) {
            logger.info('Email matched to company', {
              company: company.name,
            });

            // Parser devis & sauvegarder
            // (voir section 3.7)
          } else {
            logger.warn('Email could not be matched', { from: email.from });
          }
        }
      } catch (error) {
        logger.error('IMAP sync failed', { error });
      }
    }, syncInterval);

    logger.info('IMAP scheduler started', { intervalHours: 3 });
  }
}

module.exports = ImapService;
```

#### 3.6.3 Justification technique

| Choix | Justification |
|-------|---------------|
| **IMAP (pas POP3)** | Conserve mails sur serveur, permet resurface, sync multi-clients |
| **Cron 3h** | Bon équilibre latency (réponse dans 3h) vs serveur impact |
| **simpleParser** | Parse complet (text/HTML/attachments) en une fonction |
| **Matching par domain** | Fiable, email validation intégrée |
| **Flag SEEN** | Évite doubles processing |

---

### 3.7 Module Quote Parser - Extraction Devis

#### 3.7.1 Objectives
- Extraire données structurées depuis email/PDF
- Patterns: prix, MOQ, délai, incoterms
- Stocker résultats

#### 3.7.2 Implémentation brève

```javascript
// src/services/QuoteParserService.js
const pdf = require('pdf-parse');
const logger = require('../config/logger');

class QuoteParserService {
  constructor() {
    this.patterns = {
      price: /(?:price|tarif|€|eur|usd|\$)[\s:]*([0-9,.\s]+)/gi,
      moq: /(?:moq|min|minimum|qty)[\s:]*([0-9]+)/gi,
      delay: /(?:delay|délai|livraison|jours?)[\s:]*([0-9]+)\s*(?:jours|days|j)?/gi,
      incoterms: /(?:exw|fob|cif|cpt|dap|dpu|ddp)/gi,
    };
  }

  /**
   * Parser email (texte + PDF)
   */
  async parseQuoteEmail(email) {
    let fullText = email.text || '';

    // Parser PDFs s'il existe
    if (email.attachments.length > 0) {
      for (const att of email.attachments) {
        if (att.filename.endsWith('.pdf')) {
          try {
            const pdfText = await this.parsePdf(att.content);
            fullText += '\n' + pdfText;
          } catch (error) {
            logger.warn('PDF parse error', { filename: att.filename });
          }
        }
      }
    }

    // Extract patterns
    const quote = {
      prices: this.extractPrices(fullText),
      moqs: this.extractMoqs(fullText),
      delays: this.extractDelays(fullText),
      incoterms: this.extractIncoterms(fullText),
      rawText: fullText.substring(0, 1000),  // 1K chars
    };

    logger.info('Quote parsed', {
      pricesFound: quote.prices.length,
      moqsFound: quote.moqs.length,
    });

    return quote;
  }

  async parsePdf(buffer) {
    const data = await pdf(buffer);
    return data.text;
  }

  extractPrices(text) {
    const matches = [...text.matchAll(this.patterns.price)];
    return matches.map((m) => {
      const value = m[1].replace(/[,.]/g, (c) => (c === ',' ? '.' : ''));
      return parseFloat(value);
    }).filter((v) => v > 0 && v < 1000000);  // Sanity check
  }

  extractMoqs(text) {
    const matches = [...text.matchAll(this.patterns.moq)];
    return matches.map((m) => parseInt(m[1], 10))
      .filter((v) => v > 0 && v < 1000000);
  }

  extractDelays(text) {
    const matches = [...text.matchAll(this.patterns.delay)];
    return matches.map((m) => parseInt(m[1], 10))
      .filter((v) => v > 0 && v < 365);
  }

  extractIncoterms(text) {
    const matches = [...text.matchAll(this.patterns.incoterms)];
    return [...new Set(matches.map((m) => m[0].toUpperCase()))];
  }
}

module.exports = QuoteParserService;
```

---

### 3.8 Module Stockage - Google Sheets & CSV

#### 3.8.1 Structure données

```
Deux sheets dans un classeur Google Sheets:

Sheet "Companies":
┌─────┬──────────────┬────────────┬──────────┬─────────────┬──────┐
│ N° │ Nom          │ Email      │ Site Web │ Téléphone   │ GPS  │
├─────┼──────────────┼────────────┼──────────┼─────────────┼──────┤
│ 1   │ ACME Thermoform │ contact@... │ acme.fr │ +33123... │ ... │
│ 2   │ Thermotech   │ info@...   │ tech.fr  │ +33456... │ ... │
└─────┴──────────────┴────────────┴──────────┴─────────────┴──────┘

Sheet "Quotes":
┌─────┬──────────────┬────────┬──────┬────────┬────────┬──────────┐
│ N° │ Company      │ Price  │ MOQ  │ Delay  │ Status │ Comment  │
├─────┼──────────────┼────────┼──────┼────────┼────────┼──────────┤
│ 1   │ ACME Thermoform │ 15.5  │ 100  │ 10     │ Received │ Rapide  │
└─────┴──────────────┴────────┴──────┴────────┴────────┴──────────┘
```

#### 3.8.2 Implementation

```javascript
// src/services/StorageService.js
const { google } = require('googleapis');
const fs = require('fs/promises');
const path = require('path');
const logger = require('../config/logger');

class StorageService {
  constructor(config) {
    this.config = config;
    this.sheets = null;
    this.spreadsheetId = config.spreadsheetId;
  }

  /**
   * Initialize Google Sheets auth
   */
  async initialize() {
    const sheets = google.sheets({
      version: 'v4',
      auth: new google.auth.GoogleAuth({
        keyFile: path.resolve('config/google-service-account.json'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      }),
    });

    this.sheets = sheets;
    logger.info('Google Sheets connected');
  }

  /**
   * Save companies to Google Sheets
   */
  async saveCompanies(companies) {
    const values = companies.map((c) => [
      c.placeId,
      c.name,
      c.email || 'Not found',
      c.website || 'N/A',
      c.phone || 'N/A',
      c.address,
      c.latitude,
      c.longitude,
      c.rating || 'N/A',
      new Date().toISOString(),
    ]);

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: 'Companies!A:J',
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });

    logger.info('Companies saved', { count: companies.length });
    return true;
  }

  /**
   * Save quotes from parsed emails
   */
  async saveQuotes(companyId, quoteData) {
    const values = [[
      companyId,
      quoteData.prices[0] || 'N/A',
      quoteData.moqs[0] || 'N/A',
      quoteData.delays[0] || 'N/A',
      quoteData.incoterms[0] || 'N/A',
      'Received',
      new Date().toISOString(),
    ]];

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: 'Quotes!A:G',
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });

    logger.info('Quote saved', { companyId });
  }

  /**
   * Export to CSV (local)
   */
  async exportToCsv(sheet, filename) {
    const data = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: sheet,
    });

    const csv = data.data.values
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    await fs.writeFile(filename, csv);
    logger.info('CSV exported', { file: filename });
  }
}

module.exports = StorageService;
```

---

## 4. FLUX DE DONNÉES COMPLET

### 4.1 Parcours d'une requête

```
┌─ Étape 1: Utilisateur remplit formulaire
│  - catégorie: Thermoformage
│  - lieu: France, rayon 300km
│  - description: Pièces plastique complexes
│  - files: [plan.pdf, specs.pdf]
│
├─ Étape 2: Submit → Backend POST /api/search
│  - Validation input
│  - Créer requestor avec ID unique
│
├─ Étape 3: Google Places API search
│  Step 3a: Text Search "thermoformeurs France"
│           → Retourne 20-30 résultats bruts
│
│  Step 3b: Pour chaque résultat, Place Details API
│           → Extrait: name, address, phone, website, GPS
│
│  Step 3c: Multi-Nearby Search (grille 5×5 points, chacun 50km)
│           → Retourne résultats géo-précis
│
│  Step 3d: Déduplication par place_id
│           → Final: 80-150 entreprises uniques
│
├─ Étape 4: Web Scraping (parallèle par batch)
│  Step 4a: Pour chaque website URL
│           → Fetch HTML (10s timeout)
│           → Parse Cheerio
│           → Regex extraction emails
│
│  Step 4b: Si pas email trouvé
│           → Retry /contact, /contact-us, etc.
│
│  Step 4c: Résultat: 60-70% taux succès emails
│
├─ Étape 5: Storage (Google Sheets)
│  - Tous les contacts collectés
│  - Structure: N°, Nom, Email, Site, Tel, GPS
│
├─ Étape 6: Email Sending (batch)
│  Step 6a: Pour chaque email trouvé
│           → Composer email personnalisé
│           → Attacher files utilisateur
│           → Envoyer via Mailjet/Nodemailer
│           → Délai 30s entre chaque
│
│  Step 6b: Logging: Date/status/messageId
│
├─ Étape 7: Scheduler IMAP (toutes les 3h)
│  Step 7a: Se connecter à boîte mail IMAP
│           → Chercher emails nouveaux (UNSEEN)
│
│  Step 7b: Pour chaque réponse
│           → Matcher à company (from, domain, subject)
│           → Parser contenu (regex: prix, MOQ, délai)
│           → Télécharger pièces jointes (PDF devis)
│
│  Step 7c: Update Google Sheets Quotes
│           → Colonne Prix, MOQ, Delay, Status="Received"
│
└─ Étape 8: Résultat final
   Tableau comparatif Google Sheets avec:
   - Toutes les entreprises
   - Devis reçus (prix, délai, etc.)
   - Trier/filtrer/exporter pour decision
```

### 4.2 Timing complet

```
Scénario: 150 entreprises trouvées, rayon 300km

Timing:
- Recherche API Places: 5 min (1 Text + 25 Nearby parallèles)
- Scraping 150 sites: 20 min (batch 10 sites, 3s délai)
- Email sending 120 valides: 60 min (30s délai each)
- IMAP sync (3h cycles): 1-2 min par sync

Total setup (search + scrape + send): ~85 minutes
Puis attendre réponses (24-72h typiquement)
Puis réviser tableau final (30 min humain decision)
```

---

## 5. CONTRAINTES ET SCALABILITÉ

### 5.1 Limitations techniques

#### 5.1.1 Google Places API

```
Limite Nearby Search:
  - Rayon max: 50 km par requête
  - Solution: Créer grille de points
  
  Exemple rayon 300km (France ~100km × 100km):
  Grille 3×3 de requêtes = 9 requêtes Nearby
  Spacing: 300km / 3 = 100km centers
  Chaque requête: 50km radius
  → Couverture complète

Limite Text Search:
  - Max 60 résultats par query (pagination)
  - Solution: Utiliser pageToken
  
Limite Place Details:
  - Fieldsmaximum ~25 fields
  - Solution: Selection fields nécessaires uniquement

Quotas (gratuit):
  - 100K Text Search/mois
  - 100K Nearby Search/mois
  - 200K Place Details/mois
  
  Cost: ~$0.032 / Text ou Nearby, ~$0.017 / Details
  Exemple 200 entreprises = ~$3.75 par search
```

#### 5.1.2 Email limits

```
Gmail SMTP:
  - 500 emails/jour direct
  - Solution: Utiliser Mailjet (pro) ou scheduler multi-jours

Mailjet free:
  - 200 emails/jour
  - Solution: Escalade vers plan payant ($15/mois)

IMAP:
  - Pas de limite hard
  - Risk: Inbox bloat (archive régulièrement)
```

#### 5.1.3 Scraping limits

```
Success rate:
  - 60-70% emails trouvés (meilleur cas)
  - 40-50% (cas réel, sites complexes)
  
Timeout à 10s:
  - Sites lents: discard (pas email = fallback phone)
  - OK pour 95%+ sites

Robots.txt:
  - ~5% sites bloquent scraping
  - Fallback: contact téléphone manuel
```

### 5.2 Scalabilité future

#### 5.2.1 De MVP à production

```
MVP (actuel):
  - Storage: CSV local / Google Sheets
  - DB: Aucune (sheets = DB improvisée)
  - Serveur: Local (VS Code + Node.js)
  - API calls: Ad-hoc, pas de cache

Production (futur):
  - Storage: PostgreSQL/MySQL
  - Cache: Redis (Google Places, scraping)
  - Serveur: Cloud (Heroku, AWS Lambda)
  - Queue: Bull/RabbitMQ (batch jobs)
  - CDN: CloudFlare (uploads/downloads)
```

#### 5.2.2 Architecture extensible

```
Layer Storage abstrait:
  
  Abstract StorageService
      │
      ├── GoogleSheetsStorage (MVP)
      ├── PostgresStorage (v2)
      └── MongoStorage (v3)
  
  Code business: utilise StorageService (interface)
  Switching: 1 ligne config change
```

---

## 6. ENVIRONNEMENT DE DÉVELOPPEMENT

### 6.1 Setup local

```bash
# 1. Prerequisites
- Node.js v18+ LTS
- npm (inclus Node)
- VS Code (editeur recommandé)
- Git

# 2. Clone repo
git clone https://github.com/yourorg/sourcebot.git
cd sourcebot

# 3. Install dependencies
npm install

# 4. Config environment
cp .env.example .env
# Éditer .env: remplir GOOGLE_PLACES_API_KEY, MAILJET_API_KEY, etc.

# 5. Start dev server
npm run dev
# Serveur écoute http://localhost:3000

# 6. Dev tools
npm run lint        # Vérifier style code
npm test           # Runner tests
npm run build      # Build production
```

### 6.2 Dev Containers (optionnel)

**Docker** pour isolation complète:

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

```bash
# Run
docker build -t sourcebot .
docker run -p 3000:3000 -e GOOGLE_PLACES_API_KEY=... sourcebot
```

### 6.3 Déploiement cloud (futur)

#### Heroku (simplest)
```bash
# 1. Login
heroku login

# 2. Create app
heroku create sourcebot-app

# 3. Set env vars
heroku config:set GOOGLE_PLACES_API_KEY=...

# 4. Deploy
git push heroku main

# 5. View logs
heroku logs --tail
```

#### AWS (scalable)
```
API Gateway → Lambda (Node.js)
            → DynamoDB (storage)
            → CloudFront (CDN)
            → SES (email)
```

---

## 7. JUSTIFICATIONS TECHNIQUES RÉCAPITULATIF

| Composant | Choix | Raison |
|-----------|-------|--------|
| **Backend** | Node.js + Express | Écosystème npm riche, courbe apprentissage réxe, communauté large |
| **Frontend** | HTML/CSS/JS vanille | Minimaliste MVP, 0 build step, aisé embarquer |
| **API Places** | Google Places (New) | Couverture mondiale, API stable et documentée |
| **Scraping** | Cheerio | Légèr vs Puppeteer, efficace regex patterns |
| **Queue emails** | Nodemailer → Mailjet | SMTP fiable, délivrabilité certifiée |
| **Recp emails** | IMAP | Standard, moins cher que API dédiées |
| **Storage** | Google Sheets (MVP) | Collaboratif, facile pivot SQL later |
| **Monitoring** | Winston logs | Structured logging, dev/prod agnostic |
| **Testing** | Jest | Standard JS, bonne couverture, snapshots |
| **Version** | Git Flow | Branching clair, CI/CD friendly |

---

## 8. DIAGRAMME RÉSEAU (Déploiement)

```
┌───────────────────────────────────────────────────────────────┐
│                        INTERNET                               │
└──────┬──────────────────────────────┬──────────────────────────┘
       │                              │
┌──────▼──────┐             ┌─────────▼──────────┐
│ User Browser│─────HTTP───▶│ Heroku Dyno        │
└─────────────┘             │ (Node.js/Express)  │
                            └─────────┬──────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
            ┌───────▼──────┐  ┌──────▼────────┐  ┌────▼──────────┐
            │ Google Cloud │  │ Mailjet SMTP  │  │ IMAP Mailbox  │
            │ (Places API) │  │ (send)        │  │ (receive)     │
            └──────────────┘  └───────────────┘  └───────────────┘
                    │
            ┌───────▼──────┐
            │ Google Sheets│
            │ (storage)    │
            └──────────────┘
```

---

## 9. CONCLUSION

L'architecture SourceBot est **modulaire, scalable, et pragmatique** :

✅ **Modulaire** : Chaque service (GooglePlaces, Scraping, Email, Storage) est indépendant
✅ **Scalable** : Passage facile de CSV → DB, local → cloud
✅ **Pragmatique** : Choix tech justifiés, communauté supportée, coûts contrôlés
✅ **Documentée** : Code structure claire, logging exhaustif

**Prochaines étapes** :
1. Implémenter MVP (search + scrape + send)
2. Test réel 50-100 entreprises
3. Itérer sur rates succès (scraping, delivery emails)
4. Ajouter réception/parsing si MVP stable
5. Migration prod (Heroku + Mailjet payant) après validation

---

**Document créé** : 04 Mars 2026  
**Version** : 1.0 (MVP Architecture)  
**Statut** : À valider avec équipe tech

