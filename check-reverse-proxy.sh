#!/bin/bash

# Script pour vérifier la configuration du reverse proxy

echo "=== Vérification de la configuration du reverse proxy ==="

# Vérifier si Nginx est installé
if command -v nginx &> /dev/null; then
    echo "✅ Nginx est installé"
    nginx -v
else
    echo "❌ Nginx n'est pas installé"
fi

# Vérifier si le service Nginx est en cours d'exécution
if systemctl is-active --quiet nginx; then
    echo "✅ Le service Nginx est en cours d'exécution"
else
    echo "❌ Le service Nginx n'est pas en cours d'exécution"
fi

# Vérifier la configuration Nginx
echo "=== Vérification de la configuration Nginx ==="
nginx -t

# Vérifier les sites disponibles
echo "=== Sites disponibles ==="
ls -la /etc/nginx/sites-available/

# Vérifier les sites activés
echo "=== Sites activés ==="
ls -la /etc/nginx/sites-enabled/

# Vérifier les ports en écoute
echo "=== Ports en écoute ==="
netstat -tulpn | grep LISTEN

# Vérifier la résolution DNS
echo "=== Résolution DNS pour torres.dashboard.macadie.fr ==="
host torres.dashboard.macadie.fr || echo "❌ Impossible de résoudre torres.dashboard.macadie.fr"

# Vérifier la connectivité
echo "=== Test de connectivité vers le front-end ==="
curl -I http://localhost:8080 || echo "❌ Impossible de se connecter au front-end"

echo "=== Test de connectivité vers l'API ==="
curl -I http://localhost:3000 || echo "❌ Impossible de se connecter à l'API"

echo "=== Fin de la vérification ===" 