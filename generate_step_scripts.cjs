const fs = require('fs');

const c1 = fs.readFileSync('chunk1.txt', 'utf8');
const c2 = fs.readFileSync('chunk2.txt', 'utf8');

const s1 = `mkdir -p /var/www/vigilia/assets
cd /var/www/vigilia

cat << 'CH1EOF' > /tmp/v_chunk1.txt
${c1}
CH1EOF

echo "✅ Parte 1/2 gravada com sucesso!"
`;

const s2 = `cat << 'CH2EOF' > /tmp/v_chunk2.txt
${c2}
CH2EOF

node -e "
const fs = require('fs');
const zlib = require('zlib');

const c1 = fs.readFileSync('/tmp/v_chunk1.txt', 'utf8').trim();
const c2 = fs.readFileSync('/tmp/v_chunk2.txt', 'utf8').trim();
const full = c1 + c2;

const decompressed = zlib.gunzipSync(Buffer.from(full, 'base64')).toString('utf8');
const data = JSON.parse(decompressed);

fs.writeFileSync('/var/www/vigilia/index.html', data.html);
fs.writeFileSync('/var/www/vigilia/assets/' + data.cssFile, Buffer.from(data.cssB64, 'base64'));
fs.writeFileSync('/var/www/vigilia/assets/' + data.jsFile, Buffer.from(data.jsB64, 'base64'));

console.log('✅ Arquivos da versão rica e completa extraídos com sucesso!');
"

rm -f /tmp/v_chunk1.txt /tmp/v_chunk2.txt

# Configurar o Nginx
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

chown -R www-data:www-data /var/www/vigilia
chmod -R 755 /var/www/vigilia
chmod 755 /var /var/www /var/www/vigilia
systemctl restart nginx

echo ""
echo "=========================================================="
echo "🎉 A VERSÃO RICA E COMPLETA DO PREVIEW ESTÁ NO AR!"
echo "👉 Acesse: http://37.60.236.23"
echo "=========================================================="
`;

fs.writeFileSync('step1_run.sh', s1);
fs.writeFileSync('step2_run.sh', s2);

console.log('Scripts prontos!');
