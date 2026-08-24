const fs = require('fs');

// We have dist/index.html, dist/assets/index-jdxfETHn.css, dist/assets/index-uACYN8hz.js
// Let's create a git commit script or simple node script that runs on their server.
const html = fs.readFileSync('dist/index.html', 'utf8');
const cssFile = fs.readdirSync('dist/assets').find(f => f.endsWith('.css'));
const jsFile = fs.readdirSync('dist/assets').find(f => f.endsWith('.js') && !f.endsWith('.tar.gz'));

console.log('HTML:', html);
console.log('CSS file:', cssFile);
console.log('JS file:', jsFile);
