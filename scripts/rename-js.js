const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, '../dist/browser');

// Rename background.js and content.js if they exist
const files = [
  { src: 'background.js', dest: 'background.js' },
  { src: 'content.js', dest: 'content.js' }
];

files.forEach(file => {
  const srcPath = path.join(distPath, file.src);
  const destPath = path.join(distPath, file.dest);

  if (fs.existsSync(srcPath)) {
    console.log(`✓ ${file.src} already in place`);
  } else {
    console.log(`✗ ${file.src} not found`);
  }
});

console.log('Build scripts ready for Chrome extension');
