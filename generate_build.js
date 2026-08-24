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
files['package.json'] = fs.readFileSync('package.json', 'utf8');
files['vite.config.ts'] = fs.readFileSync('vite.config.ts', 'utf8');
files['tsconfig.json'] = fs.readFileSync('tsconfig.json', 'utf8');

fs.writeFileSync('all_files.json', JSON.stringify(files));
console.log('Total files collected:', Object.keys(files).length);
