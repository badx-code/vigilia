const fs = require('fs');
const path = require('path');

const files = {};
function collect(dir) {
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      collect(full);
    } else {
      files[full] = fs.readFileSync(full, 'utf8');
    }
  }
}
collect('src');
files['index.html'] = fs.readFileSync('index.html', 'utf8');
files['vite.config.ts'] = fs.readFileSync('vite.config.ts', 'utf8');
files['tsconfig.json'] = fs.readFileSync('tsconfig.json', 'utf8');
files['package.json'] = fs.readFileSync('clean_package.json', 'utf8');

// Group into 2 parts
const keys = Object.keys(files);
const group1 = {};
const group2 = {};

keys.forEach((k, idx) => {
  if (idx < Math.ceil(keys.length / 2)) {
    group1[k] = files[k];
  } else {
    group2[k] = files[k];
  }
});

const b64_1 = Buffer.from(JSON.stringify(group1)).toString('base64');
const b64_2 = Buffer.from(JSON.stringify(group2)).toString('base64');

console.log('Group1 size:', b64_1.length, 'Group2 size:', b64_2.length);

fs.writeFileSync('step1_b64.txt', b64_1);
fs.writeFileSync('step2_b64.txt', b64_2);
