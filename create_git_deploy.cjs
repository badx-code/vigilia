const fs = require('fs');

// We can create a simple node script that directly fetches the source or builds with esbuild/vite without problem!
// Remember in the previous step npm install failed ONLY because of "@google/genai": "^0.1.1".
// If we install without that or install with standard dependencies, npm run build in their server will take only 15 seconds!
