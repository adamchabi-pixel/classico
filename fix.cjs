const fs = require('fs');
const lines = fs.readFileSync('server.ts', 'utf-8').split('\n');

const fixedLines = [];
let skip = false;
for (let i = 0; i < lines.length; i++) {
  if (i === 884) {
    // line 885 in 1-index is `    const TMDB_ACCESS_TOKEN = ...`
    skip = true;
  }
  if (skip && i === 912) { // line 913 is `});`
    skip = false;
    continue;
  }
  if (!skip) {
    fixedLines.push(lines[i]);
  }
}

fs.writeFileSync('server.ts', fixedLines.join('\n'), 'utf-8');
console.log("Fixed.");
