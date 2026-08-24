const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Read files
const html = fs.readFileSync('dist/index.html', 'utf8');
const cssFile = fs.readdirSync('dist/assets').find(f => f.endsWith('.css'));
const jsFile = fs.readdirSync('dist/assets').find(f => f.endsWith('.js') && !f.endsWith('.tar.gz'));

const css = fs.readFileSync('dist/assets/' + cssFile);
const js = fs.readFileSync('dist/assets/' + jsFile);

const files = {
  'index.html': Buffer.from(html).toString('base64'),
  ['assets/' + cssFile]: css.toString('base64'),
  ['assets/' + jsFile]: js.toString('base64')
};

const script = `#!/bin/bash
set -e
echo "🚀 Instalando a versão 100% IDÊNTICA do App da Vigília no Nginx..."

mkdir -p /var/www/vigilia/assets
cd /var/www/vigilia

echo "📄 Escrevendo index.html..."
cat << 'INDEX_EOF' | base64 -d > index.html
${files['index.html']}
INDEX_EOF

echo "🎨 Escrevendo CSS (${cssFile})..."
cat << 'CSS_EOF' | base64 -d > assets/${cssFile}
${files['assets/' + cssFile]}
CSS_EOF

echo "⚡ Escrevendo JavaScript (${jsFile})..."
cat << 'JS_EOF' | base64 -d > assets/${jsFile}
${files['assets/' + jsFile]}
JS_EOF

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
echo "========================================================"
echo "🎉 A VERSÃO COMPLETA E IDÊNTICA AO PREVIEW ESTÁ NO AR!"
echo "👉 Acesse: http://37.60.236.23"
echo "========================================================"
`;

fs.writeFileSync('install_identical.sh', script);
console.log('Script gerado com sucesso! Tamanho:', fs.statSync('install_identical.sh').size);
