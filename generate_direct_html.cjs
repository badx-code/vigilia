const fs = require('fs');
const path = require('path');

const jsFile = fs.readdirSync('dist/assets').find(f => f.endsWith('.js'));
const cssFile = fs.readdirSync('dist/assets').find(f => f.endsWith('.css'));

const jsCode = fs.readFileSync(path.join('dist/assets', jsFile), 'utf8');
const cssCode = fs.readFileSync(path.join('dist/assets', cssFile), 'utf8');

console.log('JS Size:', (jsCode.length / 1024).toFixed(1), 'KB');
console.log('CSS Size:', (cssCode.length / 1024).toFixed(1), 'KB');
