import fs from 'fs';

const b64 = fs.readFileSync('/tmp/src_update.b64', 'utf8');

const script = `cd /root/vigilia-planner || exit 1
cat << 'EOF' | base64 -d | tar -xzf -
${b64}
EOF
rm -f src/views/AdminMasterView.tsx
npm run build
rm -rf /var/www/html/*
cp -r /root/vigilia-planner/dist/* /var/www/html/
systemctl reload nginx
echo "========================================="
echo "   VIGÍLIA PLANNER ATUALIZADO COM SUCESSO!  "
echo "========================================="
`;

fs.writeFileSync('deploy_command.sh', script);
console.log('Script written, total length:', script.length);
