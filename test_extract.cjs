const fs = require('fs');
const zlib = require('zlib');

const c1 = fs.readFileSync('chunk1.txt', 'utf8');
const c2 = fs.readFileSync('chunk2.txt', 'utf8');

const fullB64 = c1 + c2;
const decompressed = zlib.gunzipSync(Buffer.from(fullB64, 'base64')).toString('utf8');
const data = JSON.parse(decompressed);

console.log('HTML length:', data.html.length);
console.log('CSS file:', data.cssFile, 'CSS length:', Buffer.from(data.cssB64, 'base64').length);
console.log('JS file:', data.jsFile, 'JS length:', Buffer.from(data.jsB64, 'base64').length);
console.log('Test successful: TRUE');
