# DIRECTIVES DE DÉVELOPPEMENT
## Projet SourceBot - Application Web de Mise en Relation avec des Sous-Traitants

---

## 1. INTRODUCTION

Ce document établit les normes, bonnes pratiques et règles de développement à respecter pour garantir la **qualité**, la **maintenabilité** et la **conformité légale** du projet SourceBot.

**Périmètre** : S'applique à tous les contributeurs et à tout le code produit (frontend, backend, configurations, documentation).

**Objectif** : Fournir une référence unique pour l'équipe de développement, alignée sur les contraintes du cahier des charges et les exigences de sécurité/conformité légale.

---

## 2. MÉTHODOLOGIE DE PROJET

### 2.1 Cadre de travail : Agile SCRUM Allégé

#### 2.1.1 Principes directeurs
- **Sprint de 1-2 semaines** : découpage du travail en itérations courtes et planifiées
- **Autonomie équipe** : chaque développeur priorise ses tâches selon backlog validé
- **Communication fréquente** : réunions sync brèves, asynchrones si nécessaire
- **Documentation vivante** : mise à jour en continu des docs (pas en fin de projet)

#### 2.1.2 Cadence de réunions

| Réunion | Fréquence | Durée | Participants | Agenda |
|---------|-----------|-------|--------------|--------|
| **Kick-off Sprint** | Lundi 10h | 30 min | Équipe dev + PM | Objectifs sprint, stories, priorités |
| **Daily Stand-up** | Lun-Ven 9h30 | 15 min | Équipe dev | Blocker, avancement, plan jour |
| **Planning Technique** | Mercredi 14h | 45 min | Tech Lead + Dev | Architecture, choix tech, revue code |
| **Démo/Retrospective** | Vendredi 16h | 60 min | Équipe + stakeholders | Démo features, feedback, retours |

#### 2.1.3 Gestion des tickets

**Outil** : GitHub Projects (gratuit, intégré Git) ou Jira (si équipe large)

**Cycle de vie ticket** :
```
Backlog → À faire → En cours → En review → Testé → Fermé
```

**Structure ticket minimum** :
- **Titre** : clair et actionnable (ex. "Implémenter scraping emails avec Cheerio")
- **Description** : contexte, acceptation criteria, liens docs
- **Étiquettes** : feature/bug/documentation, priorité (haute/normale/basse)
- **Assigné** : responsable du ticket
- **Estimation** : taille story points (1, 2, 3, 5, 8) ou temps (3h, 8h, 1j)
- **Lien PR** : référencer la pull request Git

**Exemple ticket** :
```
Titre: Extraire automatiquement emails via scraping
Description:
  Contexte: Certains établissements n'exposent pas leur email dans Google Places API
  Tâche: Implémenter script Node.js Cheerio pour scraper les mails des sites web
  Critères acceptation:
    □ Scraping fonctionne sur 10 sites de test
    □ Gestion erreurs (timeout, robots.txt) implémentée
    □ Tests unitaires couvrent 70%+ du code
    □ Logs détaillés en cas d'erreur
  Priorité: Haute
  Estimation: 5 points (2 jours)
  Bloqueurs: Aucun
```

---

### 2.2 Maintenance de la Documentation

#### 2.2.1 Documents obligatoires
Chaque document doit être à jour à la fin de chaque sprint :

| Document | Responsable | Fréquence | Contenu |
|----------|-------------|-----------|---------|
| **Cahier des Charges** | PM | Chaque sprint (bug fixes) | Specs fonctionnelles, contraintes |
| **Architecture.md** | Tech Lead | À chaque changement archi | Diagrammes, composants, flux |
| **Guidelines dev** (ce document) | Tech Lead | Chaque trimestre | Normes, conventions, processus |
| **README.md du code** | Développeur | À chaque merge | Dépendances, setup local, run app |
| **Code Comments** | Développeur | Lors de commit | Explications code complexe/non-obvie |
| **Changelog** | Développeur | À chaque version | Features/fixes/breaking changes |
| **Procédures déploiement** | DevOps / Tech Lead | À chaque release | Steps production, rollback |

#### 2.2.2 Emplacement et format
- **Format** : Markdown (.md) pour textes, diagrammes Mermaid/PlantUML
- **Versioning** : documentation versionned en Git (branche main)
- **Structure** :
  ```
  /docs
  ├── Cahier des charges.md
  ├── Architecture.md
  ├── Guidelines de developpement.md
  ├── README.md
  ├── CHANGELOG.md
  ├── API.md (endpoints documentation)
  ├── DATABASE_SCHEMA.md
  └── DEPLOYMENT.md
  ```
- **Templates** : créer des headers standardisés (voir annexe 9.1)

#### 2.2.3 Outils de documentation
- **Diagrammes architecture** : Mermaid.js (inclus dans GitHub)
  ```mermaid
  graph TD
    A[Frontend] -->|HTTP| B[Backend Express]
    B -->|API| C[Google Places]
    B -->|Parse| D[Cheerio]
  ```
- **API Docs** : générer via Swagger/OpenAPI (optionnel, pour API REST)
- **Code documentation** : JSDoc pour JavaScript (voir section 3.2.3)

---

## 3. CONVENTIONS DE CODE

### 3.1 Choix du langage et environnement

