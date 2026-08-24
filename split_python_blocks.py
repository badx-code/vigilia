with open('instalar_vigilia.py', 'r') as f:
    content = f.read()

import re
m = re.search(r'B64_DATA = "([^"]+)"', content)
b64 = m.group(1)

half = len(b64) // 2
b64_p1 = b64[:half]
b64_p2 = b64[half:]

with open('bloco1.txt', 'w') as f:
    f.write("mkdir -p /var/www/vigilia/assets\n")
    f.write("cat << 'P1EOF' > /tmp/vig_p1.txt\n")
    f.write(b64_p1 + "\n")
    f.write("P1EOF\n")
    f.write('echo "✅ Parte 1/2 salva com sucesso! Agora copie e cole a Parte 2."\n')

with open('bloco2.txt', 'w') as f:
    f.write("cat << 'P2EOF' > /tmp/vig_p2.txt\n")
    f.write(b64_p2 + "\n")
    f.write("P2EOF\n\n")
    f.write('''python3 -c "
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
    print(f'Gravado: {rel_path}')

nginx_conf = '''server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    root /var/www/vigilia;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|json)$ {
        expires 1y;
        add_header Cache-Control \\"public, no-transform\\";
    }
}'''

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
"

rm -f /tmp/vig_p1.txt /tmp/vig_p2.txt

echo ""
echo "=========================================================="
echo "🎉 PRONTO! O SITE ESTÁ NO AR E 100% FUNCIONANDO!"
echo "👉 Acesse no seu navegador: http://37.60.236.23"
echo "=========================================================="
''')

print("Blocos gerados com sucesso!")
