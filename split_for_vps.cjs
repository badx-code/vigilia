const fs = require('fs');

const fullB64 = fs.readFileSync('install_direct.js', 'utf8').match(/const b64 = `([^`]+)`;/)[1];
console.log('Total length:', fullB64.length);

const half = Math.ceil(fullB64.length / 2);
const part1 = fullB64.slice(0, half);
const part2 = fullB64.slice(half);

const script1 = `mkdir -p /var/www/vigilia/assets
cd /var/www/vigilia

cat << 'P1EOF' > /tmp/vig_part1.txt
${part1}
P1EOF

echo "✅ Bloco 1/2 salvo com sucesso! Agora cole o Bloco 2."
`;

const script2 = `cat << 'P2EOF' > /tmp/vig_part2.txt
${part2}
P2EOF

node -e "
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const p1 = fs.readFileSync('/tmp/vig_part1.txt', 'utf8').trim();
const p2 = fs.readFileSync('/tmp/vig_part2.txt', 'utf8').trim();
const b64 = p1 + p2;

const jsonStr = zlib.gunzipSync(Buffer.from(b64, 'base64')).toString('utf8');
const files = JSON.parse(jsonStr);

const targetDir = '/var/www/vigilia';
fs.mkdirSync(path.join(targetDir, 'assets'), { recursive: true });

for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(targetDir, relPath);
  if (relPath === 'index.html') {
    fs.writeFileSync(fullPath, content, 'utf8');
  } else {
    fs.writeFileSync(fullPath, Buffer.from(content, 'base64'));
  }
  console.log('Arquivo gravado:', relPath);
}
"

rm -f /tmp/vig_part1.txt /tmp/vig_part2.txt

# Configurar Nginx
cat << 'NGINXEOF' > /etc/nginx/sites-available/vigilia
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    root /var/www/vigilia;
    index index.html;

    location / {
        try_files \\$uri \\$uri/ /index.html;
    }

    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|json)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/vigilia /etc/nginx/sites-enabled/vigilia
rm -f /etc/nginx/sites-enabled/default

chmod 755 /var /var/www /var/www/vigilia
chmod -R 755 /var/www/vigilia
chown -R www-data:www-data /var/www/vigilia

systemctl restart nginx

echo ""
echo "=========================================================="
echo "🎉 PRONTO! O SITE ESTÁ NO AR E 100% FUNCIONANDO!"
echo "👉 Acesse no seu navegador: http://37.60.236.23"
echo "=========================================================="
`;

fs.writeFileSync('bloco1.sh', script1);
fs.writeFileSync('bloco2.sh', script2);
console.log('Bloco 1 tamanho:', script1.length, 'Bloco 2 tamanho:', script2.length);
