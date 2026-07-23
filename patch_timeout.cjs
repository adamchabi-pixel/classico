const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

const targetRegex = /    const delayDebounceFn = setTimeout\(\(\) => \{([\s\S]*?)\}, 500\);\n    return \(\) => clearTimeout\(delayDebounceFn\);/;
const match = code.match(targetRegex);
if (match) {
  code = code.replace(targetRegex, match[1]);
  fs.writeFileSync('src/App.tsx', code, 'utf-8');
  console.log("Removed setTimeout");
} else {
  console.log("Not found");
}
