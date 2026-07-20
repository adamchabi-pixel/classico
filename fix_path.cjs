const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');
code = code.replace("require('path').join", "path.join");
fs.writeFileSync('server.ts', code);
