const fs = require('fs');

// Let's create a script that builds the project using esbuild/vite directly on the server without any problematic dependencies
const pkg = {
  "name": "vigilia-app",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "vite build"
  },
  "dependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "lucide-react": "^0.475.0",
    "motion": "^12.4.3",
    "qrcode.react": "^4.2.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwindcss": "^4.0.0",
    "vite": "^6.1.0"
  }
};

fs.writeFileSync('clean_package.json', JSON.stringify(pkg, null, 2));
console.log('Clean package.json ready!');
