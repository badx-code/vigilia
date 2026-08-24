const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const html = fs.readFileSync('dist/index.html', 'utf8');
const assets = fs.readdirSync('dist/assets');

const files = {
  'index.html': html,
};

for (const f of assets) {
  const buf = fs.readFileSync(path.join('dist/assets', f));
  files['assets/' + f] = buf.toString('base64');
}

const payload = JSON.stringify(files);
const gzipped = zlib.gzipSync(Buffer.from(payload)).toString('base64');

console.log('Gzipped Base64 length:', gzipped.length);

// Split into parts of 80,000 chars so they can easily be pasted or written
const chunkSize = 80000;
const numChunks = Math.ceil(gzipped.length / chunkSize);
console.log('Number of chunks:', numChunks);

let fullScript = `#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const b64 = \`${gzipped}\`;
const jsonStr = zlib.gunzipSync(Buffer.from(b64, 'base64')).toString('utf8');
const files = JSON.parse(jsonStr);

const targetDir = '/var/www/vigilia';
fs.mkdirSync(path.join(targetDir, 'assets'), { recursive: true });

for (const [relPath, content] of Object.entries(files)) {
  const fullPath = path.join(targetDir, relPath);
  if (relPath === 'index.html') {
    fs.writeFileSync(fullPath, content, 'utf8');
  } else {
    fs.writeFileSync(fullPath, Buffer.from(content, 'base64'));
  }
  console.log('Gravado:', relPath);
}

console.log('Instalação concluída com sucesso!');
`;

fs.writeFileSync('install_direct.js', fullScript);
console.log('Arquivo install_direct.js gerado com sucesso!');
