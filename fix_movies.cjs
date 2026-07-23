const fs = require('fs');
const lines = fs.readFileSync('src/data/all_movies.ts', 'utf-8').split('\n');

const newLines = [];
let skip = false;

for (let i = 0; i < lines.length; i++) {
  if (i === 2606) {
    // line 2607 is index 2606
    newLines.push('    "description": "Super-assassin John Wick returns with a $14 million price tag on his head and an army of bounty-hunting killers on his trail. After killing a member of the shadowy international assassin’s guild, the High Table, John Wick is excommunicado, but the world’s most ruthless hit men and women await his every turn.",');
    skip = true;
  }
  
  if (i === 8307) { // line 8308 is index 8307
    skip = false;
    continue; // skip line 8308 since we included it in 2607
  }
  
  if (!skip) {
    newLines.push(lines[i]);
  }
}

fs.writeFileSync('src/data/all_movies.ts', newLines.join('\n'), 'utf-8');
