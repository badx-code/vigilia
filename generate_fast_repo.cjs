const fs = require('fs');

// We have dist/index.html, dist/assets/index-jdxfETHn.css, dist/assets/index-uACYN8hz.js
const cssFile = fs.readdirSync('dist/assets').find(f => f.endsWith('.css'));
const jsFile = fs.readdirSync('dist/assets').find(f => f.endsWith('.js') && !f.endsWith('.tar.gz'));

console.log('Files to install:', cssFile, jsFile);
