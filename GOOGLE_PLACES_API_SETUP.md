# 🔧 Fix: Configuration Google Places API Railway

## ❌ Problème
Le site affiche "Aucune entreprise trouvée" en production sur Vercel, mais fonctionne parfaitement en local.

## 🔎 Root Cause
La clé API Google Places configurée sur Railway n'a **pas les bonnes permissions** ou  n'est pas valid.

- ✅ **Local**: Clé API `AIzaSyB8b7...` → 20 résultats
- ❌ **Railway**: Clé API `AIzaSyDEuR...` → 0 résultats

## ✅ Solution

### Étape 1: Créer/Vérifier votre clé API Google Cloud

1. Allez sur https://console.cloud.google.com
2. Créez un nouveau projet ou sélectionnez votre projet SourceBot
3. Allez à "API & Services" → "Credentials"
4. Créez une nouvelle clé API (ou utilisez une existante)
5. **Important**: Configurez les restrictions:
   - **API Restrictions**: Sélectionnez uniquement "Places API" ✅
   - **Website Restrictions**: Ajouter:
     - `sourcebot-production.up.railway.app`
     - `sourcebot-inky.vercel.app` 
     - `localhost:3000`
     - `*)` (accepter tous les domaines en development si besoin)

### Étape 2: Configurer Railway

1. Allez sur https://railway.app
2. Sélectionnez votre projet SourceBot
3. Allez à "Variables"
4. Ajouter/Modifier:
   ```
   GOOGLE_PLACES_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
5. Redéployez le service

### Étape 3: Test

Une fois sauvegardé, testez:

```bash
curl https://sourcebot-production.up.railway.app/api/test-google-places
```

Vous devriez voir:
```json
{
  "status": "success",
  "test": "Google Places API connectivity test",
  "results": {
    "success": true,
    "message": "API responding correctly - found 20 results",
    "resultCount": 20
  }
}
```

## 📝 Vérification locale

Pour vérifier votre clé locale:
```bash
npm start
curl http://localhost:3000/api/test-google-places
```

## 🆘 Si ça ne marche pas

1. Vérifiez que l'API "Places API" est **activée** dans Google Cloud Console
2. Vérifiez que vous avez un **billing account** associé au projet
3. Vérifiez les **restrictions de domaine** de la clé API
4. Vérifiez les **quotas et limites** de l'API Places

## 📚 Documentation
- Google Places API: https://developers.google.com/maps/documentation/places/web-service/overview
- Setup Guide: https://developers.google.com/maps/gmp-get-started

