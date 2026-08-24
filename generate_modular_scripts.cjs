const fs = require('fs');
const path = require('path');

// We will generate 3 simple shell script snippets that create all source files in /var/www/vigilia_src
// Snippet 1: Base setup & Types & Data & Utils
// Snippet 2: Components & Context
// Snippet 3: Views & App.tsx & Build & Nginx

const types = fs.readFileSync('src/types.ts', 'utf8');
const defaultData = fs.readFileSync('src/data/defaultData.ts', 'utf8');
const timeUtils = fs.readFileSync('src/utils/timeUtils.ts', 'utf8');
const indexCss = fs.readFileSync('src/index.css', 'utf8');
const mainTsx = fs.readFileSync('src/main.tsx', 'utf8');
const indexHtml = fs.readFileSync('index.html', 'utf8');
const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
const tsconfig = fs.readFileSync('tsconfig.json', 'utf8');
const pkg = fs.readFileSync('clean_package.json', 'utf8');

console.log('Base files ready.');