#### 3.1.1 Stack tech imposée
- **Backend** : JavaScript (Node.js v18 LTS +)
- **Frontend** : HTML5, CSS3, JavaScript ES6+
- **Runtime** : Node.js (non-negotiable)
- **Package Manager** : npm (ou yarn si préférence unanime)
- **Gestionnaire versions** : Git + GitHub

#### 3.1.2 Rationale
- **Node.js** : écosystème riche (modules npm), communauté large, développement rapide
- **JavaScript** : même langage frontend/backend = moins de contexte switch
- **npm** : gestionnaire standard, lock files pour reproducibilité
- **Git** : contrôle versions décentralisé, collaboration, CI/CD

---

### 3.2 Style de code et linting

#### 3.2.1 Configuration ESLint

**Fichier : `.eslintrc.json`**
```json
{
  "env": {
    "node": true,
    "es2021": true
  },
  "extends": [
    "eslint:recommended"
  ],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "no-console": ["warn", { "allow": ["warn", "error", "info"] }],
    "no-var": "error",
    "prefer-const": "error",
    "eqeqeq": ["error", "always"],
    "curly": "error",
    "semi": ["error", "always"],
    "quotes": ["error", "single"],
    "indent": ["error", 2],
    "max-len": ["warn", { "code": 100 }]
  }
}
```

**Installation** :
```bash
npm install --save-dev eslint eslint-config-airbnb-base eslint-plugin-import
```

#### 3.2.2 Formatage avec Prettier

**Fichier : `.prettierrc.json`**
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always",
  "printWidth": 100,
  "tabWidth": 2
}
```

**Script npm** :
```json
{
  "scripts": {
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix && prettier --write src/",
    "format": "prettier --write src/"
  }
}
```

**Pre-commit hook** (optionnel mais recommandé) :
```bash
npm install --save-dev husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npm run lint:fix"
```

#### 3.2.3 Conventions de nommage

| Type | Convention | Exemple |
|------|----------|---------|
| **Variables** | camelCase | `userEmail`, `googleApiKey` |
| **Constantes** | UPPER_SNAKE_CASE | `MAX_RETRIES`, `DEFAULT_TIMEOUT` |
| **Fonctions** | camelCase, descriptive | `fetchCompanies()`, `parseEmailFromHtml()` |
| **Classes** | PascalCase | `GooglePlacesService`, `EmailController` |
| **Files** | kebab-case (dossiers), PascalCase (classes) | `email-service.js`, `EmailService.js` |
| **Booleans** | is/has prefix | `isValid`, `hasError` |
| **Callbacks** | onAction pattern | `onSuccess`, `onError`, `onRetry` |

#### 3.2.4 Commentaires et JSDoc

**Commentaires code** :
```javascript
// Récupérer les entreprises via Google Places API Text Search
// Ne retourner que les résultats avec site web (probabilité email plus haute)
const companies = await googlePlaces.textSearch({
  query: category,
  openNow: true, // Priorité : entreprises actuellement ouvertes
});

// ⚠️ Limitation Google Places : max 20 résultats par requête
// Solution : paginer avec pageToken (voir API docs)
```

**JSDoc pour fonctions importantes** :
```javascript
/**
 * Scrape l'adresse email d'une entreprise à partir de son site web
 * @async
 * @param {string} websiteUrl - URL du site (ex. https://example.com)
 * @param {number} timeoutMs - Timeout en millisecondes (défaut: 10000)
 * @returns {Promise<string|null>} Email trouvé ou null si non trouvé
 * @throws {Error} En cas d'erreur réseau ou parsing
 * @example
 *   const email = await scrapeEmail('https://example.com', 10000);
 *   console.log(email);  // contact@example.com
 */
async function scrapeEmail(websiteUrl, timeoutMs = 10000) {
  // Implémentation
}
```

#### 3.2.5 Structure fichier Node.js

**Pattern recommandé (Express app)** :
```javascript
/* ====================================
   /src/app.js - Express app setup
   ==================================== */
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const searchRoutes = require('./api/routes/search');
const errorHandler = require('./api/middleware/errorHandler');

const app = express();

// Middleware sécurité
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/search', searchRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Not Found' }));

// Error handler (doit être DERNIER middleware)
app.use(errorHandler);

module.exports = app;
```

---

### 3.3 Gestion des versions avec Git

#### 3.3.1 Git Flow : branching strategy

**Modèle de branches** :
```
main (production)
 ├── release/v1.0.0 (préparation release)
 └── develop (développement)
      ├── feature/search-api (nouvelles features)
      ├── feature/email-scraping
      ├── bugfix/timeout-handling (bugs)
      └── hotfix/critical-crash (fixes urgentes prod)
