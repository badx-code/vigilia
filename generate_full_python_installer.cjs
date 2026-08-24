const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const jsName = fs.readdirSync('dist/assets').find(f => f.endsWith('.js'));
const cssName = fs.readdirSync('dist/assets').find(f => f.endsWith('.css'));

const jsBuf = fs.readFileSync(path.join('dist/assets', jsName));
const cssBuf = fs.readFileSync(path.join('dist/assets', cssName));
const htmlStr = fs.readFileSync('dist/index.html', 'utf8');

const files = {
  'index.html': htmlStr,
  ['assets/' + jsName]: jsBuf.toString('base64'),
  ['assets/' + cssName]: cssBuf.toString('base64')
};

const payload = JSON.stringify(files);
const gzipped = zlib.gzipSync(Buffer.from(payload)).toString('base64');

console.log('Gzipped payload base64 length:', gzipped.length);

const pyScript = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import sys
import gzip
import base64
import json
import subprocess

PAYLOAD = """${gzipped}"""

def main():
    print("==========================================================")
    print("🚀 INSTALANDO O SISTEMA IDÊNTICO AO PREVIEW NA VPS...")
    print("==========================================================")
    
    target_dir = "/var/www/vigilia"
    os.makedirs(os.path.join(target_dir, "assets"), exist_ok=True)
    
    print("-> Descompactando arquivos originais do preview...")
    raw = gzip.decompress(base64.b64decode(PAYLOAD.strip())).decode('utf-8')
    data = json.loads(raw)
    
    for rel_path, content in data.items():
        dest = os.path.join(target_dir, rel_path)
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        if rel_path == "index.html":
            with open(dest, "w", encoding="utf-8") as f:
                f.write(content)
        else:
            with open(dest, "wb") as f:
                f.write(base64.b64decode(content))
        print(f" [OK] Gravado: {rel_path} ({os.path.getsize(dest)} bytes)")
    
    print("-> Configurando Nginx para roteamento SPA...")
    nginx_conf = """server {
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
        add_header Cache-Control "public, no-transform";
    }
}
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
            
    print("-> Ajustando permissões de acesso www-data...")
    subprocess.run(["chmod", "755", "/var", "/var/www", "/var/www/vigilia"], check=False)
    subprocess.run(["chmod", "-R", "755", "/var/www/vigilia"], check=False)
    subprocess.run(["chown", "-R", "www-data:www-data", "/var/www/vigilia"], check=False)
    
    print("-> Reiniciando servidor Nginx...")
    subprocess.run(["systemctl", "restart", "nginx"], check=False)
    
    print("\\n" + "="*58)
    print("🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO!")
    print("👉 Acesse no seu navegador: http://37.60.236.23")
    print("==========================================================\\n")

if __name__ == '__main__':
    main()
`;

fs.writeFileSync('deploy_preview.py', pyScript);
console.log('deploy_preview.py gerado com sucesso!');
