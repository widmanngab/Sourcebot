# CAHIER DES CHARGES
## Application Web de Mise en Relation avec des Sous-Traitants

---

## 1. CONTEXTE ET OBJECTIFS

### 1.1 Présentation générale
Cette application web locale, développée sur VS Code, permet aux utilisateurs de rechercher automatiquement et de contacter des sous-traitants (thermoformeurs, soudeurs, plombiers, etc.) adaptés à leurs besoins spécifiques. L'outil génère une liste d'entreprises qualifiées, collecte leurs coordonnées, envoie automatiquement des demandes de devis, et compile les réponses dans un tableau comparatif pour faciliter la prise de décision.

### 1.2 Utilisateurs cibles
- **Entreprises manufacturières** cherchant à externaliser des prestations
- **Responsables d'approvisionnement** devant sourcer rapidement des prestataires
- **PME/PMI** ayant besoin de services spécialisés ponctuels

### 1.3 Objectifs principaux
- Automatiser la recherche de sous-traitants par catégorie, localisation et compétences
- Collecter les données de contact auprès d'une multitude de sources
- Envoyer des demandes de devis professionnelles et personnalisées
- Centraliser et traiter les réponses reçues dans un tableau récapitulatif

---

## 2. FONCTIONNALITÉS PRINCIPALES

### 2.1 Module 1 : Formulaire de Sélection et Description

#### 2.1.1 Interface utilisateur
L'utilisateur accède à une interface simple et intuitive contenant :

**a) Sélection de la catégorie**
- Liste déroulante des catégories de sous-traitants (thermoformage, soudure, plomberie, menuiserie, électricité, etc.)
- Possibilité d'ajouter/personnaliser des catégories
- Validation obligatoire du champ

**b) Formulaire de description**
- Zone de texte libre permettant la description détaillée de la demande
- Caractères autorisés : jusqu'à 5 000 caractères
- Suggestions automatiques basées sur la catégorie sélectionnée
- Formatage basique (gras, italique, liste à puces) optionnel

**c) Zone de téléchargement de pièces jointes**
- Support des formats : PDF, PNG, JPG, DWG, STEP, IGES, ZIP
- Taille maximale par fichier : 25 MB
- Nombre maximal de fichiers : 10
- Prévisualisation des fichiers uploadés
- Possibilité de supprimer des fichiers avant soumission

#### 2.1.2 Validation et sauvegarde
- Validation côté client (JavaScript) pour les champs obligatoires
- Sauvegarde temporaire des données (localStorage ou cache)
- Messages d'erreur explicites en cas de données invalides
- Confirmation avant la suppression de données

---

### 2.2 Module 2 : Recherche Géographique et Collecte de Données

#### 2.2.1 Paramètres de recherche
L'utilisateur spécifie :

**a) Zone géographique**
- **Option 1** : Sélection d'un pays dans une liste prédéfinie
- **Option 2** : Définition d'un rayon de recherche (de 50 km à 3 000 km)
- **Option 3** : Combinaison : pays + rayon (recherche centrée sur une adresse/code postal)
- Localisation automatique possible via géolocalisation du navigateur (avec consentement)

**b) Périmètre de recherche**
- Rayon minimum : 50 km
- Rayon maximum : 3 000 km
- Suggestion : par défaut 300 km

#### 2.2.2 Utilisation de Google Places API (New)

**Objectif** : Récupérer une liste exhaustive d'entreprises correspondant à la catégorie et à la localisation spécifiées.

**Stratégie de requêtage** :

1. **Text Search (approche principale)**
   - Format de requête : `"[catégorie] en [pays]"` (ex. "thermoformeurs en France", "soudeurs à Lyon")
   - Avantage : couvre des zones illimitées, flou spatial moins strict
   - Limitation : moins précis géographiquement, nécessite post-filtrage

2. **Nearby Search (approche complémentaire)**
   - Rayon d'action : jusqu'à ~50 km maximum (limitation API)
   - Pour les rayons > 50 km : **multiplier les requêtes** en créant une grille de points de recherche
   - Exemple : rayon de 300 km autour d'un point = grille de ~50 requêtes Nearby Search espacées de 50-75 km
   - Avantage : plus de points de contact, données plus précises

**Implémentation recommandée** :
- Combiner Text Search (première passe) + Nearby Search multi-points (raffinement)
- Dédupliquer les résultats par `place_id` API
- Limiter le nombre de résultats à 100-200 par recherche pour éviter les requêtes excessives

