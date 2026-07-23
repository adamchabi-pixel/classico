const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/next\(\);/, 'next();\n});');

fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Fixed missing closing brace");
