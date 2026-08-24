const fs = require('fs');

const pyCode = fs.readFileSync('deploy_preview.py', 'utf8');

// Let's divide pyCode into 3 parts of ~85KB each
const totalLen = pyCode.length;
const partLen = Math.ceil(totalLen / 3);

const p1 = pyCode.slice(0, partLen);
const p2 = pyCode.slice(partLen, partLen * 2);
const p3 = pyCode.slice(partLen * 2);

console.log('Total len:', totalLen, 'p1:', p1.length, 'p2:', p2.length, 'p3:', p3.length);

const step1 = `mkdir -p /var/www/vigilia/assets /opt/vigilia-deploy
cat << 'P1EOF' > /tmp/deploy_p1.txt
${p1}
P1EOF
echo "✅ ETAPA 1/3 CONCLUÍDA! Cole a Etapa 2 agora."
`;

const step2 = `cat << 'P2EOF' > /tmp/deploy_p2.txt
${p2}
P2EOF
echo "✅ ETAPA 2/3 CONCLUÍDA! Cole a Etapa 3 agora."
`;

const step3 = `cat << 'P3EOF' > /tmp/deploy_p3.txt
${p3}
P3EOF

cat /tmp/deploy_p1.txt /tmp/deploy_p2.txt /tmp/deploy_p3.txt > /tmp/deploy_preview.py
rm -f /tmp/deploy_p1.txt /tmp/deploy_p2.txt /tmp/deploy_p3.txt

python3 /tmp/deploy_preview.py
`;

fs.writeFileSync('etapa1.sh', step1);
fs.writeFileSync('etapa2.sh', step2);
fs.writeFileSync('etapa3.sh', step3);

console.log('Etapas 1, 2 e 3 geradas com sucesso!');