```

**Règles branching** :

1. **Branche `main`** :
   - Contient le code de production prêt à déployer
   - Taggé avec numéro version (v1.0.0, v1.0.1)
   - Accès restreint (merge via PR avec review obligatoire)
   - Protégé : builds CI/CD et tests doivent passer

2. **Branche `develop`** :
   - Branche d'intégration (contient les dernières features)
   - À jour à la fin chaque sprint
   - Merge de branche feature → PR review requise

3. **Branche `feature/*`** :
   - Créée depuis `develop` : `git checkout -b feature/email-scraping develop`
   - Nom descriptif : `feature/[nom-feature-kebab-case]`
   - Une feature = une branche
   - Lifetime : 1-5 jours (durée sprint)
   - Merge via PR avec ≥1 review avant

4. **Branche `bugfix/*`** et `hotfix/*`** :
   - Bugfix : créée depuis `develop`, non-urgent
   - Hotfix : créée depuis `main`, urgent (crash production)
   - Format : `bugfix/[description-kebab-case]`, ex. `hotfix/csrf-vulnerability`

#### 3.3.2 Workflow Git typique

```bash
# 1. Créer branche feature locale
git checkout -b feature/email-scraping develop

# 2. Faire des commits réguliers et clairs
git add src/services/scrapeService.js
git commit -m "feat: implémenter scraping d'emails avec Cheerio

- Utiliser regex pour détecter addresses email
- Gérer timeout 10s par site
- Logger erreurs en fichier"

# 3. Verifier code avant push
npm run lint:fix
npm test

# 4. Push branche remote
git push origin feature/email-scraping

# 5. Créer Pull Request sur GitHub (ne pas merge soi-même)
# → Attendre review + approbation
# → Résoudre commentaires review
# → Rebaser sur develop si nécessaire

# 6. Merger PR via GitHub UI (bouton Merge)
# Après merge : 
git checkout develop
git pull origin develop
git branch -d feature/email-scraping
```

#### 3.3.3 Message de commit

**Format 7** :
```
<type>: <sujet> (max 50 chars)

<corps (72 chars max par ligne, optionnel)>

<footer (ex. fixes #123)>
```

**Types valides** :
- `feat` : nouvelle feature
- `fix` : correction bug
- `docs` : mise à jour documentation
- `style` : formatage (espaces, semicolons)
- `refactor` : restructuration code (pas change behavior)
- `perf` : optimisation performance
- `test` : ajout/modification tests
- `chore` : dépendances, tooling

**Exemples** :
```
feat: ajouter scraping d'emails via Cheerio

Implémenter fonction scrapeEmail() qui:
- Effectue requête HTTP GET sur le site
- Parse HTML avec Cheerio
- Recherche pattern regex email
- Gère timeouts et erreurs réseau

Fixes #42

---

fix: corriger timeout IMAP à 30s

Augmenter timeout par défaut de 10s à 30s pour email très lents
Ajoute log d'avertissement si timeout approchée

---

docs: documenter API Google Places

Ajouter exemples requêtes Text Search, Nearby Search, Details
```

#### 3.3.4 Pull Requests (Code Review)

**Template PR** (fichier `.github/pull_request_template.md`) :
```markdown
## Description
Brève description du changement.

## Type de PR
- [ ] Feature nouvelle
- [ ] Bug fix
- [ ] Documentation
- [ ] Refactoring

## Checklist
- [ ] Code lint passe (eslint --fix)
- [ ] Tests écrits/passent
- [ ] Documentation mise à jour
- [ ] Aucune clé API hardcodée
- [ ] Compatible Node.js v18+

## Screenshots (si UI change)
[Ajouter screenshots si applicable]

## Lien issue
Closes #123
```

**Critères review** :
- ✅ Code lint passe
- ✅ Tests unitaires > 60% coverage
- ✅ Pas de hardcoding clés API/secrets
- ✅ Performance acceptable (< 10% slow)
- ✅ Documentation/comments clairs
- ✅ Pas de dépendances obsolètes
- ✅ Error handling présent (try/catch, null checks)

**Approbation** :
- Minimum 2 reviewers : 1 tech lead + 1 peer
- Tech lead peut approuver unilatéralement pour fixes urgentes
- 24h délai review (SLA) avant merge optionnel

---

## 4. GESTION DES DONNÉES ET SECRETS

### 4.1 Variables d'environnement

#### 4.1.1 Format et stockage

**Fichier : `.env.example`** (versioned, pas secret)
```bash
# ========== Google API ==========
GOOGLE_PLACES_API_KEY=your_api_key_here
GOOGLE_SHEETS_API_KEY=your_api_key_here
GOOGLE_OAUTH_CLIENT_ID=your_client_id_here
GOOGLE_OAUTH_CLIENT_SECRET=your_secret_here

# ========== Email Configuration ==========
EMAIL_SERVICE=mailjet  # ou sendgrid, nodemailer
MAILJET_API_KEY=your_mailjet_key_here
MAILJET_SECRET_KEY=your_mailjet_secret_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=sender@company.com
SMTP_PASSWORD=app_password_here
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=receiver@company.com
IMAP_PASSWORD=app_password_here

# ========== App Configuration ==========
NODE_ENV=development  # development, staging, production
APP_PORT=3000
APP_URL=http://localhost:3000
LOG_LEVEL=info  # debug, info, warn, error
CORS_ORIGIN=http://localhost:3000

# ========== Database ==========
DATABASE_TYPE=googlesheets  # ou sqlite, postgres
GOOGLE_SHEETS_ID=your_sheet_id_here
SQLITE_PATH=./data/app.db

# ========== Security ==========
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
ENCRYPTION_KEY=your_encryption_key_here
```

**Fichier : `.env`** (NOT versioned, .gitignore)
```bash
# Copie .env.example et remplir avec vraies valeurs
GOOGLE_PLACES_API_KEY=AIzaSyB1P...
MAILJET_API_KEY=ab123cd456...
```

**Fichier : `.gitignore`**
```
# Environment
.env
.env.local
.env.*.local

# Secrets
keys/
secrets/
*.key
*.pem

# etc...
node_modules/
dist/
.DS_Store
```

#### 4.1.2 Accès variables en code

**Pattern recommandé** :
```javascript
// src/config/env.js
module.exports = {
  // Google APIs
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY,
  googleSheetsApiKey: process.env.GOOGLE_SHEETS_API_KEY,
  
  // Email
  emailService: process.env.EMAIL_SERVICE || 'nodemailer',
  mailjetApiKey: process.env.MAILJET_API_KEY,
  smtpHost: process.env.SMTP_HOST,
  
  // App
  nodeEnv: process.env.NODE_ENV || 'development',
  appPort: parseInt(process.env.APP_PORT, 10) || 3000,
  
  // Validation
  isProduction: () => process.env.NODE_ENV === 'production',
  isDevelopment: () => process.env.NODE_ENV === 'development',
};

// Utilisation partout
const { googlePlacesApiKey, appPort } = require('./config/env');
```

**Validation au startup** :
```javascript
// src/config/validateEnv.js
const requiredVars = [
  'GOOGLE_PLACES_API_KEY',
  'EMAIL_SERVICE',
  'NODE_ENV',
];

function validateEnv() {
  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Variables env manquantes: ${missing.join(', ')}`);
  }
  console.info('✓ Variables d\'env validées');
}

module.exports = validateEnv;

// En server.js
const validateEnv = require('./config/validateEnv');
validateEnv();
```

#### 4.1.3 Rotation des secrets

**Procédure mensuelle** :
1. Régénérer clé API Google Places (Dashboard Cloud Console)
2. Régénérer token Mailjet (Mailjet Dashboard)
3. Mettre à jour `.env` local
4. Redéployer si production
5. Documenter rotation en log

---

### 4.2 Protection des données sensibles

#### 4.2.1 Que cacher absolument

| Information | Stockage | Justification |
|------------|----------|--------------|
| Clés API (Google, Mailjet) | `.env` local | Pub = abusive API usage |
| Mots de passe SMTP/IMAP | `.env` local | Accès email compromis |
| JWT Secret | `.env` local | Session forgery impossible |
| Tokens OAuth | `.env` + DB encrypted | Accès utilisateur compromis |
| Données personnelles (email, tel) | Chiffré en DB | RGPD compliance |
| Historique API calls | Logs limités | Prévention dump accidentel |

#### 4.2.2 Chiffrement données personnelles

**Librairie** : `crypto` (Node.js natif) ou `bcryptjs`

```javascript
// src/utils/encryption.js
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ALGORITHM = 'aes-256-cbc';

function encryptData(data) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decryptData(encryptedData) {
  const [iv, encrypted] = encryptedData.split(':');
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(iv, 'hex')
  );
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = { encryptData, decryptData };
```

**Utilisation** :
```javascript
const { encryptData, decryptData } = require('./utils/encryption');

// Avant stock
const encryptedEmail = encryptData(company.email);
company.email = encryptedEmail;

// Après récupération
const decryptedEmail = decryptData(company.email);
```

#### 4.2.3 Audit et monitoring

**Logs sensibles** :
- ❌ Ne JAMAIS logger clés API en entier
- ✅ Logger première/dernière 4 caractères : `API_KEY: AIzaSy...****`
- ✅ Logger acceptions/refus requêtes API
- ✅ Logger tentatives email invalides

```javascript
// Bon
logger.info(`Mail envoyé à contact@...${email.slice(-8)}`);

// Mauvais
logger.warn(`Google API Key: ${GOOGLE_PLACES_API_KEY}`);
```

---

## 5. TESTS ET FIABILITÉ

### 5.1 Stratégie de tests

#### 5.1.1 Niveaux de tests

| Niveau | Scope | Exemple | Coverage |
|--------|-------|---------|----------|
| **Unitaire** | Fonction isolée | `parseEmail('text')` → 'email@example.com' | 70-80% |
| **Intégration** | Plusieurs modules | `scrapingService + storageService` | 40-50% |
| **E2E** | Workflow complet | Formulaire → recherche → envoi email → tableau | 20-30% |
| **Manuel** | Interface utilisateur | Cliquer boutons, vérifier UI | Spot checks |

**Objectif total : ≥ 60% code coverage (priorité sur fonctions critiques)**

#### 5.1.2 Framework de tests : Jest

**Installation** :
```bash
npm install --save-dev jest @testing-library/node
```

**Configuration : `jest.config.js`**
```javascript
module.exports = {
  testEnvironment: 'node',
  coveragePathIgnorePatterns: ['/node_modules/'],
  collectCoverageFrom: ['src/**/*.js', '!src/**/*.test.js'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 50,
      functions: 60,
      lines: 60,
    },
  },
};
```

**Script npm** :
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

#### 5.1.3 Exemples tests unitaires

**Test scraping** :
```javascript
// src/services/__tests__/scrapeService.test.js
const { scrapeEmail } = require('../scrapeService');

