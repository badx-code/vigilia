const fs = require('fs');
const zlib = require('zlib');

const raw = fs.readFileSync('install_identical.sh');
const compressed = zlib.gzipSync(raw);
const b64 = compressed.toString('base64');

// We can split this into 3 parts or write a script that runs it
fs.writeFileSync('install_compressed.b64', b64);
console.log('Compressed base64 size:', b64.length);
