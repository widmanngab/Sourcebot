@echo off
REM Script de configuration pour le déploiement (Windows)

echo 🚀 SourceBot - Configuration Deployment
echo ========================================
echo.

REM Vérifier que Git est installé
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git n'est pas installé. Veuillez installer Git.
    exit /b 1
)

echo ✅ Git trouvé
echo.

REM Configuration Git
echo 📝 Configuration Git locale...
git config user.name "SourceBot Developer"
git config user.email "dev@sourcebot.local"

REM Vérifier l'origin
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Origin non configuré. Configurez avec:
    echo    git remote add origin https://github.com/YOUR_USERNAME/sourcebot.git
) else (
    echo ✅ Origin configuré:
    git remote -v
)

echo.
echo 📋 Fichiers créés:
echo    ✅ DEPLOYMENT_GUIDE.md - Guide complet de déploiement
echo    ✅ GITHUB_SETUP.md - Configuration GitHub
echo    ✅ railway.json - Configuration Railway
echo    ✅ vercel.json - Configuration Vercel
echo    ✅ .env.production - Template env production
echo.
echo 🎯 Prochaines étapes:
echo    1. git add .
echo    2. git commit -m "feat: add deployment configuration"
echo    3. git push -u origin main
echo    4. Configurer Railway sur https://railway.app
echo    5. Configurer Vercel sur https://vercel.com
echo.
echo ✨ Configuration terminée!