describe('scrapeService', () => {
  describe('scrapeEmail()', () => {
    it('devrait retourner email si trouvé sur le site', async () => {
      const email = await scrapeEmail('https://example.com');
      expect(email).toBe('contact@example.com');
    });

    it('devrait retourner null si email non trouvé', async () => {
      const email = await scrapeEmail('https://no-email-site.com');
      expect(email).toBeNull();
    });

    it('devrait timeout après 10s par défaut', async () => {
      const promise = scrapeEmail('https://very-slow-site.com', 1000);
      await expect(promise).rejects.toThrow('Timeout');
    });

    it('devrait respecter robots.txt', async () => {
      const mockIsAllowed = jest.fn().mockReturnValue(false);
      jest.mock('../utils/robotsParser', () => ({ isAllowed: mockIsAllowed }));
      
      const email = await scrapeEmail('https://blocked-site.com');
      expect(email).toBeNull();
      expect(mockIsAllowed).toHaveBeenCalled();
    });
  });
});
```

**Test API** :
```javascript
// src/api/routes/__tests__/search.test.js
const request = require('supertest');
const app = require('../../app');

describe('POST /api/search', () => {
  it('devrait retourner liste entreprises', async () => {
    const response = await request(app)
      .post('/api/search')
      .send({
        category: 'thermoformage',
        country: 'France',
        radius: 100,
      });
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.companies)).toBe(true);
    expect(response.body.companies.length).toBeGreaterThan(0);
  });

  it('devrait valider input', async () => {
    const response = await request(app)
      .post('/api/search')
      .send({ category: '' }); // Invalide
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });
});
```

#### 5.1.4 Test manuel checklist

À tester manuellement avant chaque release :

```
Formulaire:
☐ Remplir tous les champs requis
☐ Upload fichiers (PDF, images, ZIP)
☐ Vérifier validation error si champ vide
☐ Réinitialiser formulaire

