const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  'import express from "express";\\nimport compression from "compression";',
  'import express from "express";\\nimport compression from "compression";'
);
code = code.replace(
  'const app = express();\\napp.use(compression());',
  'const app = express();\\napp.use(compression());'
);

fs.writeFileSync('server.ts', code, 'utf-8');
