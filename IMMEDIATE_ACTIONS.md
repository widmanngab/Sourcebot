# ⚡ Action Immédiate - Configuration Correcte

## 🚨 À Faire MAINTENANT (5 min)

### Étape 1: Régénérer les clés compromises

**Google Places API:**
1. Aller sur https://console.cloud.google.com
2. Sélectionner votre projet
3. API & Services → Credentials
4. Trouver votre API key
5. Cliquer sur l'icône poubelle → Créer nouveau
6. **Copier la nouvelle clé**

**Mailjet:**
1. Aller sur https://app.mailjet.com/settings/api
2. Cliquer sur "API Keys"
3. Cliquer sur l'icône poubelle pour l'ancienne clé
4. **Créer une nouvelle paire API Key/Secret**
5. **Copier les deux valeurs**

---

### Étape 2: Nettoyer Vercel

1. Aller sur https://vercel.com → Votre projet
2. **Settings** → **Environment Variables**
3. **SUPPRIMER** toutes les variables sauf `VITE_API_URL`:
   - ❌ Supprimer: `GOOGLE_PLACES_API_KEY`
   - ❌ Supprimer: `MAILJET_API_KEY`
   - ❌ Supprimer: `MAILJET_API_SECRET`
   - ❌ Supprimer: Tout ce qui ressemble à des secrets

4. **GARDER seulement**:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```
   (À adapter avec votre vrai URL Railway)

---

### Étape 3: Configurer Railway

1. Aller sur https://railway.app → Dashboard → Votre projet `sourcebot`
2. Cliquer sur le **SERVICE** (le backend Node.js - pas l'app Vercel)
3. Aller à l'onglet **"Variables"**
4. **Ajouter ces nouvelles variables**:

```
PORT=3000
NODE_ENV=production

# Google Places (NOUVELLE CLÉ)
GOOGLE_PLACES_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Mailjet (NOUVELLES CLÉS)  
MAILJET_API_KEY=9edf889bXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
MAILJET_API_SECRET=5ce12b3dXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
MAILJET_FROM_EMAIL=noreply@sourcebot.com
MAILJET_FROM_NAME=SourceBot

# Gmail SMTP (si vous en avez besoin)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# IMAP (si vous recevez des emails)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your_email@gmail.com
IMAP_PASS=your_app_password

# Autres
LOG_LEVEL=info
MOCK_EMAIL_MODE=false
```

5. **Sauvegarder** - Railway redéploiera automatiquement ✓

---

### Étape 4: Vérifier le Backend

Une fois Railway redéployé (attendre 2-3 min):

```bash
# Remplacer par votre URL Railway
curl https://your-backend.railway.app/health
```

Vous devriez voir:
```json
{"status":"ok","timestamp":"2026-03-05T08:31:16.000Z"}
```

---

### Étape 5: Tester l'Application

1. Aller sur votre app Vercel: https://your-app.vercel.app
2. Ouvrir la console (F12)
3. Faire une recherche
4. Vérifier qu'il n'y a pas d'erreurs CORS ou d'API

---

## ✅ Résumé des Actions

| Action | Statut | Priorité |
|--------|--------|----------|
| Régénérer Google Places Key | ⏳ À faire | 🔴 URGENT |
| Régénérer Mailjet Keys | ⏳ À faire | 🔴 URGENT |
| Nettoyer Vercel Env Vars | ⏳ À faire | 🔴 URGENT |
| Configurer Railway Variables | ⏳ À faire | 🔴 URGENT |
| Tester le backend | ⏳ À faire | 🟡 Important |
| Tester l'app complète | ⏳ À faire | 🟡 Important |

---

## 📞 Questions?

- **"Où trouver mon URL Railway?"** → Railway Dashboard → Votre projet → onglet "Deployments" → URL en haut
- **"Comment générer une clé Google?"** → https://console.cloud.google.com → API & Services → Credentials
- **"Mailjet API Key?"** → https://app.mailjet.com/settings/api

---

## ⏰ Temps Estimé: 15-20 minutes

Suivez les étapes dans l'ordre et vous serez prêt! 🚀

---

**Status**: En attente de vos actions
