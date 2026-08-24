const fs = require('fs');
const path = require('path');

const files = {};
function collect(dir) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      collect(full);
    } else {
      files[full] = fs.readFileSync(full, 'utf8');
    }
  }
}
collect('src');
files['index.html'] = fs.readFileSync('index.html', 'utf8');
files['package.json'] = fs.readFileSync('package.json', 'utf8');
files['vite.config.ts'] = fs.readFileSync('vite.config.ts', 'utf8');
files['tsconfig.json'] = fs.readFileSync('tsconfig.json', 'utf8');

const jsonStr = JSON.stringify(files);
const b64 = Buffer.from(jsonStr).toString('base64');
fs.writeFileSync('installer.sh', `#!/bin/bash
set -e
echo "🚀 Instalando o App Vigília de Oração..."
mkdir -p /var/www/vigilia_src
cd /var/www/vigilia_src

cat << 'B64EOF' | base64 -d > files.json
${b64}
B64EOF

node -e "
const fs = require('fs');
const path = require('path');
const files = JSON.parse(fs.readFileSync('files.json', 'utf8'));
for (const [file, content] of Object.entries(files)) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, content);
}
console.log('✅ Arquivos extraídos com sucesso!');
"

echo "📦 Instalando dependências e compilando..."
npm install
npm run build

echo "📁 Copiando para /var/www/vigilia..."
mkdir -p /var/www/vigilia
rm -rf /var/www/vigilia/*
cp -r dist/* /var/www/vigilia/
chown -R www-data:www-data /var/www/vigilia

echo "⚙️ Configurando Nginx..."
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

echo "=========================================="
echo "🎉 APLICATIVO INSTALADO COM SUCESSO!"
echo "Acesse no navegador: http://37.60.236.23"
echo "=========================================="
`);
console.log('Installer generated! Size in bytes:', fs.statSync('installer.sh').size);
