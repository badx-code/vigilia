const fs = require('fs');

const css = fs.readFileSync('dist/assets/index-jdxfETHn.css');
const js = fs.readFileSync('dist/assets/index-uACYN8hz.js');

const cssB64 = css.toString('base64');
const jsB64 = js.toString('base64');

console.log('CSS B64 length:', cssB64.length); // ~72KB
console.log('JS B64 length:', jsB64.length);   // ~569KB

// We can split JS into 2 parts of ~285KB each
const part1 = jsB64.slice(0, Math.floor(jsB64.length / 2));
const part2 = jsB64.slice(Math.floor(jsB64.length / 2));

fs.writeFileSync('css.b64', cssB64);
fs.writeFileSync('js1.b64', part1);
fs.writeFileSync('js2.b64', part2);

console.log('Part1 length:', part1.length, 'Part2 length:', part2.length);
