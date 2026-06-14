const fs = require('fs');
const path = require('path');

const filePath = path.join(
  __dirname,
  '..',
  'node_modules',
  '@expo',
  'cli',
  'build',
  'src',
  'start',
  'server',
  'metro',
  'externals.js'
);

if (!fs.existsSync(filePath)) {
  console.warn('Expo CLI externals file not found; skipping Node externals patch.');
  process.exit(0);
}

const source = fs.readFileSync(filePath, 'utf8');
const marker = '.filter((x)=>!/^_|^(internal|v8|node-inspect)\\/|\\//.test(x) && ![';
const replacement = '.map((x)=>x.replace(/^node:/, "")).filter((x)=>!/^_|^(internal|v8|node-inspect)\\/|\\//.test(x) && ![';

if (source.includes(replacement)) {
  console.log('Expo CLI Node externals patch already applied.');
  process.exit(0);
}

if (!source.includes(marker)) {
  console.warn('Expo CLI externals format changed; skipping Node externals patch.');
  process.exit(0);
}

fs.writeFileSync(filePath, source.replace(marker, replacement));
console.log('Patched Expo CLI Node externals for Windows and Node 24.');
