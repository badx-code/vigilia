
mkdir -p /var/www/vigilia/assets

cat << 'HTMLEOF' > /var/www/vigilia/index.html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vigília — Gestão e Cronograma</title>
    <meta name="description" content="Sistema completo para organização de vigílias, cronogramas, equipes e oração." />
    <meta name="theme-color" content="#0B0D10" />
    <script type="module" crossorigin src="/assets/index-D03Rvftc.js"></script>
    <link rel="stylesheet" crossorigin href="/assets/index-lYpGpA5Z.css">
  </head>
  <body class="bg-[#0B0D10] text-[#F2F2F2] antialiased selection:bg-[#C9B27C] selection:text-[#0B0D10]">
    <div id="root"></div>
  </body>
</html>


HTMLEOF

cat << 'NGINXEOF' > /etc/nginx/sites-available/vigilia
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    root /var/www/vigilia;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|json)$ {
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
