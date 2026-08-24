const fs = require('fs');

const jsName = fs.readdirSync('dist/assets').find(f => f.endsWith('.js'));
const cssName = fs.readdirSync('dist/assets').find(f => f.endsWith('.css'));

const indexHtml = fs.readFileSync('dist/index.html', 'utf8');

const setupScript = `
mkdir -p /var/www/vigilia/assets

cat << 'HTMLEOF' > /var/www/vigilia/index.html
${indexHtml}
HTMLEOF

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
`;

fs.writeFileSync('setup_nginx.sh', setupScript);
console.log('Setup script ready. JS file:', jsName, 'CSS file:', cssName);
