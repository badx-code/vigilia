const fs = require('fs');

const code = fs.readFileSync('instalar_vigilia.py', 'utf8');
const match = code.match(/B64_DATA = "([^"]+)"/);
const b64 = match[1];

// Let's create 6 small chunks (~45KB each) to never get truncated in messages
const chunkSize = 45000;
const numChunks = Math.ceil(b64.length / chunkSize);
console.log('Total length:', b64.length, 'Num chunks:', numChunks);

let chunks = [];
for (let i = 0; i < numChunks; i++) {
  chunks.push(b64.slice(i * chunkSize, (i + 1) * chunkSize));
}

for (let i = 0; i < numChunks; i++) {
  fs.writeFileSync(`chunk_${i + 1}.txt`, chunks[i]);
}

console.log('Saved all chunks!');