Recherche:
☐ Recherche par catégorie simple
☐ Recherche par pays
☐ Recherche par rayon
☐ Vérifier 50+ résultats retournés

Email & Scraping:
☐ Scraping: emails trouvés sur 10+ sites
☐ Envoi email: réception confirmée
☐ Réception réponse: parsing correct
☐ Pièces jointes: transfert ok

Tableau devis:
☐ Trier par colonne (prix, délai)
☐ Filtrer par statut
☐ Exporter CSV/PDF
☐ Calculer total estimé
```

---

### 5.2 Logging et monitoring

#### 5.2.1 Logger structure

**Librairie** : `winston` (production) ou `console` (développement)

**Installation** :
```bash
npm install winston
```

**Configuration : `src/config/logger.js`**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'sourcebot' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = logger;
```

#### 5.2.2 Événements à logger

**Toujours logger** :
- ✅ Démarrages/arrêts serveur
- ✅ Appels API (succès + erreurs)
- ✅ Envois/réceptions emails
- ✅ Erreurs non-gérées
- ✅ Authentification (login fail)
- ✅ Accès données sensibles

**Nunca logger** :
- ❌ Clés API (ou masquées)
- ❌ Mots de passe
- ❌ Full email bodies (résumé seulement)
- ❌ Données personnelles complètes

```javascript
// Bon logging
logger.info('Email envoyé', {
  to: 'contact@...om', // Masqué
  subject: '[DEMANDE] Thermoformage',
  attachments: 2,
  timestamp: new Date(),
});

logger.error('Scraping échoué', {
  url: 'https://example.com',
  reason: 'Timeout 10s',
  retryCount: 3,
});
```

#### 5.2.3 Métriques à tracker

| Métrique | Thresholds | Action |
|----------|-----------|--------|
| **Temps réponse API** | < 2s (nominal), < 5s (acceptable) | Alert si > 5s |
| **Erreur scraping** | < 30% | Alert si > 50% |
| **Delivery email** | > 85% | Alert si < 80% |
| **Imap sync** | < 1min | Alert si > 5min |
| **CPU/Mémoire** | < 80% | Scale ou restart |
| **Uptime** | > 99% | Alert si downtime |

---

### 5.3 Gestion des erreurs et timeouts

#### 5.3.1 Try-Catch pattern

```javascript
// Anti-pattern
app.post('/api/search', (req, res) => {
  const result = googlePlaces.search(req.body);  // Peut throw!!!
  res.json(result);
});

// Bon
app.post('/api/search', async (req, res, next) => {
  try {
    const result = await googlePlaces.search(req.body);
    res.json(result);
  } catch (error) {
    logger.error('Erreur recherche', { error });
    next(error);  // Passe à error handler middleware
  }
});
```

#### 5.3.2 Timeouts

```javascript
// Timeout helper
function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    ),
  ]);
}

// Utilisation
try {
  const email = await withTimeout(
    scrapeEmail(url),
    10000  // 10 secondes
  );
} catch (error) {
  if (error.message === 'Timeout') {
    logger.warn(`Scraping timeout: ${url}`);
    // Fallback: utiliser téléphone ou marquer "Non trouvé"
  }
}
```

#### 5.3.3 Retry logic

```javascript
// Retry avec backoff exponentiel
async function retry(fn, maxRetries = 3, delayMs = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      
      const delay = delayMs * (2 ** attempt); // 1s, 2s, 4s
      logger.info(`Retry ${attempt + 1}/${maxRetries} après ${delay}ms`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

// Usage
const companies = await retry(
  () => googlePlaces.textSearch(query),
  3,
  1000
);
```

#### 5.3.4 Global error handler

```javascript
// src/api/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  logger.error('Erreur non-gérée', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Erreur serveur. Contactez support.'
    : err.message;

  res.status(statusCode).json({
    error: message,
    traceId: req.id,  // Pour débug support
  });
};

module.exports = errorHandler;
```

---

## 6. RGPD ET ÉTHIQUE

### 6.1 Prospection B2B autorisée

#### 6.1.1 Base juridique : Intérêt légitime

