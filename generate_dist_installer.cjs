const fs = require('fs');

const distTar = fs.readFileSync('dist.tar.gz');
const b64 = distTar.toString('base64');

const script = `#!/bin/bash
set -e
echo "🚀 Instalando o App da Vigília no Nginx..."

mkdir -p /var/www/vigilia
cd /var/www/vigilia

cat << 'B64DIST' | base64 -d > dist.tar.gz
${b64}
B64DIST

tar -xzf dist.tar.gz
rm -f dist.tar.gz
chown -R www-data:www-data /var/www/vigilia
chmod -R 755 /var/www/vigilia

echo "⚙️ Configurando o Nginx..."
cat << 'NGINXEOF' > /etc/nginx/sites-available/vigilia
server {
    listen 80;
    server_name _;

    root /var/www/vigilia;
    index index.html;

    location / {
        try_files \\$uri \\$uri/ /index.html;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/vigilia /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo ""
echo "=================================================="
echo "🎉 PRONTO! O APLICATIVO JÁ ESTÁ NO AR!"
echo "👉 Acesse: http://37.60.236.23"
echo "👉 Participantes: http://37.60.236.23?modo=participante"
echo "👉 Dirigentes: http://37.60.236.23?modo=dirigente"
echo "=================================================="
`;

fs.writeFileSync('install_dist.sh', script);
console.log('Script pronto! Tamanho:', fs.statSync('install_dist.sh').size);
