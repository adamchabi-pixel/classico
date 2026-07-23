const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/    const delayDebounceFn = setTimeout\(\(\) => \{/g, "");
code = code.replace(/    \}, 500\);\n    return \(\) => clearTimeout\(delayDebounceFn\);/g, "");

fs.writeFileSync('src/App.tsx', code, 'utf-8');
console.log("Patched timeout manually");
