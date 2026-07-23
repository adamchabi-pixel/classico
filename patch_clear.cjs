const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/setSearchQuery\(""\);/g, `setSearchQuery(""); setSearchInput("");`);

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched all setSearchQuery calls");
