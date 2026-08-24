const fs = require('fs');

const b64 = fs.readFileSync('install_full.sh').toString('base64');
console.log('Total install_full.sh base64 size:', b64.length); // ~574KB

// Split into 3 parts of ~191KB each
const p1 = b64.slice(0, 191000);
const p2 = b64.slice(191000, 382000);
const p3 = b64.slice(382000);

fs.writeFileSync('part1.txt', p1);
fs.writeFileSync('part2.txt', p2);
fs.writeFileSync('part3.txt', p3);
console.log('Part sizes:', p1.length, p2.length, p3.length);
