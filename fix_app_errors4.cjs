const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/<\/p>\s*\)\}\s*<\/div>/, '</p>\n        </div>');

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Fixed trailing parenthesis");
