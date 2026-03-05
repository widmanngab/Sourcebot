# 📦 Configuration GitHub Repository

## ✅ Étapes de Configuration

### 1. Initialiser le Repository Local (si pas déjà fait)

```bash
# Naviguer au dossier du projet
cd "c:\Users\Admin\Documents\ENSAM\bachelor 3A\entreprenariat\Projet sourcebot"

# Initialiser Git (si pas encore init)
git init

# Ajouter l'origin (remplacer par votre URL GitHub)
git remote add origin https://github.com/YOUR_USERNAME/sourcebot.git

# Vérifier que l'origin est bien configuré
git remote -v
```

### 2. Configurer Git localement

```bash
# Configurer votre identité Git (si pas déjà fait)
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"

# Ou localement pour ce projet
git config user.name "Votre Nom"
git config user.email "votre.email@example.com"
```

### 3. Ajouter et Committer le Code

```bash
# Voir le statut
git status

# Ajouter tous les fichiers
git add .

# Créer un commit initial
git commit -m "feat: initial commit - SourceBot v1.0"
```

### 4. Renommer la branche en 'main' et Pousser

```bash
# Renommer main (si actuellement sur master)
git branch -M main

# Pousser vers GitHub
git push -u origin main
```

### 5. Vérifier sur GitHub

1. Aller à https://github.com/YOUR_USERNAME/sourcebot
2. Vérifier que le code est bien là ✓

---

## 🔒 Branching Strategy

Pour un workflow professionnel :

```bash
# 1. Créer une branche de développement
git checkout -b develop
git push -u origin develop

# 2. Pour chaque feature, créer une branche
git checkout -b feature/ma-feature
# ... faire les changements ...
git add .
git commit -m "feat: description de la feature"
git push -u origin feature/ma-feature

# 3. Sur GitHub, créer une Pull Request vers develop
# 4. Une fois approuvée et mergée, créer une release vers main
```

---

## 📚 Fichiers Importants à Vérifier

✅ Vérifier que ces fichiers sont dans le repository :
- `package.json` - Dépendances
- `.env.example` - Template variables
- `.gitignore` - Fichiers à ignorer
- `src/app.js` - Point d'entrée
- `public/` - Frontend
- `README.md` - Documentation
- `DEPLOYMENT_GUIDE.md` - Ce guide
- `railway.json` - Config Railway
- `vercel.json` - Config Vercel

❌ Vérifier que ces fichiers sont IGNORÉS :
- `.env` (fichier réel avec secrets)
- `node_modules/`
- `logs/`
- `.vscode/settings.json` (local)

---

## 🔗 URLs Importantes

- **GitHub Repo**: https://github.com/YOUR_USERNAME/sourcebot
- **Railway Dashboard**: https://railway.app
- **Vercel Dashboard**: https://vercel.com

---

## 💡 Commandes Git Courantes

```bash
# Voir les logs
git log --oneline

# Voir la différence
git diff

# Créer une branche
git checkout -b nom-branche

# Changer de branche
git checkout nom-branche

# Merger une branche
git merge nom-branche

# Supprimer une branche locale
git branch -d nom-branche

# Supprimer une branche distante
git push origin --delete nom-branche

# Récupérer les changements distants
git pull

# Pousser les changements
git push
```

---

## 🎯 Prochaines Étapes

Après avoir poussé le code sur GitHub :

1. [ ] Configurer Railway (voir `DEPLOYMENT_GUIDE.md`)
2. [ ] Configurer Vercel (voir `DEPLOYMENT_GUIDE.md`)
3. [ ] Ajouter les Secrets et Variables d'environnement
4. [ ] Tester le déploiement
5. [ ] Mettre en place les GitHub Actions (optionnel pour CI/CD)

---

**Repository prêt pour le déploiement! 🚀**
