# 🚀 Guide de Déploiement - SourceBot

## 📋 Architecture

- **Frontend**: Vercel (https://vercel.com)
- **Backend**: Railway (https://railway.app)
- **Repository**: GitHub (https://github.com)

---

## 🔧 Configuration Préalable

### 1️⃣ Git - Push le code sur GitHub

```bash
# Initialiser et pousser le code (si pas encore fait)
git add .
git commit -m "feat: première version SourceBot avec config déploiement"
git branch -M main
git push -u origin main
```

---

## ☁️ Déploiement Backend sur Railway

### Étape 1: Créer un projet Railway
1. Aller sur [railway.app](https://railway.app)
2. Se connecter avec GitHub
3. Cliquer sur "Create New Project"
4. Sélectionner "Deploy from GitHub repo"
5. Sélectionner votre repository `sourcebot`

### Étape 2: Configuration du service Backend
1. Cliquer sur "Add Service" → "GitHub Repo"
2. Sélectionner le repo `sourcebot`
3. Railway détectera Node.js et créera la configuration

### Étape 3: Variables d'environnement sur Railway
Dans le dashboard Railway, aller à **Variables** et ajouter :

```
PORT=3000
NODE_ENV=production
BASE_URL=https://sourcebot-backend.railway.app  # À adapter avec votre URL Railway

# Google Places API
GOOGLE_PLACES_API_KEY=your_api_key

# Email Service - Mailjet
MAILJET_API_KEY=your_api_key
MAILJET_API_SECRET=your_api_secret
MAILJET_FROM_EMAIL=noreply@sourcebot.com

# Autres variables (voir .env.example)
```

### Étape 4: Déploiement
Railway déploiera automatiquement à chaque push sur `main`.

---

## 🎨 Déploiement Frontend sur Vercel

### Étape 1: Fork ou se connecter à Vercel
1. Aller sur [vercel.com](https://vercel.com)
2. Se connecter avec GitHub
3. Cliquer sur "Add New..." → "Project"
4. Importer le repository `sourcebot`

### Étape 2: Configuration du projet Vercel
1. **Framework Preset**: Laisser "Other" (c'est du HTML/CSS/JS statique)
2. **Root Directory**: Laisser vide (défaut = repository root)
3. **Build Command**: Laisser vide
4. **Output Directory**: `public`

### Étape 3: Variables d'environnement (Optional)
Si votre frontend a besoin de l'URL du backend :

```
VITE_API_URL=https://sourcebot-backend.railway.app
```

### Étape 4: Déploiement
Cliquer sur "Deploy" - Vercel déploiera en quelques secondes!

---

## 🔗 Post-Déploiement

### Mettre à jour l'URL du backend dans le frontend

Una fois que Railway a généré votre URL backend (ex: `sourcebot-backend.railway.app`), mettez à jour :

**Fichier**: `public/js/app.js`
```javascript
const API_URL = 'https://sourcebot-backend.railway.app'; // À adapter
```

Puis committez et poussez :
```bash
git add public/js/app.js
git commit -m "fix: update backend URL for production"
git push
```

---

## 📊 Monitoring et Logs

### Railway
- Dashboard : https://railway.app → Your Project → Logs
- Voir les logs en temps réel

### Vercel
- Dashboard : https://vercel.com → Your Project → Deployments
- Voir les builds et les erreurs

---

## 🔐 Secrets et Sécurité

### Ne JAMAIS committer :
- `.env` (fichier réel avec secrets)
- Clés API
- Tokens

### À committer :
- `.env.example` (template sans secrets)
- `.gitignore` (pour ignorer .env)

### Gérer les secrets :
- **Railway**: Variables d'environnement dans le dashboard
- **Vercel**: Variables d'environnement dans le dashboard
- Utiliser différentes clés pour dev/prod

---

## ✅ Checklist Déploiement

- [ ] Code pushé sur GitHub (main branch)
- [ ] Railway configuré et backend deploy
- [ ] Vercel configuré et frontend deployé
- [ ] Variables d'environnement ajoutées sur Railway
- [ ] URL backend mise à jour dans frontend
- [ ] Test du backend : `curl https://your-railway-url/health`
- [ ] Test du frontend : Ouvrir https://your-vercel-url/
- [ ] CORS configuré correctement entre frontend et backend

---

## 🐛 Dépannage

### Backend ne démarre pas sur Railway
1. Vérifier les logs : Railway Dashboard → Logs
2. Vérifier que `PORT` est défini dans les variables
3. Vérifier les dépendances dans `package.json`

### Frontend ne charge pas l'API
1. Vérifier que l'URL du backend est correcte
2. Vérifier les CORS dans `src/app.js`
3. Ouvrir console du navigateur (F12) pour voir les erreurs

### Problèmes de déploiement
- Vérifier `.gitignore` - trop de fichiers ignorés ?
- Vérifier `package.json` - script `start` défini ?
- Vérifier que le code fonctionne en local

---

## 📞 Support

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- GitHub: https://docs.github.com

---

**Bonne chance avec votre déploiement! 🎉**
