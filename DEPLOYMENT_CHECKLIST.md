# 📋 Configuration Déploiement - Checklist Complète

## ✅ Fichiers Créés

| Fichier | Description | Priorité |
|---------|-------------|----------|
| `DEPLOYMENT_GUIDE.md` | Guide complet du déploiement sur Vercel & Railway | 🔴 CRITIQUE |
| `GITHUB_SETUP.md` | Instructions pour configurer le repository GitHub | 🔴 CRITIQUE |
| `railway.json` | Configuration pour Railway (Backend) | 🔴 CRITIQUE |
| `vercel.json` | Configuration pour Vercel (Frontend) | 🔴 CRITIQUE |
| `.env.production` | Template variables d'environnement production | 🟡 Important |
| `.github/workflows/deploy.yml` | CI/CD automatique vers Railway & Vercel | 🟢 Optionnel |
| `.github/workflows/quality.yml` | Linting et tests automatiques | 🟢 Optionnel |
| `setup-deploy.sh` | Script setup (Linux/Mac) | 🟢 Optionnel |
| `setup-deploy.bat` | Script setup (Windows) | 🟢 Optionnel |

---

## 🚀 Étapes Immédiates (À faire maintenant)

### 1️⃣ **Pousser le code sur GitHub**

```bash
# Naviguer au dossier du projet
cd "c:\Users\Admin\Documents\ENSAM\bachelor 3A\entreprenariat\Projet sourcebot"

# Ajouter les fichiers de configuration
git add .

# Vérifier le statut
git status

# Créer un commit
git commit -m "feat: add deployment configuration for Railway & Vercel"

# Vérifier la branche (doit être 'main')
git branch

# Pousser vers GitHub
git push -u origin main
```

**✅ À vérifier**: Le code doit être visible sur https://github.com/YOUR_USERNAME/sourcebot

---

### 2️⃣ **Configurer Railway (Backend)**

Suivre le guide détaillé: **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#-déploiement-backend-sur-railway)**

**Résumé rapide:**
1. Aller sur https://railway.app
2. Créer un nouveau projet
3. Connecter votre repository GitHub `sourcebot`
4. Ajouter les variables d'environnement (voir `.env.example`)
5. Déploiement automatique ✓

**Résultat attendu**: URL backend comme `https://sourcebot-prod.railway.app`

---

### 3️⃣ **Configurer Vercel (Frontend)**

Suivre le guide détaillé: **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#-déploiement-frontend-sur-vercel)**

**Résumé rapide:**
1. Aller sur https://vercel.com
2. Importer votre repository `sourcebot`
3. Configuration:
   - Framework: "Other" (ou "HTML")
   - Root Directory: (laisser vide)
   - Build Command: (laisser vide)
   - Output Directory: `public`
4. Déployer ✓

**Résultat attendu**: URL frontend comme `https://sourcebot.vercel.app`

---

### 4️⃣ **Mettre à jour l'URL du Backend**

Une fois que Railway génère l'URL du backend, mettez à jour:

**Fichier**: `public/js/app.js`

```javascript
// Remplacer:
const API_URL = 'http://localhost:3000';

// Par:
const API_URL = 'https://your-railway-backend-url.railway.app';
```

Puis pousser:
```bash
git add public/js/app.js
git commit -m "fix: update API URL for production"
git push
```

Vercel recompilera automatiquement! ✓

---

### 5️⃣ **Tests Finaux**

```bash
# Test 1: Backend
curl https://your-railway-backend-url.railway.app/health

# Test 2: Frontend
# Ouvrir https://your-vercel-url.vercel.app dans le navigateur
# Vérifier la console (F12) qu'il n'y a pas d'erreurs CORS

# Test 3: Communication Frontend-Backend
# Faire une requête depuis l'app
# Vérifier que ça fonctionne
```

---

## 🔐 Secrets & Variables d'Environnement

### À configurer sur Railway

Dans le dashboard Railway, ajouter ces variables :

```
PORT=3000
NODE_ENV=production
BASE_URL=https://your-railway-backend-url.railway.app
GOOGLE_PLACES_API_KEY=your_key_here
MAILJET_API_KEY=your_key_here
MAILJET_API_SECRET=your_secret_here
MAILJET_FROM_EMAIL=noreply@sourcebot.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### À configurer sur Vercel (Optionnel)

```
VITE_API_URL=https://your-railway-backend-url.railway.app
```

---

## 📊 Monitoring & Logs

### Railway
- Dashboard: https://railway.app → Your Project
- Logs en temps réel: Onglet "Logs"
- Dépannage: Vérifier logs si problème

### Vercel
- Dashboard: https://vercel.com → Your Project
- Deployments: Voir l'historique des builds
- Vercel Analytics (optionnel): https://vercel.com/analytics

---

## 🐛 Dépannage Courant

| Problème | Solution |
|----------|----------|
| **Backend ne démarre** | Vérifier logs Railway, vérifier PORT dans variables |
| **Frontend ne charge pas API** | Vérifier URL API dans `public/js/app.js`, vérifier CORS |
| **CORS Error** | Vérifier `src/app.js` config CORS, ajouter URL Vercel |
| **Variables env pas chargées** | Redéployer sur Railway après ajout variables |
| **Git push rejetée** | Vérifier branch `main`, faire `git pull` d'abord |

---

## 📚 Documentation de Référence

- 📖 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Guide complet
- 📖 [GITHUB_SETUP.md](./GITHUB_SETUP.md) - Configuration GitHub
- 🚂 [Railway Docs](https://docs.railway.app)
- ✨ [Vercel Docs](https://vercel.com/docs)

---

## 🎯 Prochaines Étapes (Après déploiement)

- [ ] **Domaine personnalisé**
  - Vercel: Settings → Domains
  - Railway: Custom Domain (plan payant)

- [ ] **SSL/HTTPS**
  - Automatique sur Vercel ✓
  - Automatique sur Railway ✓

- [ ] **Monitoring**
  - Ajouter Sentry pour error tracking
  - Ajouter DataDog/New Relic pour performance

- [ ] **CI/CD avancé**
  - Activer GitHub Actions (voir `.github/workflows`)
  - Tests automatiques avant deploy

---

## 💡 Conseils Importants

✅ **Toujours faire:**
- Utiliser `.env` pour dev, variables d'env pour production
- Tester en production après chaque déploiement
- Monitorer les logs régulièrement
- Utiliser des branches `develop` et `main`

❌ **Ne JAMAIS:**
- Committer `.env` avec les vrais secrets
- Utiliser les mêmes clés API en dev et production
- Déployer sans tests et vérifications

---

## ✨ Configuration Complète!

**Vous êtes prêt pour:**
✅ Développement local
✅ Tests unitaires & intégration
✅ Déploiement automatique
✅ Monitoring en production
✅ Collaboration en équipe (GitHub)

---

**Questions? Consultez les guides détaillés! 📚**
**Besoin d'aide? Vérifiez la section dépannage! 🔧**
