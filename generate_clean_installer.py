import os
import gzip
import base64
import json

files = {}
# read index.html
with open('dist/index.html', 'r', encoding='utf-8') as f:
    files['index.html'] = f.read()

# read assets
for fname in os.listdir('dist/assets'):
    fpath = os.path.join('dist/assets', fname)
    with open(fpath, 'rb') as f:
        files['assets/' + fname] = base64.b64encode(f.read()).decode('ascii')

payload = json.dumps(files).encode('utf-8')
compressed = gzip.compress(payload)
b64_data = base64.b64encode(compressed).decode('ascii')

print(f"Total Base64 length: {len(b64_data)}")

# Create a clean single python script that unpacks everything and configures Nginx
py_script = f'''#!/usr/bin/env python3
import os
import gzip
import base64
import json
import subprocess

B64_DATA = "{b64_data}"

print("-> Descompactando arquivos do sistema da Vigília...")
raw_json = gzip.decompress(base64.b64decode(B64_DATA)).decode('utf-8')
files = json.loads(raw_json)

target_dir = "/var/www/vigilia"
os.makedirs(os.path.join(target_dir, "assets"), exist_ok=True)

for rel_path, content in files.items():
    full_path = os.path.join(target_dir, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    if rel_path == "index.html":
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)
    else:
        with open(full_path, "wb") as f:
            f.write(base64.b64decode(content))
    print(f" [OK] Gravado: {{rel_path}}")

print("-> Configurando Nginx...")
nginx_conf = """server {{
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    root /var/www/vigilia;
    index index.html;

    location / {{
        try_files $uri $uri/ /index.html;
    }}

    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|json)$ {{
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }}
}}
"""

with open("/etc/nginx/sites-available/vigilia", "w") as f:
    f.write(nginx_conf)

if not os.path.exists("/etc/nginx/sites-enabled/vigilia"):
    try:
        os.symlink("/etc/nginx/sites-available/vigilia", "/etc/nginx/sites-enabled/vigilia")
    except Exception:
        pass

if os.path.exists("/etc/nginx/sites-enabled/default"):
    try:
        os.remove("/etc/nginx/sites-enabled/default")
    except Exception:
        pass

print("-> Ajustando permissões...")
subprocess.run(["chmod", "755", "/var", "/var/www", "/var/www/vigilia"])
subprocess.run(["chmod", "-R", "755", "/var/www/vigilia"])
subprocess.run(["chown", "-R", "www-data:www-data", "/var/www/vigilia"])

print("-> Reiniciando Nginx...")
subprocess.run(["systemctl", "restart", "nginx"])

print("\\n" + "="*58)
print("🎉 SUCESSO! O SITE DA VIGÍLIA ESTÁ 100% NO AR!")
print("👉 Acesse no seu navegador: http://37.60.236.23")
print("="*58 + "\\n")
'''

with open('instalar_vigilia.py', 'w', encoding='utf-8') as f:
    f.write(py_script)

print("instalar_vigilia.py gerado com sucesso!")
