// Let's create an installation script that clones the workspace files or pulls via a reliable base64 method in small chunks
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const jsName = fs.readdirSync('dist/assets').find(f => f.endsWith('.js'));
const cssName = fs.readdirSync('dist/assets').find(f => f.endsWith('.css'));

const jsBuf = fs.readFileSync(path.join('dist/assets', jsName));
const cssBuf = fs.readFileSync(path.join('dist/assets', cssName));
const htmlBuf = fs.readFileSync('dist/index.html');

const jsB64 = zlib.gzipSync(jsBuf).toString('base64');
const cssB64 = zlib.gzipSync(cssBuf).toString('base64');
const htmlStr = htmlBuf.toString('utf8');

console.log('JS Gzip Base64:', jsB64.length);
console.log('CSS Gzip Base64:', cssB64.length);

// CSS is small (11KB base64), JS is ~140KB base64 (3 chunks of 50KB)
fs.writeFileSync('css_b64.txt', cssB64);

const cSize = 48000;
const p1 = jsB64.slice(0, cSize);
const p2 = jsB64.slice(cSize, cSize * 2);
const p3 = jsB64.slice(cSize * 2);

fs.writeFileSync('js_p1.txt', p1);
fs.writeFileSync('js_p2.txt', p2);
fs.writeFileSync('js_p3.txt', p3);

console.log('p1:', p1.length, 'p2:', p2.length, 'p3:', p3.length);
