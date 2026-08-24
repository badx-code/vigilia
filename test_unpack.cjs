const fs = require('fs');
const path = require('path');

const g1 = JSON.parse(Buffer.from(fs.readFileSync('step1_b64.txt', 'utf8'), 'base64').toString('utf8'));
const g2 = JSON.parse(Buffer.from(fs.readFileSync('step2_b64.txt', 'utf8'), 'base64').toString('utf8'));

const total = { ...g1, ...g2 };
console.log('Total files ready to be created on VPS:', Object.keys(total).length);