**En B2B, la prospection est autorisée sous l'exception "intérêt légitime"** :
- ✅ Contacter entreprises/sociétés pour proposer services
- ✅ Utiliser données de sources publiques (Google Places, Annuaires)
- ✅ Pas de consentement préalable requise (contrairement B2C)

**Attention** :
- ⚠️ Ne s'applique PAS aux particuliers (même s'ils dirigent une entreprise)
- ⚠️ Contacte emails perso ≠ autorisé (contact prof ok)
- ⚠️ Démarchage excessif = abusif légalement

#### 6.1.2 Transparence obligatoire

Chaque email DOIT incluire :

**1. Identité entreprise** :
```
De la part de : [Nom Entreprise]
Adresse : [Rue, CP, Ville, Pays]
```

**2. Objet clair** (pas de tromperie) :
```
✅ [DEMANDE DE DEVIS] Thermoformage - [Votre Entreprise]
❌ "URGENT: Important information for you"
```

**3. Lien opt-out explicite** (en bas email) :
```
Vous ne souhaitez pas recevoir d'emails similaires?
[Cliquer ici pour vous désinscrire](https://app.sourcebot.fr/unsubscribe?email=...)

ou répondre "STOP" à cet email.
```

#### 6.1.3 Liste noire / Opt-out

**Implémentation** :
```javascript
// src/services/emailService.js

const blacklist = new Set();  // stocké en DB en production

async function shouldSendEmail(email) {
  // Vérifier liste noire
  if (blacklist.has(email)) {
    logger.info(`Email ${email} en liste noire, non-envoyé`);
    return false;
  }
  return true;
}

async function addToBlacklist(email) {
  blacklist.add(email);
  // Persister en DB
  await blacklistDB.insert({ email, date: new Date() });
  logger.info(`Email ${email} ajouté liste noire`);
}

// Route unsubscribe
app.get('/unsubscribe', async (req, res) => {
  const { email } = req.query;
  await addToBlacklist(email);
  res.send('Vous avez été désinscrit. Merci.');
});
```

---

### 6.2 Limitation du spam

#### 6.2.1 Bonnes pratiques email

| Practice | Détail |
|----------|--------|
| **Fréquence** | Max 1-2 rounds par semaine; 2-3 relances max |
| **Content** | Professionnel, pertinent, hors "spam keywords" |
| **Subject** | Pas tous caps, pas "!!!!", pas "$$$$", pas "LIMITED TIME" |
| **Signature** | Complète avec adresse physique, tel |
| **Dédoubler** | Vérifier email valide avant envoi (validation SMTP) |

#### 6.2.2 Email reputation

```javascript
// Vérifier adresse email valide (avant envoi)
const nodemailer = require('nodemailer');
const { validate: validateEmail } = require('deep-email-validator');

async function sendEmail(to, subject, body) {
  // Étape 1: Validation format
  if (!to.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    logger.warn(`Email invalide format: ${to}`);
    return { status: 'failed', reason: 'invalid_format' };
  }

  // Étape 2: Skip validation (optionnel, coûteux)
  // const { valid } = await validateEmail({ email: to });
  
  // Étape 3: Envoyer
  try {
    await transporter.sendMail({ to, subject, html: body });
    return { status: 'sent' };
  } catch (error) {
    logger.error(`Email send failed: ${to}`, { error });
    return { status: 'failed', reason: error.message };
  }
}
```

#### 6.2.3 SPF, DKIM, DMARC

**Si hébergement production** : configurer authentifications email :
- **SPF** : authoriser IP serveur à envoyer emails
- **DKIM** : signer emails cryptographiquement
- **DMARC** : politique feedback (reject/quarantine phishing)

Implémentation = configuration DNS (domaine) + serveur SMTP (SendGrid/Mailjet fait automatiquement).

---

### 6.3 Accord avec sous-traitants

**Important** : Les sous-traitants doivent avoir la possibilité de **refuser** le contact.

**Pattern recommandé** :
```
1. Tenter contact email (source: scraping + Google Places)
2. Si email invalide/bounce → fallback téléphone (source: Google Places)
3. Si pas réponse 7 jours → relance (max 2 relances)
4. Log "no reply" et marquer statut "non contactable"
```

---

## 7. SÉCURITÉ ET PERFORMANCES

### 7.1 Sécurité

#### 7.1.1 Sanitisation des inputs

```javascript
// Middleware validation
const Joi = require('joi');

const searchSchema = Joi.object({
  category: Joi.string().required().max(100),
  country: Joi.string().required().max(100),
  radius: Joi.number().min(50).max(3000).required(),
  description: Joi.string().max(5000),
});

app.post('/api/search', (req, res, next) => {
  const { error, value } = searchSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  req.validated = value;
  next();
});
```

#### 7.1.2 Injection SQL / NoSQL protection

```javascript
// ❌ Dangereux
const query = `SELECT * FROM companies WHERE name = '${userInput}'`;

// ✅ Sûr (parameterized)
const query = 'SELECT * FROM companies WHERE name = ?';
db.query(query, [userInput]);
```

#### 7.1.3 XSS protection (si frontend dynamique)

```javascript
// ❌ Dangereux
document.getElementById('result').innerHTML = userInput;

// ✅ Sûr
document.getElementById('result').textContent = userInput;

// Ou utiliser librairie DOMPurify
const DOMPurify = require('dompurify');
const clean = DOMPurify.sanitize(userInput);
```

#### 7.1.4 HTTPS et CORS

