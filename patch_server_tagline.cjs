const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/title: isTv \? m\.name : m\.title,/, `tagline: m.tagline || "",
      title: isTv ? m.name : m.title,`);

fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Patched server.ts tagline.");
