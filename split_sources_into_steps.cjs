const fs = require('fs');

const part1 = fs.readFileSync('part1.txt', 'utf8');
const part2 = fs.readFileSync('part2.txt', 'utf8');
const part3 = fs.readFileSync('part3.txt', 'utf8');

console.log('Part1 exists:', part1.length > 0);
console.log('Part2 exists:', part2.length > 0);
console.log('Part3 exists:', part3.length > 0);
