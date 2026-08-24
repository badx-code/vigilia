const fs = require('fs');

const code = fs.readFileSync('instalar_vigilia.py', 'utf8');
const match = code.match(/B64_DATA = "([^"]+)"/);
const b64 = match[1];

const half = Math.floor(b64.length / 2);
const p1 = b64.slice(0, half);
const p2 = b64.slice(half);

const block1 = `mkdir -p /var/www/vigilia/assets
cat << 'P1EOF' > /tmp/vig_p1.txt
${p1}
P1EOF
echo ""
echo "=========================================================="
echo "✅ PARTE 1/2 SALVA! AGORA COPIE E COLE A PARTE 2 ABAIXO:"
echo "=========================================================="
`;

const block2 = `cat << 'P2EOF' > /tmp/vig_p2.txt
${p2}
P2EOF

cat << 'SCRIPT' > /tmp/instalar.py
import os, gzip, base64, json, subprocess

with open('/tmp/vig_p1.txt', 'r') as f:
    p1 = f.read().strip()
with open('/tmp/vig_p2.txt', 'r') as f:
    p2 = f.read().strip()

b64_data = p1 + p2
raw_json = gzip.decompress(base64.b64decode(b64_data)).decode('utf-8')
files = json.loads(raw_json)

target_dir = '/var/www/vigilia'
os.makedirs(os.path.join(target_dir, 'assets'), exist_ok=True)

for rel_path, content in files.items():
    full_path = os.path.join(target_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    if rel_path == 'index.html':
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
    else:
        with open(full_path, 'wb') as f:
            f.write(base64.b64decode(content))
    print(f'Gravado com sucesso: {rel_path}')

nginx_conf = """server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    root /var/www/vigilia;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|json)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
}"""

with open('/etc/nginx/sites-available/vigilia', 'w') as f:
    f.write(nginx_conf)

if not os.path.exists('/etc/nginx/sites-enabled/vigilia'):
    try:
        os.symlink('/etc/nginx/sites-available/vigilia', '/etc/nginx/sites-enabled/vigilia')
    except Exception:
        pass

if os.path.exists('/etc/nginx/sites-enabled/default'):
    try:
        os.remove('/etc/nginx/sites-enabled/default')
    except Exception:
        pass

subprocess.run(['chmod', '755', '/var', '/var/www', '/var/www/vigilia'])
subprocess.run(['chmod', '-R', '755', '/var/www/vigilia'])
subprocess.run(['chown', '-R', 'www-data:www-data', '/var/www/vigilia'])
subprocess.run(['systemctl', 'restart', 'nginx'])
SCRIPT

python3 /tmp/instalar.py
rm -f /tmp/vig_p1.txt /tmp/vig_p2.txt /tmp/instalar.py

echo ""
echo "=========================================================="
echo "🎉 PRONTO! SEU SITE ESTÁ 100% NO AR E IDÊNTICO AO PREVIEW!"
echo "👉 Acesse no seu navegador: http://37.60.236.23"
echo "=========================================================="
`;

fs.writeFileSync('bloco1.txt', block1);
fs.writeFileSync('bloco2.txt', block2);
console.log('Blocos gerados com sucesso!');