```javascript
const helmet = require('helmet');
const cors = require('cors');

app.use(helmet());  // Headers sécurité (CSP, X-Frame-Options, etc.)
app.use(cors({
  origin: process.env.CORS_ORIGIN,  // Whitelist
  credentials: true,
}));
```

#### 7.1.5 Upload fichiers sécurisé

```javascript
const multer = require('multer');
const path = require('path');

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 25 * 1024 * 1024,  // 25MB max
    files: 10,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.png', '.jpg', '.dwg', '.step', '.zip'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (!allowedTypes.includes(ext)) {
      return cb(new Error('Type fichier non autorisé'));
    }
    
    cb(null, true);
  },
});

app.post('/api/upload', upload.array('files', 10), (req, res) => {
  // Fichiers sauvegardés en req.files
  res.json({ files: req.files });
});
```

---

### 7.2 Performance et scalabilité

#### 7.2.1 Caching stratégies

```javascript
// Cache en mémoire (simple)
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600 });  // 1 heure

async function searchCompanies(query) {
  const cacheKey = `search:${query}`;
  
  // Vérifier cache
  const cached = cache.get(cacheKey);
  if (cached) {
    logger.info(`Cache hit: ${cacheKey}`);
    return cached;
  }
  
  // Récupérer via API
  const result = await googlePlaces.textSearch(query);
  cache.set(cacheKey, result);
  return result;
}
```

#### 7.2.2 Rate limiting (anti-abuse)

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,  // 100 requêtes max
  message: 'Trop de requêtes, réessayez plus tard',
});

app.use('/api/', limiter);
```

#### 7.2.3 Compression réponses

```javascript
const compression = require('compression');

app.use(compression());  // Gzip automatique
```

#### 7.2.4 Connection pooling (DB)

```javascript
// Si utilise vraie DB
const { Pool } = require('pg');

const pool = new Pool({
  max: 20,  // 20 connections max
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

#### 7.2.5 Monitoring performance

```javascript
// Middleware timing
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} - ${duration}ms`);
    
    if (duration > 5000) {
      logger.warn(`Requête lente détectée: ${duration}ms`);
    }
  });
  
  next();
});
```

---

### 7.3 Extensibilité future

#### 7.3.1 Structure en couches

```
Actuellement (MVP) :
CSV/Google Sheets (storage)
↓
Demain (Pro) :
PostgreSQL / MongoDB
CloudSQL / Atlas + ORM (Prisma/TypeORM)
```

**Best practice** : Abstraire la couche DB via une interface Service:

```javascript
// src/services/storage/storage.interface.js
class StorageService {
  async getCompanies() {}
  async saveCompany(data) {}
  async getDevis() {}
}

// Implémentation Google Sheets
class GoogleSheetsStorage extends StorageService {
  async getCompanies() { /* Sheet logic */ }
}

// Implémentation future PostgreSQL
class PostgresStorage extends StorageService {
  async getCompanies() { /* SQL query */ }
}

// Factory
function createStorage() {
  if (process.env.STORAGE === 'postgres') {
    return new PostgresStorage();
  }
  return new GoogleSheetsStorage();
}
```

#### 7.3.2 Migration progressives

```javascript
// Exemple: ajouter cache Redis sans changer code
const storage = createStorage();
const cache = new RedisCache();

async function getCompanies() {
  const cached = await cache.get('companies');
  if (cached) return cached;
  
  const data = await storage.getCompanies();
  await cache.set('companies', data, 3600);
  return data;
}
```

---

## 8. QUALITÉ DU SERVICE

### 8.1 Indicateurs clés (KPIs)

#### 8.1.1 Tableau de suivi

| KPI | Cible | Fréquence | Responsable |
|-----|-------|-----------|------------|
| **Uptime** | > 99% | Quotidien | DevOps |
| **Temps réponse API** | < 2s (50e percentile) | Quotidien | Dev |
| **Erreur API** | < 1% | Quotidien | Dev |
| **Scraping success rate** | > 60% | Hebdo | Dev |
| **Email delivery** | > 85% | Hebdo | PM |
| **Coverage tests** | > 60% | À chaque release | QA |
| **Vitesse page** | < 3s first paint | Mensuel | Dev |
| **Satisfaction utilisateur** | > 4/5 | Mensuel | PM |

### 8.1.2 Dashboards

```
Option 1 (MVP) : Google Sheets simples
- Sheet1: Logs erreurs (timestamp, endpoint, status)
- Sheet2: KPIs (formules calculs)

Option 2 (Production) : Grafana + Prometheus
- Real-time metrics
- Alertes auto
- Dashboards visuels
```

---

### 8.2 Processus de release

#### 8.2.1 Checklist pre-release

```
Version 1.0.0 - Release Candidate

Code:
☐ Tous les tests passent (npm test)
☐ Lint passe (npm run lint)
☐ 0 bugs critiques ouverts

Documentation:
☐ CHANGELOG.md mis à jour
☐ README.md reflète state actuel
☐ API docs à jour

Déploiement:
☐ .env production configuré
☐ Database migré (si applicable)
☐ Backups créés
☐ Rollback plan documenté

Sécurité:
☐ Audit dépendances (npm audit)
☐ Pas de secrets en repository
☐ HTTPS/SSL en production

Validation:
☐ Tests manuels complets (voir section 5.1.4)
☐ Environnement staging testé
☐ Stakeholders approuvent

