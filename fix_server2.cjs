const fs = require('fs');
let lines = fs.readFileSync('server.ts', 'utf-8').split('\n');

let startDelete = 924; // index 924 is line 925 "    const TMDB_ACCESS_TOKEN ="
let endDelete = 975; // line 976 is "});" index 975, wait let's look at output of 965-980

// Let's just find "app.post("/api/admin/collections/modify"" and delete everything from 925 until that.
let modifyIndex = lines.findIndex(l => l.includes('app.post("/api/admin/collections/modify"'));
if (modifyIndex > 924) {
  lines.splice(924, modifyIndex - 924);
}

fs.writeFileSync('server.ts', lines.join('\n'), 'utf-8');
console.log("Fixed server.ts duplicated code.");
