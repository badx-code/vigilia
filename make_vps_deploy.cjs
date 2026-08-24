const fs = require('fs');

const html = fs.readFileSync('dist/index.html', 'utf8');
const cssFile = fs.readdirSync('dist/assets').find(f => f.endsWith('.css'));
const jsFile = fs.readdirSync('dist/assets').find(f => f.endsWith('.js'));

const css = fs.readFileSync('dist/assets/' + cssFile);
const js = fs.readFileSync('dist/assets/' + jsFile);

const cssB64 = css.toString('base64');
const jsB64 = js.toString('base64');

console.log('CSS file:', cssFile, 'Size b64:', cssB64.length);
console.log('JS file:', jsFile, 'Size b64:', jsB64.length);

// We can create a self-contained node server script or python web server that serves these exact assets!
// Or even simpler: curl/download or write via python script directly on the server.
