const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/\n\s*\)\}\n\s*\)\}\n\s*<\/motion\.div>/g, '\n              )}\n            </motion.div>');

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Syntax 2 fixed");
