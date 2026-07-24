const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  /import \{ createServer as createViteServer \} from "vite";/,
  'import { createServer as createViteServer } from "vite";\nimport { allMovies } from "./src/data";'
);

fs.writeFileSync('server.ts', code, 'utf-8');
console.log("Patched server imports");