#### 2.2.3 Extraction des données (Place Details API)
Pour chaque entreprise trouvée, extraire via l'API Places Details :
- **Nom** de l'entreprise
- **Adresse complète** (rue, code postal, ville, pays)
- **Numéro de téléphone** (national et international)
- **Site web** (URL)
- **Horaires d'ouverture**
- **Note/Avis** (raiting) et nombre d'avis
- **Heures de fermeture** (si fermée)
- **Localisation GPS** (latitude/longitude)
- **Type d'établissement** (siège social, succursale, etc.)
- **Email** si disponible dans l'API (rare, mais possible pour certains établissements)

**Format de réponse stocké** : JSON structuré avec les champs ci-dessus

---

### 2.3 Module 3 : Extraction des Emails par Web Scraping

#### 2.3.1 Objectif
Accéder au site web de chaque entreprise trouvée pour extraire l'adresse email de contact (absent ou rarement disponible dans Google Places API).

#### 2.3.2 Implémentation technique
- **Technologie** : Script Node.js utilisant la librairie **Cheerio**
- **Processus** :
  1. Récupérer l'URL du site web fournie par Google Places API
  2. Effectuer une requête HTTP GET (avec User-Agent approprié) vers le site
  3. Parser le HTML retourné avec Cheerio
  4. Rechercher les patterns d'email :
     - Balises `<a href="mailto:">` 
     - Texte contenant le motif regex : `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`
     - Pages de contact, footer, formulaires de contact
  5. Stocker le(s) email(s) trouvé(s) ou marquer comme "non trouvé"

#### 2.3.3 Gestion des erreurs
- **Site indisponible** : retry jusqu'à 3 fois avec délai exponentiel
- **Timeout** : définir un timeout de 10 secondes par site
- **Email non trouvé** : indiquer "Non trouvé" dans les données et proposer un fallback (contact form, téléphone)
- **Rate limiting** : respecter un délai de 2-5 secondes entre les requêtes pour ne pas surcharger les serveurs

#### 2.3.4 Respect des règles éthiques
- Respecter les `robots.txt` du site
- Mentionner un User-Agent descriptif (ex. "SourceBot/1.0")
- Limiter les requêtes à une seule visite par domaine par session

---

### 2.4 Module 4 : Stockage des Données Collectées

#### 2.4.1 Format de stockage
Deux options au choix :

**Option A : CSV (Comma-Separated Values)**
- Format : fichier .csv texte brut
- Avantage : léger, universel, compatible avec Excel
- Inconvénient : limité pour les mises à jour collaboratives
- Structure recommandée : voir section 2.4.2

**Option B : Google Sheets (via Google Sheets API)**
- Format : feuille de calcul cloud
- Avantage : collaboratif, temps réel, intégrable directement dans l'app
- API : Google Sheets API v4
- Authentification : OAuth 2.0
- Disponibilité : accessible online et offline (sync)

#### 2.4.2 Structure des données
Chaque import génère une feuille/fichier CSV avec les colonnes suivantes :

| Colonne | Type | Description |
|---------|------|-------------|
| **N°** | Integer | Numéro d'ordre (auto-incrémenté) |
| **Nom Entreprise** | String | Nom exact du sous-traitant (provenance : Google Places API) |
| **Catégorie** | String | Catégorie sélectionnée par l'utilisateur |
| **Adresse Complète** | String | Adresse fournaise par Google Places API |
| **Code Postal** | String | Code postal extrait |
| **Ville** | String | Ville d'implantation |
| **Pays** | String | Pays d'implantation |
| **Téléphone** | String | Numéro principal (Google Places API) |
| **Site Web** | URL | Lien vers le site de l'entreprise |
| **Email** | Email | Email extrait par scraping (ou vide si non trouvé) |
| **GPS Latitude** | Float | Coordonnée GPS latitude |
| **GPS Longitude** | Float | Coordonnée GPS longitude |
| **Note Google** | Float | Note moyenne sur Google (0-5) |
| **Nombre d'Avis** | Integer | Nombre d'avis reçus |
| **Statut Email** | Enum | "Trouvé" / "Non trouvé" / "À vérifier" |
| **Date Recherche** | Date | Date/heure de la collecte |

#### 2.4.3 Sécurité et sauvegarde
- Chiffrement des données sensibles (emails, téléphones) au repos
- Sauvegarde locale + sauvegarde cloud (Google Drive ou serveur)
- Versioning : chaque import reçoit un ID unique + timestamp
- Possibilité d'exporter/réimporter les données

---

### 2.5 Module 5 : Envoi Automatique de Demandes de Devis

#### 2.5.1 Configuration de l'email
L'utilisateur configure une seule fois ses paramètres d'envoi :
- **Adresse email expéditeur** : email professionnel de l'entreprise
- **Mot de passe / Token** : authentification SMTP sécurisée (OAuth 2.0 si possible)
- **Service d'email** : choix entre Nodemailer (SMTP), SendGrid, Mailjet ou autre
- **Signature** : bloc texte/logo de signature personnalisée

