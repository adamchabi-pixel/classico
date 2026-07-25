const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `  const lowerTitle = (m.title || '').toLowerCase();`;
const replacement = `  const lowerTitle = (m.title || m.name || m.originalTitle || '').toLowerCase();`;

content = content.replace(target, replacement);
fs.writeFileSync('src/App.tsx', content);
console.log('done updating filter');
