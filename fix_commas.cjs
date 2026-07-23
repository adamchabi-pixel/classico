const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Fix empty commas
code = code.replace(/,\s*,/g, ',');
// Fix trailing commas before }
code = code.replace(/,\s*\}/g, '}');

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Fixed empty commas");
