# Configuration à faire sur Railway

## Mise à jour de la clé API

Allez sur https://railway.app:

1. Sélectionnez votre projet **SourceBot**
2. Allez à l'onglet **Variables**
3. Trouvez `GOOGLE_PLACES_API_KEY`
4. **Remplacez la valeur actuelle**:
   - ❌ Ancien: `AIzaSyDEuRPjwZhLN0_WmUQ_bNqKiRrQ-2kH1tY`
   - ✅ Nouveau: `AIzaSyB8b7VNwsYmRj5YyUaV7KO5S3nRglZ_GpE`

5. **Déclenchez un redéploiement** (le service va redémarrer automatiquement)

## Test

Attendez 30-60 secondes que Railway redéploie, puis testez:

```bash
curl https://sourcebot-production.up.railway.app/api/test-google-places
```

Vous devriez voir:
```json
{"status":"success","results":{"success":true,"message":"API responding correctly - found 20 results"}}
```

Puis testez la recherche sur le site:
https://sourcebot-inky.vercel.app → Recherchez "plombiers" à Paris

Vous devriez maintenant voir des résultats! 🎉

---

## Notes sur les clés

- **Clé 1** (ancienne): `AIzaSyD0jPcXIIx9LDeO4omPNEp7MCyUYSUAC8M`
- **Clé 2** (celle qui marche ✅): `AIzaSyB8b7VNwsYmRj5YyUaV7KO5S3nRglZ_GpE`
- **Clé Railway** (à remplacer): `AIzaSyDEuRPjwZhLN0_WmUQ_bNqKiRrQ-2kH1tY`

Vous pouvez supprimer la clé 1 et celle de Railway dans Google Cloud Console si vous n'en avez plus besoin.
