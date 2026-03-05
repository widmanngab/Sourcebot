# 📋 CHECKLIST - Configuration Production

## ✅ Étape 1: Vercel (Netlooyer)

```
□ Ouvrir https://vercel.com/dashboard
□ Cliquer sur "sourcebot"
□ Settings → Environment Variables
□ Supprimer:
  □ GOOGLE_PLACES_API_KEY
  □ MAILJET_API_KEY
  □ MAILJET_API_SECRET
  □ MAILJET_FROM_EMAIL
  □ SMTP_* (tous les SMTP)
  □ IMAP_* (tous les IMAP)
  □ Tout ce qui ressemble à un secret
□ Garder seulement: VITE_API_URL (si présent)
□ Cliquer "Save"
□ ✅ Vercel redéploiera automatiquement
```

**Temps: 5 min**

---

## ✅ Étape 2: Railway (Configurer)

```
□ Ouvrir https://railway.app
□ Cliquer sur votre projet "sourcebot"
□ Cliquer sur le SERVICE "sourcebot" (PAS Vercel)
□ Onglet "Variables"
□ Ajouter TOUTES les variables (voir RAILWAY_CONFIG_GUIDE.md):
  □ PORT=3000
  □ NODE_ENV=production
  □ GOOGLE_PLACES_API_KEY=...
  □ MAILJET_API_KEY=...
  □ MAILJET_API_SECRET=...
  □ MAILJET_FROM_EMAIL=noreply@sourcebot.com
  □ MAILJET_FROM_NAME=SourceBot
  □ EMAIL_SENDER_DOMAIN=prospection.fr
  □ EMAIL_SENDER_NAME=Prospection
  □ SMTP_HOST=smtp.gmail.com
  □ SMTP_PORT=587
  □ SMTP_USER=your_email@gmail.com
  □ SMTP_PASS=your_app_password
  □ IMAP_HOST=imap.gmail.com
  □ IMAP_PORT=993
  □ IMAP_USER=your_email@gmail.com
  □ IMAP_PASS=your_app_password
  □ LOG_LEVEL=info
  □ RATE_LIMIT_WINDOW_MS=900000
  □ SCRAPING_TIMEOUT=10000
  □ QUOTE_MIN_PRICE=0.01
  □ MOCK_EMAIL_MODE=false
□ Cliquer "Save" ou "Deploy"
□ ✅ Railway redéploiera (2-3 min)
```

**Temps: 10 min**

---

## ✅ Étape 3: Vérifier

```
□ Attendre 3 minutes (le temps que Railway redéploie)
□ Aller sur Railway → Logs
□ Vérifier qu'il n'y a pas d'erreurs
□ Tester le endpoint:
  curl https://votre-url-railway.railway.app/health
□ Vous devriez voir:
  {"status":"ok","timestamp":"..."}
```

**Temps: 2 min**

---

## ✅ Étape 4: Tester l'App

```
□ Ouvrir https://votre-app.vercel.app
□ Ouvrir la console (F12)
□ Chercher des erreurs ou warnings
□ Faire une recherche (ex: "restaurants paris")
□ Vérifier que:
  □ Les résultats s'affichent
  □ Pas d'erreur CORS
  □ Pas d'erreur 500 ou 404
```

**Temps: 5 min**

---

## 📊 Total: ~25 minutes ⏱️

---

## 🆘 Si quelque chose ne fonctionne pas:

### Erreur CORS
```
→ Ce sont des erreurs de communication frontend-backend
→ Vérifier que VITE_API_URL pointe vers votre URL Railway
→ Vérifier que Railway accepte les CORS
```

### Railway BUILD FAILED
```
→ Cliquer sur le service
→ Onglet "Logs"
→ Chercher l'erreur
→ Vérifier les variables d'env
```

### API retourne 500
```
→ Vérifier Railway Logs
→ Vérifier que GOOGLE_PLACES_API_KEY est correcte
→ Vérifier que MAILJET_API_KEY est correcte
```

### Pas de réponse du backend
```
→ Vérifier que Railway a finalisé le déploiement
→ Vérifier que l'URL est correcte
→ Vérifier que PORT=3000 est bien configuré
```

---

## 📞 Contact & Support

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Logs Railway: Railway Dashboard → Service → Logs
- Logs Vercel: Vercel Dashboard → Deployments

---

## 🎉 Une Fois Que Tout Fonctionne

✅ Vous avez:
- Frontend déployé sur Vercel
- Backend déployé sur Railway
- Secrets sécurisés (pas dans GitHub)
- App fonctionnelle en production

**Bravo! 🎊 Votre app est en ligne!**

---

## 📝 Notes

- Ne pas modifier `.env` (reste en local seulement)
- `.env` ne sera jamais pushé sur GitHub (c'est dans `.gitignore`)
- Les secrets sont stockés SEULEMENT dans Railway/Vercel
- Si vous repositionnez une variable, redéployez Railway
- Vercel redéploie automatiquement quand vous poussez sur GitHub

---

**Prêt? Commencez par Vercel (5 min), puis Railway (10 min), puis testez (5 min)! ✨**