QA:
☐ Régression tests
☐ Performance tests
☐ Compatibility tests
```

#### 8.2.2 Versioning (Semantic Versioning)

Format : `MAJOR.MINOR.PATCH`
- **MAJOR** : breaking changes (incompatibilité)
- **MINOR** : features compatibles (backward-compatible)
- **PATCH** : bug fixes

```
v1.0.0 - Release initial
v1.0.1 - Patch email timeout
v1.1.0 - Feature: scraping amélioré
v2.0.0 - Breaking: nouvelle DB schema
```

#### 8.2.3 Release notes template

```markdown
# Release v1.0.1

**Date** : 2026-03-15

## Nouveautés
- Scraping d'emails via Cheerio (60% success rate)
- Tableau comparatif devis google sheets

## Corrections
- ✓ Fix timeout requête API (issue #42)
- ✓ Fix encoding UTF-8 emails

## Breaking Changes
Aucune

## Migration guide
1. Mettre à jour `.env` (new var: `GOOGLE_SHEETS_ID`)
2. Migrer old CSV → new Sheets format (script fourni)

## Connus Limitées
- Scraping échoue sur sites JavaScript heavy (20% cas)
- Max 200 entreprises par recherche (limitation API Google)

## Contributors
- @alice (feature scraping)
- @bob (bugfix timeout)
```

---

## 9. ANNEXES

### 9.1 Templates documentation

#### 9.1.1 Template FUNCTION (JSDoc)

```javascript
/**
 * [Brève description fonction]
 * 
 * [Description détaillée si complexe]
 * 
 * @async
 * @param {Type} paramName - Description
 * @param {Type} [optionalParam=default] - Description optionnel
 * @returns {Promise<Type>} Description valeur retournée
 * @throws {ErrorType} Description erreur possible
 * @example
 *   const result = await myFunction(param1, param2);
 *   console.log(result);
 */
```

#### 9.1.2 Template FILE (Header fichier)

```javascript
/**
 * @fileOverview Brève description du fichier
 * 
 * Détails : usages principaux, dépendances, exemples
 * 
 * @author Auteur <email>
 * @version 1.0
 * @since 2026-03-04
 */
```

#### 9.1.3 Template PR

Voir section 3.3.4

---

### 9.2 Checklists rapides

#### Developer Daily

```
☐ Rebase sur develop (latest code)
☐ npm install (deps à jour)
☐ Run local dev server
☐ Visual checks: pas d'erreurs console
☐ Push code régulièrement (min 1x/jour)
☐ Review 1 PR teammate avant lunch
☐ Mettre à jour tickets status
```

#### Tech Lead Weekly

```
☐ Revoir 5+ PRs (approuver/suggérer)
☐ Check logs errors (réagir rapidement)
☐ Metrics (KPIs on track?)
☐ Backlog grooming (priorités claires)
☐ 1:1 avec team membres
☐ Document decisions arch
```

---

### 9.3 Ressources utiles

#### Documentation en ligne
- [Express.js Best Practices](https://expressjs.com/)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/security/)
- [Google Places API Docs](https://developers.google.com/maps/documentation/places/web-service)
- [RGPD et CNIL](https://www.cnil.fr/)
- [Mailjet/SendGrid Anti-Spam](https://mailjet.com/email-best-practices)

#### Outils recommandés
- **VS Code Extensions** :
  - ESLint
  - Prettier - Code formatter
  - GitLens
  - Thunder Client (API testing)
  
- **Commandes utiles** :
  ```bash
  npm audit              # Audit sécurité
  npm audit fix          # Fix vulnérabilités
  npm outdated          # Voir dépendances outdated
  npm update            # Update patch versions
  git log --oneline     # Voir commits
  ```

---

### 9.4 Anti-patterns (à ÉVITER)

| ❌ Anti-pattern | 💡 Solution |
|--------------|----------|
| Hardcoder clés API | Utiliser `.env` |
| Logging en prod | Utiliser winston logger |
| Pas de try-catch | Toujours gérer erreurs |
| SQL queries en string | Parameterized queries |
| Commits sans message | Message clair, descriptif |
| Grande branche longue | PR courte, 1-2 jours |
| Pas de tests | Min tests unitaires |
| Dependencies obsolètes | npm audit régulier |
| Emails hardcodés | Config variables |

---

## 10. CONTACTS ET SUPPORT

### Escalade des problèmes

| Problème | First Contact | Si urgent |
|----------|---------------|----------|
| Bug code | Créer issue GitHub | @dev-team Slack |
| Bug sécurité | Email sécurité@company.com | Direct PM |
| Performance | Tech Lead analysis | Alert ops |
| Legal/RGPD | Contact legal team | Board |

### Réunions régulières

- **Lundi 10h** : Sprint Planning
- **Lun-Ven 9h30** : Daily standup
- **Mercredi 14h** : Architecture Review
- **Vendredi 16h** : Démo & Retro
- **Premier jeudi mois** : Security Review (optionnel)

---

## 11. APPROBATION

| Rôle | Responsable | Date | Signature |
|------|-------------|------|-----------|
| Tech Lead | [Nom] | __ / __ / __ | __________ |
| Project Manager | [Nom] | __ / __ / __ | __________ |
| Product Owner | [Nom] | __ / __ / __ | __________ |

---

**Document créé** : 04 Mars 2026  
**Version** : 1.0  
**Prochaine révision** : Fin Mars 2026 (après Sprint 1)  
**Statut** : À valider

