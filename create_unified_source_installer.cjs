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
files['vite.config.ts'] = fs.readFileSync('vite.config.ts', 'utf8');
files['tsconfig.json'] = fs.readFileSync('tsconfig.json', 'utf8');

// package.json WITHOUT invalid packages
const pkg = {
  "name": "vigilia-app",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "vite build"
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "lucide-react": "^0.475.0",
    "motion": "^12.4.3",
    "qrcode.react": "^4.2.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwindcss": "^4.0.0",
    "vite": "^6.1.0"
  }
};
files['package.json'] = JSON.stringify(pkg, null, 2);

const jsonStr = JSON.stringify(files);
const b64 = Buffer.from(jsonStr).toString('base64');

const installer = `#!/bin/bash
set -e
echo "🚀 Compilando a versão 100% IDÊNTICA da Vigília..."

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
console.log('✅ Arquivos de código-fonte extraídos com sucesso!');
"

echo "📦 Instalando pacotes necessários..."
npm install --legacy-peer-deps

echo "⚡ Compilando o build de produção..."
npm run build

echo "📁 Publicando no Nginx..."
mkdir -p /var/www/vigilia
rm -rf /var/www/vigilia/*
cp -r dist/* /var/www/vigilia/
chown -R www-data:www-data /var/www/vigilia
chmod -R 755 /var/www/vigilia

echo "⚙️ Configurando o Nginx..."
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

    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/vigilia /etc/nginx/sites-enabled/vigilia
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo ""
echo "=========================================================="
echo "🎉 SUCESSO ABSOLUTO! A VERSÃO IDÊNTICA AO PREVIEW ESTÁ NO AR!"
echo "👉 Acesse no navegador: http://37.60.236.23"
echo "👉 Painel do Dirigente: http://37.60.236.23?modo=dirigente"
echo "👉 Participantes: http://37.60.236.23?modo=participante"
echo "=========================================================="
`;

fs.writeFileSync('install_full.sh', installer);
console.log('install_full.sh pronto! Tamanho:', fs.statSync('install_full.sh').size);
