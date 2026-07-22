const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  'import express from "express";\\\\nimport compression from "compression";',
  'import express from "express";\\nimport compression from "compression";'
);
code = code.replace(
  'const app = express();\\\\napp.use(compression());',
  'const app = express();\\napp.use(compression());'
);

// Actually, maybe it's just one slash? Let's just use regex.
code = code.replace(/import express from "express";\\nimport compression from "compression";/g, 'import express from "express";\\nimport compression from "compression";');
code = code.replace(/const app = express\(\);\\napp\.use\(compression\(\)\);/g, 'const app = express();\\napp.use(compression());');

fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Fixed server literal slash n");
