# SourceBot - Application de Prospection B2B

Application web pour trouver et contacter automatiquement les sous-traitants, extraire des devis et gérer les réponses par email.

## 📋 Table des matières

- [Description](#description)
- [Stack Technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Tests](#tests)
- [Documentation](#documentation)
- [Structure du Projet](#structure-du-projet)

## Description

SourceBot automatise le processus de prospection B2B en :
1. **Recherchant** des entreprises via Google Places API
2. **Extrayant** les emails des sites web (Cheerio scraping)
3. **Envoyant** des demandes de devis par email (Mailjet SMTP)
4. **Recevant** les réponses (IMAP polling)
5. **Parsant** les devis pour extraire les prix, délais, MOQ

## Stack Technique

### Backend
- **Node.js** v18 LTS
- **Express.js** (API REST)
- **Google Places API** (recherche d'entreprises)
- **Cheerio** (scraping web)
- **Nodemailer** (SMTP)
- **Mailjet** (service email fiable)
- **IMAP** (réception emails)
- **Google Sheets API** (stockage MVP)
- **PostgreSQL** (production future)

### DevOps & Qualité
- **Jest** (tests unitaires & intégration)
- **ESLint** (linting)
- **Prettier** (formatage)
- **Winston** (logging)
- **Docker** (containerization)
- **GitHub Actions** (CI/CD)

## Prérequis

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git**
- Comptes/Clés API pour :
  - Google Places API
  - Mailjet
  - Gmail (IMAP/SMTP)
  - Google Sheets API

## Installation

### 1. Cloner le repository
```bash
git clone https://github.com/sourcebot/sourcebot.git
cd sourcebot
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configurer les variables d'environnement
```bash
cp .env.example .env
# Éditer .env avec vos clés API
nano .env
```

### 4. Initialiser la base de données (optionnel pour MVP)
```bash
npm run init:db
```

## Configuration

### Variables d'environnement essentielles

```env
# Google Places API
GOOGLE_PLACES_API_KEY=your_key_here

# Mailjet
MAILJET_API_KEY=key
MAILJET_API_SECRET=secret

# IMAP (Gmail)
IMAP_USER=your_email@gmail.com
IMAP_PASS=app_password

# Port
PORT=3000
NODE_ENV=development
```

### Obtenir les clés API

#### Google Places API
1. Créer un projet sur [Google Cloud Console](https://console.cloud.google.com)
2. Activer "Places API"
3. Créer une clé API
4. Configurer les restrictions

#### Mailjet
1. S'enregistrer sur [Mailjet](https://www.mailjet.com)
2. Récupérer les clés API/Secret
3. Ajouter l'adresse email d'expédition

#### Gmail IMAP
1. Activer [2FA sur le compte](https://myaccount.google.com/security)
2. Générer un [mot de passe d'application](https://myaccount.google.com/apppasswords)
3. Utiliser ce mot de passe pour IMAP_PASS

## Démarrage

### Mode développement (avec rechargement automatique)
```bash
npm run dev
```

### Mode production
```bash
npm start
```

### Avec Docker
```bash
docker build -t sourcebot .
docker run -p 3000:3000 --env-file .env sourcebot
```

L'application sera accessible sur ```http://localhost:3000```

## Tests

### Exécuter tous les tests
```bash
npm test
```

### Mode watch (rechargement automatique)
```bash
npm run test:watch
```

### Couverture de code
```bash
npm run test:coverage
```

### Tests spécifiques
```bash
npm test -- tests/services/GooglePlacesService.test.js
npm test -- --testNamePattern="should search companies"
```

## Linting & Formatage

### Vérifier le code
```bash
npm run lint
```

### Corriger automatiquement
```bash
npm run lint:fix
```

### Formater le code
```bash
npm run format
```

### Vérifier le formatage
```bash
npm run format:check
```

## Documentation

- [Cahier des Charges](./Cahier%20des%20charges.md) - Spécifications complètes
- [Guidelines de Développement](./Guidlines%20de%20developpement.md) - Normes et conventions
- [Architecture Technique](./Architecture.md) - Design système
- [Plan de Développement](./Plan%20de%20developpement.md) - Roadmap détaillée

## Structure du Projet

```
sourcebot/
├── src/
│   ├── app.js                 # Point d'entrée Express
│   ├── controllers/           # Contrôleurs (requêtes HTTP)
│   ├── routes/                # Routes API
│   ├── services/              # Services (logique métier)
│   │   ├── GooglePlacesService.js
│   │   ├── ScrapingService.js
│   │   ├── EmailService.js
│   │   ├── ImapService.js
│   │   ├── QuoteParserService.js
│   │   └── StorageService.js
│   ├── models/                # Modèles de données
│   ├── middleware/            # Middlewares Express
│   └── utils/                 # Utilitaires
├── tests/                     # Tests (Jest)
├── public/                    # Fichiers statiques (HTML, CSS, JS)
├── data/                      # Données (JSON MVP)
├── logs/                      # Fichiers de log
├── .env.example               # Template variables d'env
├── .eslintrc.json             # Configuration ESLint
├── .prettierrc.json           # Configuration Prettier
├── .gitignore                 # Exclusions Git
├── package.json               # Dépendances & scripts
├── docker-compose.yml         # Orchestration Docker
└── README.md                  # Ce fichier
```

## Phases de Développement

1. **Phase 1** : Initialisation (Node.js, Express, Git)
2. **Phase 2** : Intégration Google Places API
3. **Phase 3** : Scraping d'emails (Cheerio)
4. **Phase 4** : Frontend (HTML/CSS/JS)
5. **Phase 5** : Service d'envoi d'emails (SMTP)
6. **Phase 6** : Réception des emails (IMAP polling)
7. **Phase 7** : Parsing des devis
8. **Phase 8** : Tests & Conformité RGPD
9. **Phase 9** : Déploiement
10. **Phase 10** : Optimisations & iterations

Voir [Plan de Développement](./Plan%20de%20developpement.md) pour les détails.

## Conformité RGPD

- ✅ Opt-out obligatoire dans les emails
- ✅ Lien unsubscribe fonctionnel
- ✅ Politique de confidentialité publique
- ✅ Prospection B2B autorisée (intérêt légitime)
- ✅ Données masquées dans les logs
- ✅ Suppression 30 jours après opt-out

Voir [Guidelines de Développement](./Guidlines%20de%20developpement.md#conformité-rgpd) pour la mise en œuvre.

## Support & Contribution

Pour des questions ou des contributions :
1. Ouvrir une issue
2. Créer une branche feature
3. Soumettre une pull request

## Licence

MIT - Voir [LICENSE](./LICENSE) pour plus d'infos

## Planning Estimé

**Équipe** : 1 développeur  
**Durée** : 8-10 semaines  
**MVP** : Phases 1-9  
**Production** : Phases 1-10

---

**Dernière mise à jour** : Mars 2026  
**Version** : 1.0.0-ready
