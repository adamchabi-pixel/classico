const fs = require('fs');
let lines = fs.readFileSync('server.ts', 'utf-8').split('\n');

let startDelete = 853; // line 854 is index 853: "      if (findRes.ok) {"
let endDelete = 902; // line 903 is index 902: "});"

lines.splice(startDelete, endDelete - startDelete + 1);

fs.writeFileSync('server.ts', lines.join('\n'), 'utf-8');
console.log("Fixed server.ts syntax.");
