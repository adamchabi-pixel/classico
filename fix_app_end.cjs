const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace any trailing junk with properly closed App function
const cleanContent = content.replace(/  \);\n\}\)[\}]+$/, '  );\n}\n');

fs.writeFileSync('src/App.tsx', cleanContent);
