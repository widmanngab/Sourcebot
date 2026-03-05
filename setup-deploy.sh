#!/bin/bash
# Script de configuration pour le déploiement

echo "🚀 SourceBot - Configuration Déploiement"
echo "========================================"
echo ""

# Vérifier que Git est installé
if ! command -v git &> /dev/null; then
    echo "❌ Git n'est pas installé. Veuillez installer Git."
    exit 1
fi

echo "✅ Git trouvé"
echo ""

# Configuration Git
echo "📝 Configuration Git locale..."
git config user.name "SourceBot Developer"
git config user.email "dev@sourcebot.local"

# Vérifier l'origin
if git remote get-url origin > /dev/null 2>&1; then
    echo "✅ Origin configuré:"
    git remote -v
else
    echo "⚠️  Origin non configuré. Veuillez configurer:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/sourcebot.git"
fi

echo ""
echo "📋 Fichiers créés:"
echo "   ✅ DEPLOYMENT_GUIDE.md - Guide complet de déploiement"
echo "   ✅ GITHUB_SETUP.md - Configuration GitHub"
echo "   ✅ railway.json - Configuration Railway"
echo "   ✅ vercel.json - Configuration Vercel"
echo "   ✅ .env.production - Template env production"
echo ""
echo "🎯 Prochaines étapes:"
echo "   1. git add ."
echo "   2. git commit -m 'feat: add deployment configuration'"
echo "   3. git push -u origin main"
echo "   4. Configurer Railway sur https://railway.app"
echo "   5. Configurer Vercel sur https://vercel.com"
echo ""
echo "✨ Configuration terminée!"
