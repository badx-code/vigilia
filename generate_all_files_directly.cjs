const fs = require('fs');
const path = require('path');

// Let's create an installation script that writes the exact typescript/react files to /var/www/vigilia_src on the user's server
// and runs npm install && npm run build.
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
console.log('Collected files in src:', Object.keys(files));
