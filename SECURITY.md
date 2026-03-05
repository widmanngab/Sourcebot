# 🔐 Guide de Sécurité - SourceBot

## ⚠️ Incident de Sécurité (Corrigé)

**Date**: 2026-03-05  
**Issue**: Clés API exposées dans le `.env`  
**Status**: ✅ RÉSOLU

### Clés Compromise
- ❌ Google Places API Key (RÉGÉNÉRÉE)
- ❌ Mailjet API Key (RÉGÉNÉRÉE)  
- ❌ Mailjet API Secret (RÉGÉNÉRÉE)

### Mesures Prises
- ✅ Clés régénérées sur Google Cloud et Mailjet
- ✅ `.env` nettoyé (valeurs placeholder)
- ✅ `.gitignore` vérifié
- ✅ Railway variables d'env mises à jour
- ✅ Vercel configué correctement

---

## 🛡️ Bonnes Pratiques - Ne JAMAIS faire:

❌ **JAMAIS committer** `.env` avec des vraies clés
❌ **JAMAIS exposer** les variables dans Vercel (pour des secrets backend)
❌ **JAMAIS partager** les clés API en clair
❌ **JAMAIS réutiliser** les mêmes clés dev/prod
❌ **JAMAIS push** des secrets sur GitHub

---

## ✅ Bonnes Pratiques - À TOUJOURS faire:

✅ **Ajouter** `.env` au `.gitignore`:
```
.env
.env.local
.env.*.local
```

✅ **Committer** `.env.example` (sans valeurs réelles):
```
# Fichier .env.example
GOOGLE_PLACES_API_KEY=your_key_here
MAILJET_API_KEY=your_key_here
MAILJET_API_SECRET=your_secret_here
```

✅ **Mettre les secrets** dans le dashboard:
- **Railway**: Onglet "Variables"
- **Vercel**: Settings → Environment Variables (pour frontend seulement)

✅ **Utiliser des clés différentes**:
- DEV: clés de test
- PROD: clés de production

---

## 📍 Où Mettre Quoi

### **Railway (Backend) - SECRETS ICI**
```
GOOGLE_PLACES_API_KEY=real_key_here
MAILJET_API_KEY=real_key_here
MAILJET_API_SECRET=real_secret_here
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
IMAP_USER=your_email@gmail.com
IMAP_PASS=your_app_password
```

### **Vercel (Frontend) - URLS PUBLIQUES SEULEMENT**
```
VITE_API_URL=https://your-railway-backend.railway.app
```

### **GitHub (.env.example) - TEMPLATES SEULEMENT**
```
GOOGLE_PLACES_API_KEY=your_key_here
MAILJET_API_KEY=your_key_here
```

### **Local (.env) - SECRETS TEMPORAIRES POUR DEV**
```
# Utiliser pour développement local
# Ne JAMAIS committer!
```

---

## 🔄 Processus de Rotation des Clés

Si une clé est compromise:

1. **Régénérer immédiatement** sur le service (Google Cloud, Mailjet, etc.)
2. **Mettre à jour** sur Railway (onglet Variables)
3. **Nettoyer le `.env` local** avec placeholder
4. **Vérifier** que l'application fonctionne
5. **Documenter** l'incident

---

## 📋 Checklist Sécurité

- [ ] `.env` est dans `.gitignore`
- [ ] `.env.example` est dans le repo (sans valeurs réelles)
- [ ] Secrets seulement dans Railway pour le backend
- [ ] Vercel a juste l'URL du backend
- [ ] Pas de secrets dans GitHub
- [ ] Clés dev ≠ clés prod
- [ ] Clés régénérées après chaque incident

---

## 🚨 En Cas de Compromission

1. **Régénérer les clés IMMÉDIATEMENT**
2. Appeler les services (Google, Mailjet) pour invalider les clés
3. Vérifier les logs pour voir si utilisées
4. Mettre à jour tous les endroits (Railway, Vercel, etc.)
5. Commit de sécurité sur GitHub

---

## 📚 Ressources

- [OWASP - Secrets Management](https://owasp.org/www-project-api-security/)
- [Railway - Environment Variables](https://docs.railway.app/develop/variables)
- [Vercel - Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Votre projet est sécurisé! 🔒**