#### 2.5.2 Contenu de l'email

**Objet** :
```
[DEMANDE DE DEVIS] [Catégorie] - [Entreprise]
Exemple : [DEMANDE DE DEVIS] Thermoformage - Entreprise XYZ
```

**Corps de l'email** (format HTML) :
- Salutation personnalisée : "Madame, Monsieur / Mademoiselle [Responsable]"
- Accroche professionnelle : "À titre informatif, nous recherchons un prestataire capable de [briève description]"
- Description complète du projet : intégration du texte saisi par l'utilisateur
- Cahier des charges : texte standard explicitant les codes client, délais, quantités indicatives
- Appel à l'action : "Pourriez-vous nous adresser un devis détaillé comprenant [prix unitaire, MOQ, délai de livraison, normes appliquées]..."
- Signature professionnelle : nom, titre, entreprise, téléphone, adresse

**Pièces jointes** :
- Tous les fichiers uploadés par l'utilisateur (plans, PDF, etc.)
- Taille cumulée maximale : 25 MB par email
- Dénomination : conservation du nom original ou standardisée (ex. `Plan_01.pdf`, `Cahier_Charges.pdf`)

#### 2.5.3 Services d'envoi recommandés

**Option 1 : Nodemailer + SMTP**
- Protocole : SMTP (port 587 ou 465)
- Fournisseurs compatibles : Gmail (avec App Password), Outlook, OVH, etc.
- Avantage : full control, peu/pas de coûts
- Inconvénient : moins fiable pour bulk, risque de spam folder, ratelimiting côté fournisseur
- Limitation Gmail : max 500 emails/jour, max 100 destinataires/email

**Option 2 : SendGrid**
- API v3 HTTP-based
- Avantage : haute délivrabilité, tracking opens/clicks, templating avancé
- Coût : gratuit jusqu'à 100 emails/jour, puis payant
- Limite : max 1 000 emails/jour (plan gratuit), "unlimited" en payant

**Option 3 : Mailjet**
- API REST ou SMTP
- Avantage : délivrabilité certifiée, analytics détaillées, RGPD compliant
- Coût : gratuit jusqu'à 5 000 emails/mois
- Limite : pas de limitation par jour, par heure

**Recommandation** : Combinaison Nodemailer (faisabilité locale) + Mailjet (production, fiabilité)

