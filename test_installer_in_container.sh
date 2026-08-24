chmod +x install_full.sh
node -e "
const fs = require('fs');
const code = fs.readFileSync('install_full.sh', 'utf8');
console.log('Script lines:', code.split('\n').length);
"
