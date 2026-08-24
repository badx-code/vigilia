const fs = require('fs');
fs.mkdirSync('public', { recursive: true });
fs.copyFileSync('dist/dist_vigilia.tar.gz', 'public/dist_vigilia.tar.gz');
console.log('Copied to public/dist_vigilia.tar.gz');
