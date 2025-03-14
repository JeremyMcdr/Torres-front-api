# Script de déploiement pour l'application Torres
# Ce script permet de déployer l'API et le frontend en local

Write-Host "Déploiement de l'application Torres" -ForegroundColor Green

# Vérifier si Node.js est installé
try {
    $nodeVersion = node -v
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
}
catch {
    Write-Host "Node.js n'est pas installé. Veuillez l'installer avant de continuer." -ForegroundColor Red
    exit 1
}

# Vérifier si PM2 est installé
try {
    $pm2Version = pm2 -v
    Write-Host "PM2 version: $pm2Version" -ForegroundColor Cyan
}
catch {
    Write-Host "PM2 n'est pas installé. Installation en cours..." -ForegroundColor Yellow
    npm install -g pm2
}

# Déployer l'API
Write-Host "`nDéploiement de l'API..." -ForegroundColor Green
Set-Location -Path ".\API"

Write-Host "Installation des dépendances de l'API..." -ForegroundColor Cyan
npm install

Write-Host "Démarrage de l'API avec PM2..." -ForegroundColor Cyan
pm2 delete api 2>$null
pm2 start index.js --name api

# Retour au répertoire racine
Set-Location -Path ".."

# Déployer le frontend
Write-Host "`nDéploiement du frontend..." -ForegroundColor Green
Set-Location -Path ".\FRONT"

Write-Host "Installation des dépendances du frontend..." -ForegroundColor Cyan
npm install

Write-Host "Construction du frontend..." -ForegroundColor Cyan
npm run build

Write-Host "Démarrage du frontend avec PM2..." -ForegroundColor Cyan
pm2 delete front 2>$null
pm2 serve build 3000 --name front --spa

# Retour au répertoire racine
Set-Location -Path ".."

Write-Host "`nDéploiement terminé !" -ForegroundColor Green
Write-Host "API: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`nUtilisez 'pm2 status' pour voir l'état des services." -ForegroundColor Yellow
Write-Host "Utilisez 'pm2 logs' pour voir les logs des services." -ForegroundColor Yellow 