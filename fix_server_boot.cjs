const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/\/\/ Delete local caches on boot to ensure fresh posters[\s\S]*?\} catch\(e\) \{\}/g, '');

fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Fixed server boot cache deletion");
