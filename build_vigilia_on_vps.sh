#!/usr/bin/env bash
set -e

echo "=== 1. Instalar dependências necessárias no VPS ==="
apt-get update -y
apt-get install -y curl nginx git build-essential

# Garantir Node.js 20+
if ! command -v node &> /dev/null || [ "$(node -v | cut -d'.' -f1 | tr -d 'v')" -lt 18 ]; then
    echo "Instalando Node.js LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

echo "=== 2. Clonar ou preparar pasta do projeto ==="
rm -rf /opt/vigilia-build
mkdir -p /opt/vigilia-build /var/www/vigilia