#### 2.5.4 Configuration avancée
- **Planning d'envoi** : possibilité de scheduler les envois (délai entre chaque email : 10-60 secondes)
- **Personnalisation mass** : variables templates (nom entreprise, catégorie, etc.)
- **Limitation de débit** : max X emails par minute pour éviter le throttling
- **Logs** : enregistrement de chaque envoi (destinataire, heure, statut, codes d'erreur)

---

### 2.6 Module 6 : Réception et Traitement des Réponses

#### 2.6.1 Lecture automatique des emails entrants
- **Protocole** : IMAP (Internet Message Access Protocol)
- **Configuration IMAP** : 
  - Hôte : imap.gmail.com (sur port 993 pour Gmail)
  - Utilisateur : l'adresse email configurée en 2.5.1
  - Mot de passe : identique à SMTP
  - Dossier : dédié "DevisList" ou "Quotes" (créé automatiquement)
  
**Important** : Rediriger les réponses vers une adresse email dédiée et configurer des règles d'auto-forwarding pour centraliser les réponses en un seul endroit.

#### 2.6.2 Traitement des réponses
Utiliser la librairie **IMAP** (Node.js) pour :
1. **Connexion et authentification** : se connecter au serveur IMAP
2. **Récupération des emails** : lire les nouveaux emails non marqués
3. **Parsing du contenu** :
   - **De (sender)** : extraire l'adresse email du sous-traitant
   - **Sujet** : vérifier si c'est une réponse (reply) ou une nouvelle demande
   - **Corps** : parser le texte pour extraire les infos clés (tarif, délai, MOQ, questions)
   - **Pièces jointes** : télécharger les fichiers (devis PDF, termes et conditions, etc.)

#### 2.6.3 Extraction des informations du devis
Parser le corps de l'email et les pièces jointes pour extraire :
- **Prix/Tarification** : prix unitaire, prix HT/TTC, frais de port
- **Quantité Minimale (MOQ)** : quantité minimale commandable
- **Délai** : délai de livraison, délai de validité du devis
- **Conditionnalités** : emballage, incoterms, conditions de paiement
- **Normes appliquées** : certifications, standards de qualité
- **Questions/Remarques** : demandes de clarification du sous-traitant
- **Contacte direct** : nom du commerciel, téléphone, email personnel

Pour les fichiers PDF : utiliser **pdfrw** ou **PDF.js** pour extraire le texte et les données structurées.

#### 2.6.4 Sauvegarde des réponses
- **Stockage en DB** : enregistrement JSON dans la base (Google Sheets ou CSV)
- **Archivage d'emails** : copie du contenu et des pièces jointes dans un dossier /uploads/devis/
- **Marquage** : marquer les emails comme lus après traitement
- **Déduplication** : éviter les doublons (même sender, même contenu)

#### 2.6.5 Gestion des erreurs et timeouts
- **Email non trouvé/inexistant** : préparer une relance automatique après 7-14 jours
- **Inbox pleine** : notification utilisateur, augmentation de quota
- **Serveur IMAP indisponible** : retry avec backoff exponentiel
- **Parsing échoué** : flaguer pour révision manuelle (interface)

---

### 2.7 Module 7 : Tableau Comparatif des Devis

#### 2.7.1 Présentation du tableau
Le tableau final regroupe les dévis reçus sous forme de **Google Sheet dynamique** ou **CSV exporté**.

#### 2.7.2 Structure du tableau comparatif

| Colonne | Type | Source | Description |
|---------|------|--------|-------------|
| **Rang** | Integer | Auto | Numéro de ligne |
| **Nom Artisan** | String | CSV import | Nom de l'entreprise (cf. Module 4) |
| **Email** | Email | CSV import + réponse | Email de contact confirmé |
| **Téléphone** | String | CSV import | Numéro principal |
| **Catégorie** | String | Paramètre initial | Catégorie évaluation |
| **Prix Unitaire (€)** | Float | Email devis | Prix HT ou TTC (à spécifier) |
| **Devise** | String | Email devis | EUR, USD, etc. |
| **MOQ (Quantité Min.)** | Integer | Email devis | Quantité minimale requise |
| **Délai (jours)** | Integer | Email devis | Délai en jours calendaires |
| **Incoterms** | String | Email devis | Ex. EXW, FOB, CIF, DDP |
| **Frais Port (€)** | Float | Email devis | Coût de transport (si applicable) |
| **Total Estimé (€)** | Formula | Auto-calc | = (Prix Unitaire × MOQ) + Frais Port |
| **Validité (jours)** | Integer | Email devis | Durée de validité du devis |
| **Certification/Normes** | String | Email devis | ISO, CE, API, etc. |
| **Date Réponse** | Date | Auto | Date/heure de réception |
| **Nb Relances** | Integer | Auto | Nombre de relances envoyées |
| **Statut** | Enum | Manuel | "Retenu" / "Rejeté" / "En attente" / "Relancé" |
| **Commentaires Internes** | Text | Manuel | Notes, questions du sous-traitant, points d'attention |
| **Pièces Jointes** | Link | Stockage | Lien vers devis PDF uploadé |
| **Temps Réponse (h)** | Float | Auto-calc | = (Date réponse - Date envoi) / 3600 |

#### 2.7.3 Fonctionnalités du tableau
- **Tri** : par prix, délai, MAQ, note Google, temps de réponse
- **Filtrage** : par catégorie, statut, certification, fourchette de prix
- **Alertes** : surlignage automático des meilleurs rapports prix/délai
- **Calculs** : total estimé, temps moyen de réponse, comparatif coût/délai/qualité
- **Export** : en PDF, Excel, CSV pour rapport/décision
- **Collaboration** : partage du lien Google Sheets pour révision collective
- **Suivi** : historique des modifications, commentaires attachés

#### 2.7.4 Prise de décision
- **Scoring automatique** : pondération (prix: 40%, délai: 30%, MOQ: 20%, normes: 10%)
- **Recommandation** : suggestion du top 3 meilleurs prestataires according aux critères
- **Export décision** : PDF généré avec analyses et justification

---

## 3. CONTRAINTES ET CONFORMITÉ

### 3.1 Réglementations légales

#### 3.1.1 RGPD (Réglement Général sur la Protection des Données)
- **Collecte de données** : les emails et téléphones sont des données personnelles (même en contexte B2B)
- **Consentement** : vérifier que l'envoi de demandes de devis respecte les conditions légales (base juridique : intérêt légitime en B2B autorisé, sauf démarchage non sollicité excessif)
- **Droit d'accès/suppression** : mettre en place une page "conditions d'utilisation" explicitant l'usage des données collectées
- **Mentions obligatoires** : "Ces données ont été collectées via Google Places API et scraping. Elles sont utilisées uniquement pour les demandes de devis relatives à ce projet. Vous pouvez à tout moment demander la suppression de vos données."
- **Stockage sécurisé** : chiffrement des données au repos

#### 3.1.2 Anti-spam et démarchage (réglements nationaux)
- **France (CNIL, Loi Informatique et Libertés)** :
  - Démarchage B2B tolérés s'il cible les entreprises (pas les particuliers)
  - Respect du "Disposition Against Spam" : inclure le droit de se retirer
  - Signature obligatoire avec coordonnées complètes dans l'email
  - Interdiction de cacher l'origine du message
  
- **UE générale** :
  - ePrivacy Directive : les emails doivent inclure une adresse de rétractation
  - Link "unsubscribe" ou "stop" obligatoire en bas de l'email

- **Bonnes pratiques** :
  - Limit rate : pas plus de 1-2 emails par entreprise lors du premier contact
  - Spacing : respecter des délais entre envois (éviter le burst qui triggers spam filters)
  - Subject line claire : pas de tromperie, pas de majuscules abusives, pas de spam keywords

#### 3.1.3 Conditions particulières
- **Propriété intellectuelle** : les plans/documents uploadés restent la propriété de l'utilisateur; l'app n'a pas de droit d'usage
- **Responsabilité** : l'app collecte les données via API publiques (Google Places) et scraping (sites publics); responsabilité limitée sur l'exactitude des données sources
- **Clause de non-garantie** : L'app est fournie "AS IS" sans garantie sur :
  - La complétude de la liste (certaines entreprises peuvent ne pas être indexées par Google)
  - La validité des emails (peuvent être obsolètes ou erronés)
  - Les réponses des sous-traitants (hors du contrôle de l'app)

---

### 3.2 Limitations techniques et API

#### 3.2.1 Google Places API (New)
- **Quotas gratuits** : 
  - Text Search : 100 000 appels/mois (après 1er mois gratuit)
  - Nearby Search : 100 000 appels/mois
  - Place Details : 200 000 appels/mois
  - Tarification : au-delà = facturation à la requête
  
- **Rate limiting** : 1 000 requêtes/seconde max; utiliser un queue/batch system pour les envois massifs

- **Limitations de couverture** :
  - Google Places ne couvre pas exhaustivement toutes les petites entreprises artisanales
  - Certains pays ont une couverture incomplète (données moins riches en zones rurales)

##### 3.2.2 Nearby Search vs Text Search
- **Nearby Search** : rayon < 50 km, plus précis mais limité géographiquement
- **Text Search** : couverture nationale/mondiale, moins géographiquement précis
- **Stratégie d'app** : combiner les deux pour équilibrer couverture et précision

#### 3.2.3 Services d'email
- **Gmail SMTP** : 500 emails/jour max depuis une application "peu fiable"
- **SendGrid** : max 100 emails/jour (gratuit); 1 000/jour (payant)
- **Mailjet** : 200 emails/jour gratuit; illimité (payant)
- **Recommandation** : utiliser Mailjet pour production (fiabilité + RGPD compliant)

#### 3.2.4 Web scraping
- **Éthique** : respecter robots.txt, pas d'impact sur serveur cible (délai 2-5s entre requêtes)
- **Légalité** : le scraping de données publiques est legal en UE (exception informatique et libertés), mais certains sites l'interdisent explicitement
- **Fallback** : si scraping échoue, utiliser le téléphone ou proposer un formulaire de contact

---

### 3.3 Performance et scalabilité

#### 3.3.1 Architecture
- **Frontend** : application statique (HTML/CSS/JS) légère, pas de dépendances lourdes
- **Backend** : serveur Node.js/Express sur machine locale ou serveur dédié
- **Base données** : Google Sheets API (scalable jusqu'à 10M lignes) ou SQLite local (plus simple)

#### 3.3.2 Débits attendus
- **Cas nominal** : 50-200 entreprises trouvées par recherche
- **Cas massif** : 1 000-5 000 entreprises (rayon 3 000 km)
- **Délai de traitement** :
  - Recherche API + scraping : 5-15 min pour 100 entreprises (délai de 2s/site)
  - Envoi d'emails : 2-5 min pour 100 destinataires
  - Réception des réponses : 24-72 heures (délai métier)

#### 3.3.3 Optimisations recommandées
- **Caching** : stocker les résultats Google Places temporairement (1 heure)
- **Multi-threading** : parallelizer le scraping (10-20 workers simultanés)
- **Queue system** : implémenter une queue (Bull/RabbitMQ) pour les envois d'emails massifs
- **Monitoring** : logs d'erreurs, alertes sur taux de réussite (scraping, email delivery)

---

## 4. STACK TECHNIQUE

### 4.1 Architecture globale
```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend Utilisateur                       │
│                  (HTML5/CSS3/JavaScript)                     │
│              Simple UI ex. React optionnel                   │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST
┌────────────────────▼────────────────────────────────────────┐
│                Backend (Node.js/Express)                    │
│  - API REST routes (search, form submit, email send, etc.)  │
│  - Controllers & Business Logic                            │
│  - Middleware (auth, validation, logging)                  │
└────────┬──────────┬──────────┬───────────────┬──────────────┘
         │          │          │               │
    ┌────▼────┐ ┌──▼───┐ ┌────▼─────┐ ┌───────▼─────┐
    │ Google  │ │ SMTP │ │ IMAP     │ │ Cheerio     │
    │ Places  │ │/Mail │ │ Module   │ │ (Scraping)  │
    │ API     │ │ Jet  │ │ (Email   │ │             │
    │         │ │      │ │ relay)   │ │             │
    └────┬────┘ └──┬───┘ └────┬─────┘ └───────┬─────┘
         │         │          │                │
┌────────▼─────────▼──────────▼────────────────▼──────────────┐
│     Stockage de Données                                      │
│   - Google Sheets API (database)                            │
│   - CSV exports (sauvegarde locale)                         │
│   - File uploads storage (/uploads)                         │
└────────────────────────────────────────────────────────────┘
```

### 4.2 Stack détaillé

#### Frontend
- **HTML5** : structure sémantique, formulaires accessibles
- **CSS3** : mise en page responsive, compatible desktop/tablet
- **JavaScript (ES6+)** : logique côté client, validation, fetch API pour appels REST
- **Optionnel : React** : si interface complexe requise (state management, components)
- **UI Library optionnelle** : Bootstrap ou Tailwind CSS pour styling rapide

#### Backend
- **Runtime** : Node.js v18+ (LTS)
- **Framework Web** : Express.js v4.x
- **Package Manager** : npm ou yarn
- **Authentification** : JWT (tokens) ou Sessions

#### APIs & Services
- **Google Sheets API v4** : lecture/écriture feuilles de calcul
- **Google Places API (New)** : recherche entreprises, détails établissements
- **Nodemailer** : SMTP client (intégration Gmail, Outlook, etc.)
- **SendGrid API / Mailjet API** : email service (production)
- **IMAP Module** : reception et parsing des emails (inbox IMAP)
- **Cheerio** : parsing HTML légère, web scraping

#### Base de données (au choix)
1. **Google Sheets** (recommandé) : 
   - Gsheet client npm package
   - OAuth 2.0 authentification
   - Facile collab & export
   
2. **SQLite3** (alternative locale) :
   - sqlite3 npm package
   - DB fichier .db local
   - Plus performant pour grandes volumes

3. **PostgreSQL / MySQL** (si hébergement cloud futur) :
   - pg ou mysql2 npm packages
   - Scalabilité cloud

#### Outils & Dépendances
- **Validation** : Joi (schema validation)
- **Environnement** : dotenv (variables d'env .env)
- **Logging** : winston ou bunyan
- **HTTP Client** : axios ou node-fetch
- **File Upload** : multer (middleware)
- **PDF Parsing** : pdfparse ou pdf-extract
- **Compression** : node-zip ou adm-zip
- **Testing** : Jest ou Mocha (optionnel pour MVP)
- **Linting** : ESLint + Prettier (code quality)

---

### 4.3 Packages NPM essentiels
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "axios": "^1.3.0",
    "cheerio": "^1.0.0-rc.12",
    "nodemailer": "^6.9.0",
    "imap": "^0.8.19",
    "dotenv": "^16.0.0",
    "joi": "^17.9.0",
    "multer": "^1.4.5",
    "google-sheets-api": "^1.0.0",
    "pdfparse": "^1.1.8",
    "sqlite3": "^5.1.6",
    "cors": "^2.8.5",
    "helmet": "^7.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.20",
    "eslint": "^8.35.0",
    "prettier": "^2.8.4"
  }
}
```

---

### 4.4 Structure de répertoires
```
sourcebot/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── search.js          # Routes recherche/collection
│   │   │   ├── email.js           # Routes envoi/réception emails
│   │   │   ├── quotes.js          # Routes tableau devis
│   │   │   └── upload.js          # Routes upload fichiers
│   │   ├── controllers/
│   │   │   ├── searchController.js
│   │   │   ├── emailController.js
│   │   │   └── quoteController.js
│   │   └── middleware/
│   │       ├── auth.js
│   │       ├── errorHandler.js
│   │       └── validation.js
│   ├── services/
│   │   ├── googlePlacesService.js     # Google Places API
│   │   ├── scrapingService.js         # Cheerio scraping
│   │   ├── emailService.js            # Nodemailer/Mailjet
│   │   ├── imapService.js             # IMAP reader
│   │   ├── storageService.js          # Google Sheets / CSV store
│   │   └── quoteParsing.js            # Parse devis from emails
│   ├── utils/
│   │   ├── logger.js
│   │   ├── validators.js
│   │   ├── helpers.js
│   │   └── constants.js
│   ├── config/
│   │   ├── database.js
│   │   ├── googleAuth.js
│   │   └── emailTemplates.js
│   └── app.js                         # Express app entry
├── public/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── app.js
│       ├── form.js
│       └── ui.js
├── uploads/
│   ├── documents/      # fichiers uploadés user
│   └── devis/          # devis reçus par email
├── .env.example
├── .gitignore
├── package.json
├── server.js           # Entry point
├── README.md
├── Cahier des charges.md
├── Architecture.md
└── Guidlines de developpement.md
```

---

## 5. PHASES DE DÉVELOPPEMENT

### Phase 1 : Prototype MVP (Semaines 1-3)
**Objectif** : Application minimale fonctionnelle

**Livrables** :
1. Page HTML formulaire simple (catégorie + description + upload)
2. Backend Node.js/Express basique
3. Intégration Google Places API (Text Search seul)
4. Stockage CSV basique
5. Envoi emails Nodemailer simple

**Tests** : manuel, sur 1-2 catégories et 1-2 entreprises

### Phase 2 : Enrichissement (Semaines 4-6)
**Objectif** : Fonctionnalités complètes

**Ajouts** :
1. Web scraping (Cheerio + extraction emails)
2. Nearby Search multi-grille + déduplication
3. Réception emails (IMAP basic)
4. Tableau comparatif devis (Google Sheets)
5. Gestion erreurs, logging

**Tests** : 50 entreprises, scénarios nominaux

### Phase 3 : Production & Optimisation (Semaines 7-8)
**Objectif** : Robustesse, performance, déploiement

**Ajouts** :
1. Authentification utilisateur (JWT)
2. Queue system email (Bull)
3. Chiffrement données
4. Rate limiting APIs
5. Monitoring, alertes
6. Documentation complète

**Tests** : charge massif (1 000 entreprises), edge cases

---

## 6. CRITÈRES DE SUCCÈS

### Fonctionnalité
- ✅ Utilisateur peut créer une requête recherche via formulaire
- ✅ Application retourne 50+ entreprises pour une requête
- ✅ 70%+ des emails sont extraits avec succès via scraping
- ✅ Emails de demande de devis sont envoyés sans erreur SMTP
- ✅ Réponses par email sont reçues et parsées
- ✅ Tableau comparatif affiche 5+ devis reçus correctement

### Performance
- ✅ Temps recherche API + scraping < 10 min pour 100 entreprises
- ✅ Temps envoi 50 emails < 5 min
- ✅ Temps chargement page frontend < 2 secondes
- ✅ Taux succès scraping > 60% (email trouvé / sites valides)

### Fiabilité
- ✅ Taux délivrabilité emails > 85% (mesure via Mailjet/SendGrid)
- ✅ Taux de récupération réceptions emails > 90%
- ✅ Logging exhaustif de tous les erreurs
- ✅ Gestion gracieuse des timeouts, erreurs API

### Conformité
- ✅ RGPD : Mentions légales présentes, données chiffrées
- ✅ Anti-spam : Emails contiennent unsubscribe link, signature complète
- ✅ robots.txt respecté (vérification scraping)

---

## 7. DÉPENDANCES EXTERNES

### Comptes & Authentifications Requis
1. **Google Cloud Console** : créer projet + activer :
   - Google Places API (New)
   - Google Sheets API
   - OAuth 2.0 Client ID

2. **Service Email** (au choix) :
   - Gmail : compte Google + App Password
   - Mailjet : compte gratuit/payant
   - SendGrid : compte gratuit/payant

3. **Hébergement optionnel** :
   - Heroku (déploiement simple Node.js)
   - AWS Lambda (serverless)
   - VPS perso ou serveur ENSAM

### Licences & Coûts
| Composant | Coût | Notes |
|-----------|------|-------|
| Google Places API | 0€ (gratuit 1er mois, puis ~0.80€/1000 requêtes) | Text Search, Nearby Search |
| Google Sheets API | 0€ | Inclus avec compte Google |
| Nodemailer | 0€ | Email SMTP perso (Gmail limited) |
| Mailjet | 0€ (200 emails/jour) → 15€/mois | Production fiable |
| Hébergement | 0-50€/mois | Optionnel, local ok pour MVP |

---

## 8. RISQUES ET MITIGATION

| Risque | Impact | Mitigation |
|--------|--------|-----------|
| Google Places API coverage insuffisante | Certaines régions non couvertes | Ajouter recherche manuelle, reviews utilisateur |
| Scraping échoue (robots.txt, site bloqué) | 30-40% emails non trouvés | Fallback téléphone, regex améliaurée, cache emails |
| Emails classés spam | Taux délivrabilité < 50% | Utiliser Mailjet, respecter CAN-SPAM, SPF/DKIM |
| RGPD violation non-intentionnelle | Risque légal, amende | Audit légal, mentions claires, consentement explicite |
| Données sensibles exposées | Breach sécurité data | Chiffrement AES-256, HTTPS SSL, audit sécu |
| Rate limiting API Google | Requêtes bloquées | Implémenter queue, cache, delai entre requêtes |

---

## 9. ANNEXES

### 9.1 Exemples de requêtes API

**Google Places Text Search** :
```
https://maps.googleapis.com/maps/api/place/textsearch/json?query=thermoformeurs+en+France&key=YOUR_API_KEY
```

**Google Places Nearby Search** :
```
https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=48.8566,2.3522&radius=50000&type=establishment&keyword=thermoformage&key=YOUR_API_KEY
```

**Google Places Details** :
```
https://maps.googleapis.com/maps/api/place/details/json?place_id=ChIJ...&fields=name,formatted_address,international_phone_number,website,rating&key=YOUR_API_KEY
```

### 9.2 Template d'email demande de devis

**Objet** :
```
[DEMANDE DE DEVIS] Thermoformage - [Nom Client]
```

**Corps (HTML)** :
```html
<p>Madame, Monsieur,</p>

<p>Dans le cadre de notre projet de [brève description], nous sommes à la recherche d'un prestataire 
en thermoformage capable de [type de prestation].

<p><strong>Description du projet :</strong></p>
<p>[Description complète saisie par utilisateur]</p>

<p><strong>Pièces jointes :</strong> Plans, cahier des charges et spécifications en annexe.</p>

<p>Nous vous remercions de nous adresser un devis détaillé incluant :</p>
<ul>
  <li>Prix unitaire HT</li>
  <li>Quantité minimale (MOQ)</li>
  <li>Délai de livraison</li>
  <li>Incoterms appliqués</li>
  <li>Normes et certifications</li>
</ul>

<p>Nous restons à votre disposition pour toute précision supplémentaire.</p>

<p>Cordialement,<br>
<strong>[Nom Client]</strong><br>
[Titre]<br>
[Entreprise]<br>
[Téléphone]<br>
[Adresse]<br>
</p>
```

### 9.3 Exemple de réponse Google Places Details
```json
{
  "result": {
    "name": "Thermoformage ACME SARL",
    "formatted_address": "123 Rue de l'Industrie, 75001 Paris, France",
    "international_phone_number": "+33 1 23 45 67 89",
    "website": "https://www.acme-thermoformage.fr",
    "rating": 4.5,
    "user_ratings_total": 28,
    "opening_hours": {
      "weekday_text": ["Monday: 9:00 AM - 6:00 PM", "Tuesday: 9:00 AM - 6:00 PM", "..."]
    },
    "geometry": {
      "location": {
        "lat": 48.8566,
        "lng": 2.3522
      }
    }
  },
  "status": "OK"
}
```

### 9.4 Exemple de structure CSV final
```
N°,Nom Entreprise,Catégorie,Adresse,CP,Ville,Pays,Téléphone,Site Web,Email,Lat,Lng,Note Google,Nb Avis,Statut Email,Date Recherche
1,Thermoformage ACME,Thermoformage,123 Rue Industrie,75001,Paris,France,+33123456789,acme-thermoformage.fr,contact@acme.fr,48.8566,2.3522,4.5,28,Trouvé,2026-03-04
2,Thermoform Plus,Thermoformage,456 Ave Technopolis,69000,Lyon,France,+33478901234,thermoplus.com,info@thermoplus.com,45.7640,4.8357,4.2,15,Trouvé,2026-03-04
```

---

## 10. VALIDATION ET APPROUVALS

| Rôle | Responsable | Date | Signature |
|------|-------------|------|-----------|
| Product Owner | [Nom] | __ / __ / __ | __________ |
| Tech Lead | [Nom] | __ / __ / __ | __________ |
| Project Manager | [Nom] | __ / __ / __ | __________ |
| Legal/Compliance | [Nom] | __ / __ / __ | __________ |

---

**Document créé** : 04 Mars 2026  
**Version** : 1.0 (MVP)  
**Statut** : À approuver  
**Prochaine révision** : Fin Phase 1 (Semaine 3)

