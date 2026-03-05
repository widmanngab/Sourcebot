# 🚂 Guide Configuration Railway - Étape par Étape

## 📍 Localiser votre URL Railway

1. Allez sur https://railway.app
2. Cliquez sur votre projet `sourcebot`
3. Onglet "Deployments"
4. En haut, vous verrez une URL: `https://sourcebot-XXX.railway.app`
5. **Copiez cette URL**

**Exemple**: `https://sourcebot-prod-123456.railway.app`

---

## ✏️ Variables à Ajouter dans Railway

### **Étape 1: Aller à l'onglet Variables**

1. Projet Railway → Service `sourcebot` (PAS Vercel)
2. Onglet **"Variables"** ou "Environment"
3. Cherchez un bouton "+ Add" ou "New Variable"

### **Étape 2: Ajouter ces variables**

**COPIER-COLLER chaque ligne et cliquer "Ajouter":**

#### Configuration de Base
```
PORT=3000
NODE_ENV=production
```

#### Google Places API
```
GOOGLE_PLACES_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```
*(Remplacer par votre vraie clé)*

#### Mailjet
```
MAILJET_API_KEY=9edf889bXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
MAILJET_API_SECRET=5ce12b3dXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
MAILJET_FROM_EMAIL=noreply@sourcebot.com
MAILJET_FROM_NAME=SourceBot
```

#### Email Sender (Votre domaine)
```
EMAIL_SENDER_DOMAIN=prospection.fr
EMAIL_SENDER_NAME=Prospection
EMAIL_ALTERNATE_DOMAIN=contact.prospection.fr
```

#### Gmail SMTP (Pour envoyer des emails)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_app_password
```

#### IMAP (Pour recevoir les réponses)
```
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=votre_email@gmail.com
IMAP_PASS=votre_app_password
```

#### Logging
```
LOG_LEVEL=info
LOG_FILE=logs/app.log
```

#### Rate Limiting
```
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Scraping Web
```
SCRAPING_TIMEOUT=10000
SCRAPING_DELAY_MS=3000
SCRAPING_MAX_PARALLEL=10
```

#### Quote Parsing
```
QUOTE_MIN_PRICE=0.01
QUOTE_MAX_PRICE=999999999
QUOTE_MIN_MOQ=1
QUOTE_MAX_MOQ=999999
```

#### IMAP Polling
```
IMAP_POLL_INTERVAL_MS=10800000
```

#### Mode Email
```
MOCK_EMAIL_MODE=false
```
*(Passer à `true` si problèmes avec Mailjet)*

---

## 🎯 Résumé des Valeurs à Remplir

| Variable | Exemple | Où la trouver |
|----------|---------|---------------|
| `GOOGLE_PLACES_API_KEY` | `AIzaSyXXXXXXXXXX...` | https://console.cloud.google.com |
| `MAILJET_API_KEY` | `9edf889bXXXXXXXX...` | https://app.mailjet.com/settings/api |
| `MAILJET_API_SECRET` | `5ce12b3dXXXXXXXX...` | https://app.mailjet.com/settings/api |
| `SMTP_USER` | `votre_email@gmail.com` | Votre Gmail |
| `SMTP_PASS` | `16 char app password` | https://myaccount.google.com/apppasswords |
| `IMAP_USER` | `votre_email@gmail.com` | Votre Gmail |
| `IMAP_PASS` | `16 char app password` | https://myaccount.google.com/apppasswords |

---

## 💾 Avant de Sauvegarder

✅ Vérifiez que vous avez:
- [ ] `PORT=3000`
- [ ] `NODE_ENV=production`
- [ ] `GOOGLE_PLACES_API_KEY` (pas vide)
- [ ] `MAILJET_API_KEY` (pas vide)
- [ ] `MAILJET_API_SECRET` (pas vide)
- [ ] `SMTP_USER` et `SMTP_PASS`
- [ ] Les autres variables importantes

## 🚀 Déploiement

1. Une fois toutes les variables ajoutées, cliquez **"Save"** ou **"Deploy"**
2. Railway redéploiera automatiquement (attendre 2-3 minutes)
3. Regardez les logs pour voir si tout s'est bien passé

---

## ✅ Vérifier que Railway Fonctionne

Une fois déployé, testez:

```bash
# Remplacer PAR VOTRE URL Railway
curl https://votre-url.railway.app/health
```

**Vous devriez voir:**
```json
{"status":"ok","timestamp":"2026-03-05T..."}
```

Si vous voyez une erreur 500 ou autre, **vérifier les logs Railway**.

---

## 🆘 Dépannage

### Railway dit "BUILD FAILED"
→ Vérifier les logs (Click sur le service → "Logs")
→ Vérifier que les variables d'env sont correctes

### API retourne 500
→ Vérifier `GOOGLE_PLACES_API_KEY` n'est pas expiré
→ Vérifier `MAILJET_API_KEY` est correct

### Cannot connect to Mailjet
→ Vérifier `MAILJET_API_KEY` et `MAILJET_API_SECRET`
→ Passer `MOCK_EMAIL_MODE=true` pour tester sans Mailjet

---

## 📞 Besoin d'aide?

Consultez:
- [Railway Docs](https://docs.railway.app)
- [Votre projet Railway](https://railway.app)
- [Logs du service](https://railway.app/project/... → Logs tab)

---

**Prêt? Commencez l'ajout des variables dans Railway! 🚀**
