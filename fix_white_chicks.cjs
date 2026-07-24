const fs = require('fs');
let code = fs.readFileSync('src/data/imported_movies.ts', 'utf-8');

// The file is a massive JSON object exported as a variable.
// I will just use regex to remove the block for id: 83219aef79eeec58a306aac526257953

code = code.replace(/\{\s*"id"\s*:\s*"83219aef79eeec58a306aac526257953"[\s\S]*?(?=\{\s*"id"|\s*\]\s*;)/, '');

// wait, this is risky. Let's just parse it, filter it, and stringify it.
// Actually, it's `export const importedMoviesData = [ ... ]`
let dataMatch = code.match(/export const importedMoviesData = (\[[\s\S]*\]);/);
if (dataMatch) {
  let data = JSON.parse(dataMatch[1]);
  data = data.filter(m => m.id !== "83219aef79eeec58a306aac526257953");
  let newCode = "export const importedMoviesData = " + JSON.stringify(data, null, 2) + ";\n";
  fs.writeFileSync('src/data/imported_movies.ts', newCode, 'utf-8');
  console.log("Fixed importedMoviesData");
} else {
  console.log("Could not parse");
}
