const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const html = fs.readFileSync('dist/index.html', 'utf8');
const cssFile = fs.readdirSync('dist/assets').find(f => f.endsWith('.css'));
const jsFile = fs.readdirSync('dist/assets').find(f => f.endsWith('.js'));

const css = fs.readFileSync('dist/assets/' + cssFile);
const js = fs.readFileSync('dist/assets/' + jsFile);

// Create a tar.gz with dist/
// Or simpler: an installation node script that writes them
const payload = {
  html: html,
  cssFile: cssFile,
  cssB64: css.toString('base64'),
  jsFile: jsFile,
  jsB64: js.toString('base64')
};

const payloadGzip = zlib.gzipSync(Buffer.from(JSON.stringify(payload))).toString('base64');
console.log('Payload Gzip Base64 length:', payloadGzip.length);

// Split in 2 chunks
const mid = Math.ceil(payloadGzip.length / 2);
const chunk1 = payloadGzip.slice(0, mid);
const chunk2 = payloadGzip.slice(mid);

fs.writeFileSync('chunk1.txt', chunk1);
fs.writeFileSync('chunk2.txt', chunk2);
console.log('Chunk 1 size:', chunk1.length, 'Chunk 2 size:', chunk2.length);
